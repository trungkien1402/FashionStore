using System.Data;
using System.Text.Json;
using FashionStore.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Data;

internal static class ProductCatalogSnapshot
{
    internal const string RelativePath = "Data/product-catalog.snapshot.json";

    private record CategoryData(string Slug, string Name, bool IsActive);
    private record VariantData(string SKU, string Size, string Color, decimal Price, int StockQuantity, bool IsActive);
    private record ProductData(string Slug, string Name, string Description, decimal Price, string ImageUrl,
        string? ShowroomAudience, string? ShowroomKind, int ShowroomSortOrder, string? ShowroomMetadata,
        bool IsActive, DateTime CreatedAt, CategoryData Category, VariantData[] Variants);

    internal static async Task<int> ExportAsync(ApplicationDbContext db, string path)
    {
        var products = await db.Products.AsNoTracking().Include(p => p.Category).Include(p => p.Variants)
            .OrderBy(p => p.Id).ToListAsync();
        if (products.Count == 0) throw new InvalidOperationException("Database has no products to export.");

        var snapshot = products.Select(p => new ProductData(p.Slug, p.Name, p.Description, p.Price, p.ImageUrl,
            p.ShowroomAudience, p.ShowroomKind, p.ShowroomSortOrder, p.ShowroomMetadata, p.IsActive, p.CreatedAt,
            new CategoryData(p.Category.Slug, p.Category.Name, p.Category.IsActive),
            p.Variants.OrderBy(v => v.Id).Select(v => new VariantData(v.SKU, v.Size, v.Color, v.Price,
                v.StockQuantity, v.IsActive)).ToArray())).ToArray();

        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        var temporaryPath = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            await using (var stream = File.Create(temporaryPath))
                await JsonSerializer.SerializeAsync(stream, snapshot, new JsonSerializerOptions(JsonSerializerDefaults.Web)
                {
                    WriteIndented = true
                });
            File.Move(temporaryPath, path, overwrite: true);
        }
        finally
        {
            File.Delete(temporaryPath);
        }
        return snapshot.Length;
    }

    internal static async Task ImportIntoEmptyDatabaseAsync(ApplicationDbContext db, string path)
    {
        if (await db.Products.AnyAsync()) return;

        await using var stream = File.OpenRead(path);
        var snapshot = await JsonSerializer.DeserializeAsync<ProductData[]>(stream, ShowroomCatalog.JsonOptions);
        if (snapshot is not { Length: > 0 }) throw new InvalidDataException("Product catalog snapshot is empty.");

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        if (await db.Products.AnyAsync()) return;

        var categories = (await db.Categories.ToListAsync()).ToDictionary(c => c.Slug, StringComparer.OrdinalIgnoreCase);
        foreach (var item in snapshot)
        {
            if (!categories.TryGetValue(item.Category.Slug, out var category))
            {
                category = new Category { Slug = item.Category.Slug, Name = item.Category.Name, IsActive = item.Category.IsActive };
                categories.Add(category.Slug, category);
            }

            db.Products.Add(new Product
            {
                Category = category, Slug = item.Slug, Name = item.Name, Description = item.Description,
                Price = item.Price, ImageUrl = item.ImageUrl, IsActive = item.IsActive, CreatedAt = item.CreatedAt,
                ShowroomAudience = item.ShowroomAudience, ShowroomKind = item.ShowroomKind,
                ShowroomSortOrder = item.ShowroomSortOrder, ShowroomMetadata = item.ShowroomMetadata,
                Variants = item.Variants.Select(v => new ProductVariant
                {
                    SKU = v.SKU, Size = v.Size, Color = v.Color, Price = v.Price,
                    StockQuantity = v.StockQuantity, IsActive = v.IsActive
                }).ToList()
            });
        }
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
    }
}
