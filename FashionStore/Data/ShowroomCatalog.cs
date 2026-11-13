using System.Data;
using System.Text.Json;
using System.Text.Json.Nodes;
using FashionStore.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Data;

public static class ShowroomCatalog
{
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private record Photos(string Front, string? Side, string? Back, string? Pair = null);
    private record Collection(string Id, string Title, int Order);
    private record Metadata(string[][] Colors, Photos[] Photos, string[] Sizes, JsonObject Details, Collection? Collection);
    private record Entry(string Audience, string Kind, string Slug, string Name, string Description,
        decimal Price, int Order, Metadata Metadata, int[] Stock);

    private static readonly string[] Audiences = ["women", "girls", "men", "boy"];

    private static readonly string[] LegacySlugs =
    [
        "heavyweight-boxy-hoodie-ash-grey", "vintage-washed-boxy-tee-charcoal",
        "oversize-streetwear-tee-clean-white", "distressed-graphic-tee-urbn-rebel",
        "cyberpunk-leather-sleeve-varsity-jacket", "techwear-parachute-bomber-jacket",
        "varsity-stadium-bomber-jacket-black", "fleece-vintage-washed-crewneck-olive",
        "vintage-distressed-baggy-denim-jeans", "multi-pocket-skate-cargo-pants-black",
        "air-jordan-1-retro-high-og-chicago", "nike-dunk-low-retro-panda", "travis-scott-air-jordan-1-low-mocha",
        "balenciaga-triple-s-clear-sole", "yeezy-boost-350-v2-onyx", "new-balance-550-retro-white-green",
        "rick-owens-geobasket-high-top", "nike-air-force-1-07-low-triple-white",
        "converse-chuck-70-high-heritage-black", "adidas-forum-84-low-vintage"
    ];

    private static readonly Dictionary<string, (string Slug, string Name)> CategoryByKind = new()
    {
        ["ao"] = ("showroom-ao", "Áo showroom"),
        ["quan"] = ("showroom-quan", "Quần showroom"),
        ["giay"] = ("showroom-giay", "Giày showroom")
    };

    public static async Task<(int Added, int Removed)> ImportAsync(ApplicationDbContext db, bool replaceLegacy = false)
    {
        using var source = typeof(ShowroomCatalog).Assembly.GetManifestResourceStream("FashionStore.Data.showroom-catalog.json")
            ?? throw new InvalidOperationException("Không tìm thấy danh mục showroom.");
        var entries = await JsonSerializer.DeserializeAsync<Entry[]>(source, JsonOptions)
            ?? throw new InvalidOperationException("Danh mục showroom trống.");
        if (entries.Length == 0 || entries.Select(item => item.Slug).Distinct(StringComparer.OrdinalIgnoreCase).Count() != entries.Length ||
            entries.Any(item => !Audiences.Contains(item.Audience) || !CategoryByKind.ContainsKey(item.Kind) ||
                item.Metadata.Colors.Length == 0 || item.Metadata.Colors.Length != item.Metadata.Photos.Length ||
                item.Metadata.Sizes.Length == 0 || item.Metadata.Sizes.Length != item.Stock.Length || item.Price <= 0 ||
                item.Metadata.Photos.Any(photo => string.IsNullOrWhiteSpace(photo.Front)) ||
                (item.Kind == "giay" && item.Metadata.Collection == null)))
        {
            throw new InvalidOperationException("Danh mục showroom không hợp lệ.");
        }

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var productSlugs = (await db.Products.Select(p => p.Slug).ToListAsync()).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var metadataUpdates = entries.Where(entry => IsLookbookOnly(entry.Metadata) ||
                (entry.Kind == "giay" && !string.IsNullOrWhiteSpace(entry.Metadata.Photos[0].Pair)))
            .ToDictionary(entry => entry.Slug, StringComparer.OrdinalIgnoreCase);
        var updateSlugs = metadataUpdates.Keys.ToArray();
        var existingProducts = await db.Products.Where(product =>
            updateSlugs.Contains(product.Slug) && product.ShowroomMetadata != null).ToListAsync();
        foreach (var product in existingProducts)
        {
            var metadata = JsonSerializer.Deserialize<Metadata>(product.ShowroomMetadata!, JsonOptions);
            if (metadata == null) continue;

            var entry = metadataUpdates[product.Slug];
            var changed = false;
            if (IsLookbookOnly(entry.Metadata) && !IsLookbookOnly(metadata))
            {
                metadata.Details["lookbookOnly"] = true;
                changed = true;
            }

            var pair = entry.Metadata.Photos[0].Pair;
            if (product.ShowroomKind == "giay" && !string.IsNullOrWhiteSpace(pair) && metadata.Photos[0].Pair != pair)
            {
                metadata.Photos[0] = metadata.Photos[0] with { Pair = pair };
                changed = true;
            }

            if (changed)
            {
                product.ShowroomMetadata = JsonSerializer.Serialize(metadata, JsonOptions);
            }
        }

        var categories = await db.Categories.ToListAsync();
        int added = 0;
        foreach (var entry in entries.Where(entry => productSlugs.Add(entry.Slug)))
        {
            var categoryInfo = CategoryByKind[entry.Kind];
            var category = categories.FirstOrDefault(item => item.Slug == categoryInfo.Slug);
            if (category == null)
            {
                category = new Category { Slug = categoryInfo.Slug, Name = categoryInfo.Name };
                categories.Add(category);
            }

            var product = new Product
            {
                Name = entry.Name,
                Slug = entry.Slug,
                Description = entry.Description,
                Price = entry.Price,
                ImageUrl = entry.Metadata.Photos[0].Front,
                Category = category,
                ShowroomAudience = entry.Audience,
                ShowroomKind = entry.Kind,
                ShowroomSortOrder = entry.Order,
                ShowroomMetadata = JsonSerializer.Serialize(entry.Metadata, JsonOptions)
            };
            for (int color = 0; color < entry.Metadata.Colors.Length; color++)
            {
                for (int size = 0; size < entry.Metadata.Sizes.Length; size++)
                {
                    var label = entry.Metadata.Sizes[size];
                    product.Variants.Add(new ProductVariant
                    {
                        SKU = $"SR-{entry.Slug}-{color + 1}-{size + 1}".ToUpperInvariant(),
                        Size = label,
                        Color = entry.Metadata.Colors[color][0],
                        Price = entry.Price,
                        StockQuantity = entry.Stock[size]
                    });
                }
            }
            db.Products.Add(product);
            added++;
        }

        var removed = 0;
        if (replaceLegacy)
        {
            var legacy = await db.Products.Where(p => p.ShowroomAudience == null && LegacySlugs.Contains(p.Slug)).ToListAsync();
            var legacyIds = legacy.Select(p => p.Id).ToArray();
            if (await db.OrderItems.AnyAsync(line => legacyIds.Contains(line.ProductVariant.ProductId)))
            {
                throw new InvalidOperationException("Một số sản phẩm cũ đã có đơn hàng. Giao dịch thay danh mục đã dừng.");
            }
            db.Products.RemoveRange(legacy);
            removed = legacy.Count;
        }

        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return (added, removed);
    }

