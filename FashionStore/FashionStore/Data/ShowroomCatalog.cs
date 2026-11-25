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
        decimal Price, int Order, Metadata Metadata, int[] Stock, string? AdminCategory = null);

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

    private static readonly Dictionary<string, (string Kind, string Name)> AdminCategories = new()
    {
        ["giay-hnmtshop"] = ("giay", "Giày HNMTSHOP"),
        ["giay-lookbook"] = ("giay", "Giày Lookbook"),
        ["giay-the-thao"] = ("giay", "Giày Thể Thao"),
        ["giay-cao-got"] = ("giay", "Giày Cao Gót"),
        ["giay-boots"] = ("giay", "Boots"),
        ["giay-tay"] = ("giay", "Giày Tây"),
        ["giay-luoi"] = ("giay", "Giày Lười"),
        ["giay-bet"] = ("giay", "Giày Bệt"),
        ["giay-sandal"] = ("giay", "Sandal"),
        ["giay-future-lab"] = ("giay", "Giày HNMTSHOP × FUTURE LAB"),
        ["giay-cyber-lab"] = ("giay", "Giày HNMTSHOP × CYBER LAB"),
        ["giay-chile-20"] = ("giay", "Giày HNMTSHOP × CHILE 20"),
        ["giay-nike"] = ("giay", "Giày Nike"),
        ["giay-jordan"] = ("giay", "Giày Jordan"),
        ["giay-adidas"] = ("giay", "Giày Adidas"),
        ["giay-new-balance"] = ("giay", "Giày New Balance"),
        ["giay-converse"] = ("giay", "Giày Converse"),
        ["giay-balenciaga"] = ("giay", "Giày Balenciaga"),
        ["giay-rick-owens"] = ("giay", "Giày Rick Owens"),
        ["ao-so-mi-blouse"] = ("ao", "Áo sơ mi"),
        ["ao-polo"] = ("ao", "Áo polo"),
        ["quan-jeans"] = ("quan", "Quần jeans"),
        ["quan-tay-chino"] = ("quan", "Quần tây"),
        ["quan-short"] = ("quan", "Quần short"),
        ["quan-jogger-the-thao"] = ("quan", "Quần jogger"),
        ["ao-khoac-varsity"] = ("ao", "Áo khoác"),
        ["ao-thun-streetwear"] = ("ao", "Áo thun"),
        ["hoodie-sweater"] = ("ao", "Áo nỉ & Hoodie"),
        ["quan-baggy-cargo"] = ("quan", "Quần túi hộp"),
        ["giay-sneaker-streetwear"] = ("giay", "Giày sneaker")
    };

    public static readonly string[] FormerShoeCategorySlugs =
    [
        "giay-lookbook", "giay-hnmtshop", "giay-future-lab", "giay-cyber-lab", "giay-chile-20",
        "giay-nike", "giay-jordan", "giay-adidas", "giay-new-balance", "giay-converse",
        "giay-balenciaga", "giay-rick-owens", "giay-sneaker-streetwear"
    ];

    private static Stream GetCatalogStream()
    {
        var asm = typeof(ShowroomCatalog).Assembly;
        var stream = asm.GetManifestResourceStream("FashionStore.Data.showroom-catalog.json");
        if (stream != null) return stream;

        var resName = asm.GetManifestResourceNames().FirstOrDefault(n => n.EndsWith("showroom-catalog.json", StringComparison.OrdinalIgnoreCase));
        if (resName != null)
        {
            var resStream = asm.GetManifestResourceStream(resName);
            if (resStream != null) return resStream;
        }

        var possiblePaths = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Data", "showroom-catalog.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "Data", "showroom-catalog.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "FashionStore", "Data", "showroom-catalog.json")
        };
        foreach (var path in possiblePaths)
        {
            if (File.Exists(path))
            {
                return File.OpenRead(path);
            }
        }

        throw new InvalidOperationException("Không tìm thấy danh mục showroom.");
    }

    public static async Task ReconcileCategoriesAsync(ApplicationDbContext db)
    {
        using var source = GetCatalogStream();
        var entries = await JsonSerializer.DeserializeAsync<Entry[]>(source, JsonOptions)
            ?? throw new InvalidOperationException("Danh mục showroom trống.");
        var assignments = entries.Where(entry => entry.AdminCategory != null)
            .ToDictionary(entry => entry.Slug, entry => entry.AdminCategory!, StringComparer.OrdinalIgnoreCase);
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        const string reconciliation = "CatalogShoeTypesV1";
        if (await db.AdminAuditEvents.AnyAsync(item => item.Action == reconciliation))
        {
            await transaction.CommitAsync();
            return;
        }
        if (await db.AdminAuditEvents.AnyAsync(item => item.Action == "CatalogCategories20261119"))
        {
            assignments = assignments.Where(item => AdminCategories[item.Value].Kind == "giay")
                .ToDictionary(item => item.Key, item => item.Value, StringComparer.OrdinalIgnoreCase);
        }

        assignments.TryAdd("air-jordan-1-retro-high-og-chicago", "giay-the-thao");
        assignments.TryAdd("travis-scott-air-jordan-1-low-mocha", "giay-the-thao");
        assignments.TryAdd("nike-dunk-low-retro-panda", "giay-the-thao");
        assignments.TryAdd("nike-air-force-1-07-low-triple-white", "giay-the-thao");
        assignments.TryAdd("adidas-forum-84-low-vintage", "giay-the-thao");
        assignments.TryAdd("yeezy-boost-350-v2-onyx", "giay-the-thao");
        assignments.TryAdd("new-balance-550-retro-white-green", "giay-the-thao");
        assignments.TryAdd("converse-chuck-70-high-heritage-black", "giay-the-thao");
        assignments.TryAdd("balenciaga-triple-s-clear-sole", "giay-the-thao");
        assignments.TryAdd("rick-owens-geobasket-high-top", "giay-the-thao");
        foreach (var entry in entries.Where(entry => entry.AdminCategory == "quan-jogger-the-thao"))
            assignments[entry.Slug] = "quan-jogger-the-thao";
        if (await db.AdminAuditEvents.AnyAsync(item => item.Action == "CatalogShoeBrandsV1" || item.Action == "CatalogCategoryImagesV1"))
        {
            assignments = assignments.Where(item => AdminCategories[item.Value].Kind == "giay" || item.Value == "quan-jogger-the-thao")
                .ToDictionary(item => item.Key, item => item.Value, StringComparer.OrdinalIgnoreCase);
        }
        var slugs = assignments.Keys.ToArray();
        var categories = await db.Categories.ToListAsync();
        var products = await db.Products.Include(product => product.Category)
            .Where(product => slugs.Contains(product.Slug)).ToListAsync();
        foreach (var product in products)
        {
            var targetSlug = assignments[product.Slug];
            if (product.Category.Slug == targetSlug ||
                (!AdminCategories.ContainsKey(product.Category.Slug) &&
                 !CategoryByKind.Values.Any(category => category.Slug == product.Category.Slug)))
                continue;

            var target = categories.FirstOrDefault(category => category.Slug == targetSlug);
            if (target == null)
            {
                target = new Category { Slug = targetSlug, Name = AdminCategories[targetSlug].Name };
                categories.Add(target);
            }
            product.Category = target;
        }
        db.AdminAuditEvents.Add(new AdminAuditEvent
        {
            Action = reconciliation,
            Target = "ShowroomCatalog",
            Detail = "Phân loại giày mẫu theo kiểu giày."
        });
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    public static async Task<(int Added, int Removed)> ImportAsync(ApplicationDbContext db, bool replaceLegacy = false)
    {
        using var source = GetCatalogStream();
        var entries = await JsonSerializer.DeserializeAsync<Entry[]>(source, JsonOptions)
            ?? throw new InvalidOperationException("Danh mục showroom trống.");
        if (entries.Length == 0 || entries.Select(item => item.Slug).Distinct(StringComparer.OrdinalIgnoreCase).Count() != entries.Length ||
            entries.Any(item => !Audiences.Contains(item.Audience) || !CategoryByKind.ContainsKey(item.Kind) ||
                (item.AdminCategory != null && (!AdminCategories.TryGetValue(item.AdminCategory, out var admin) || admin.Kind != item.Kind)) ||
                item.Metadata.Colors.Length == 0 || item.Metadata.Colors.Length != item.Metadata.Photos.Length ||
                item.Metadata.Sizes.Length == 0 || item.Metadata.Sizes.Length != item.Stock.Length || item.Price <= 0 ||
                item.Metadata.Photos.Any(photo => string.IsNullOrWhiteSpace(photo.Front)) ||
                (item.Kind == "giay" && item.Metadata.Collection == null)))
        {
            throw new InvalidOperationException("Danh mục showroom không hợp lệ.");
        }

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var productSlugs = (await db.Products.Select(p => p.Slug).ToListAsync()).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var categories = await db.Categories.ToListAsync();
        Category ResolveCategory(Entry entry)
        {
            var (slug, name) = entry.AdminCategory is { } key
                ? (key, AdminCategories[key].Name)
                : CategoryByKind[entry.Kind];
            var category = categories.FirstOrDefault(item => item.Slug == slug);
            if (category != null) return category;
            category = new Category { Slug = slug, Name = name };
            categories.Add(category);
            return category;
        }

        var metadataUpdates = entries.Where(entry => entry.AdminCategory != null || IsLookbookOnly(entry.Metadata) ||
                (entry.Kind == "giay" && !string.IsNullOrWhiteSpace(entry.Metadata.Photos[0].Pair)))
            .ToDictionary(entry => entry.Slug, StringComparer.OrdinalIgnoreCase);
        var updateSlugs = metadataUpdates.Keys.ToArray();
        var existingProducts = await db.Products.Where(product =>
            updateSlugs.Contains(product.Slug) && product.ShowroomMetadata != null)
            .Include(product => product.Category).ToListAsync();
        foreach (var product in existingProducts)
        {
            var metadata = JsonSerializer.Deserialize<Metadata>(product.ShowroomMetadata!, JsonOptions);
            if (metadata == null) continue;

            var entry = metadataUpdates[product.Slug];
            if (entry.AdminCategory != null &&
                (product.Category.Slug == CategoryByKind[entry.Kind].Slug ||
                 AdminCategories.ContainsKey(product.Category.Slug)))
            {
                product.Category = ResolveCategory(entry);
            }

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

        int added = 0;
        foreach (var entry in entries.Where(entry => productSlugs.Add(entry.Slug)))
        {
            var product = new Product
            {
                Name = entry.Name,
                Slug = entry.Slug,
                Description = entry.Description,
                Price = entry.Price,
                ImageUrl = entry.Metadata.Photos[0].Front,
                Category = ResolveCategory(entry),
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
        item["audience"] = product.ShowroomAudience;
        item["kind"] = product.ShowroomKind;
        item["productId"] = product.Id;
        item["sizes"] = JsonSerializer.SerializeToNode(metadata.Sizes, JsonOptions);
        item["variants"] = JsonSerializer.SerializeToNode(variants, JsonOptions);
        if (product.ShowroomKind == "giay")
        {
            item["id"] = product.Slug;
            item["name"] = product.Name;
            item["image"] = metadata.Photos.FirstOrDefault()?.Front ?? product.ImageUrl;
            item["pairImage"] = metadata.Photos.FirstOrDefault()?.Pair ?? product.ImageUrl;
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
