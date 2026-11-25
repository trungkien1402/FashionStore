using System.Data;
using System.Text.Json;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Data;

public static class LegacyLookbookSeed
{
    private sealed record Source(string Key, string Name, string? CoverUrl, SourceLook[] Looks);
    private sealed record SourceLook(string Name, string ImageUrl, SourceItem[] Items);
    private sealed record SourceItem(string Slug, double X, double Y);

    public static async Task ImportAsync(ApplicationDbContext db)
    {
        using var stream = typeof(LegacyLookbookSeed).Assembly
            .GetManifestResourceStream("FashionStore.Data.legacy-lookbooks.json")!;
        var sources = await JsonSerializer.DeserializeAsync<Source[]>(stream, ShowroomCatalog.JsonOptions) ?? [];
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var keys = await db.LookbookCollections.Where(c => c.SourceKey != null)
            .Select(c => c.SourceKey).ToListAsync();
        var pending = sources.Where(source => !keys.Contains(source.Key)).ToArray();
        if (pending.Length == 0) return;

        var slugs = pending.SelectMany(source => source.Looks)
            .SelectMany(look => look.Items).Select(item => item.Slug).Distinct().ToArray();
        var products = await db.Products.AsNoTracking().Where(p => slugs.Contains(p.Slug))
            .Include(p => p.Variants.Where(v => v.IsActive)).ToDictionaryAsync(p => p.Slug);
        foreach (var source in pending)
        {
            // Wait until the catalog contains the full set so the import never drops a look item.
            var items = source.Looks.SelectMany(look => look.Items);
            if (items.Any(item => !products.TryGetValue(item.Slug, out var product) || product.Variants.Count == 0))
                continue;

            var sale = source.Key == "legacy-sale";
            var collection = new LookbookCollection
            {
                SourceKey = source.Key,
                Name = sale ? "Nhanh Tay! Ưu Đãi Sắp Kết Thúc" : source.Name,
                Description = sale ? "Thời gian có hạn cho đợt ưu đãi độc quyền này. Hành động ngay để nhận những đặc quyền tốt nhất từ HNMTSHOP." : "",
                SaleNotice = sale ? "Ưu đãi giới hạn cho đợt Drop độc quyền tuần này. MUA NGAY KẺO HẾT!" : "",
                CoverUrl = source.CoverUrl ?? "",
                Background = source.Key == "sunwash" ? LookbookBackground.Sunwash : LookbookBackground.Noir,
                IsSale = sale,
                IsPublished = !sale,
                Looks = source.Looks.Select((look, index) => new LookbookLook
                {
                    Name = look.Name,
                    ImageUrl = look.ImageUrl,
                    SortOrder = index,
                    ProductsJson = JsonSerializer.Serialize(look.Items.Select(item =>
                    {
                        var product = products[item.Slug];
                        return new LookbookSelection
                        {
                            ProductId = product.Id,
                            Color = product.Variants.OrderBy(v => v.Id).First().Color,
                            X = item.X,
                            Y = item.Y
                        };
                    }), ShowroomCatalog.JsonOptions)
                }).ToList()
            };
            db.LookbookCollections.Add(collection);
        }

        await db.SaveChangesAsync();
        await transaction.CommitAsync();
    }
}