    public static async Task<object> ReadAsync(ApplicationDbContext db)
    {
        var products = await db.Products.AsNoTracking()
            .Where(p => p.IsActive && p.ShowroomAudience != null && p.ShowroomKind != null && p.ShowroomMetadata != null)
            .Include(p => p.Variants.Where(v => v.IsActive))
            .OrderBy(p => p.ShowroomSortOrder).ThenBy(p => p.Id)
            .ToListAsync();

        var entries = products.Select(product => (
            Product: product,
            Metadata: JsonSerializer.Deserialize<Metadata>(product.ShowroomMetadata!, JsonOptions)!
        )).ToList();

        var lookbook = entries.Where(row => IsLookbookOnly(row.Metadata))
            .ToDictionary(row => row.Product.Slug, row => BuildItem(row.Product, row.Metadata));
        entries.RemoveAll(row => lookbook.ContainsKey(row.Product.Slug));

        var clothing = Audiences.ToDictionary(audience => audience,
            audience => new[] { "ao", "quan" }.ToDictionary(kind => kind,
                kind => entries.Where(row => row.Product.ShowroomAudience == audience && row.Product.ShowroomKind == kind)
                    .Select(row => BuildItem(row.Product, row.Metadata)).ToList()));

        var shoes = Audiences.ToDictionary(audience => audience,
            audience => entries.Where(row => row.Product.ShowroomAudience == audience && row.Product.ShowroomKind == "giay" && row.Metadata.Collection != null)
                .GroupBy(row => row.Metadata.Collection!)
                .OrderBy(group => group.Key.Order)
                .Select(group => new { group.Key.Id, group.Key.Title, Items = group.Select(row => BuildItem(row.Product, row.Metadata)).ToList() })
                .ToList());

        return new { Clothing = clothing, Shoes = shoes, Lookbook = lookbook };
    }

    private static bool IsLookbookOnly(Metadata metadata) => metadata.Details["lookbookOnly"]?.GetValue<bool>() == true;

    public static string FrontPhoto(Product product, string color)
    {
        if (product.ShowroomMetadata == null) return product.ImageUrl;
        var metadata = JsonSerializer.Deserialize<Metadata>(product.ShowroomMetadata, JsonOptions);
        if (metadata == null) return product.ImageUrl;
        var index = Array.FindIndex(metadata.Colors, entry => entry[0] == color);
        return index > 0 ? metadata.Photos.ElementAtOrDefault(index)?.Front ?? product.ImageUrl : product.ImageUrl;
    }

    private static JsonObject BuildItem(Product product, Metadata metadata)
    {
        var item = (JsonObject)metadata.Details.DeepClone();
        var variants = metadata.Colors.Select(color => metadata.Sizes.Select(size =>
        {
            var variant = product.Variants.OrderBy(v => v.Id).FirstOrDefault(v => v.Color == color[0] && v.Size == size);
            return variant == null ? null : new { variant.Id, Stock = variant.StockQuantity, variant.Price };
        }).ToArray()).ToArray();
        item["productId"] = product.Id;
        item["sizes"] = JsonSerializer.SerializeToNode(metadata.Sizes, JsonOptions);
        item["variants"] = JsonSerializer.SerializeToNode(variants, JsonOptions);
        if (product.ShowroomKind == "giay")
        {
            item["id"] = product.Slug;
            item["name"] = product.Name;
            item["image"] = product.ImageUrl;
            item["pairImage"] = metadata.Photos[0].Pair;
            item["price"] = product.Price;
            item["colorName"] = metadata.Colors[0][0];
        }
        else
        {
            item["slug"] = product.Slug;
            item["name"] = product.Name;
            item["desc"] = product.Description;
            item["price"] = product.Price / 10000m;
            item["frontImg"] = product.ImageUrl;
            item["colors"] = JsonSerializer.SerializeToNode(metadata.Colors, JsonOptions);
            item["photos"] = JsonSerializer.SerializeToNode(metadata.Photos.Select((photo, index) =>
                index == 0 ? photo with { Front = product.ImageUrl } : photo), JsonOptions);
            item["stock"] = JsonSerializer.SerializeToNode(variants[0].Select(v => v?.Stock ?? 0), JsonOptions);
        }
        return item;
    }
}
