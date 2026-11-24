using System.Text.Json;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Data;

public static class LookbookCatalog
{
    public static List<LookbookSelection> ReadItems(LookbookLook look) =>
        JsonSerializer.Deserialize<List<LookbookSelection>>(look.ProductsJson, ShowroomCatalog.JsonOptions) ?? [];

    public static IQueryable<Product> Products(ApplicationDbContext db) =>
        db.Products.AsNoTracking()
            .Where(p => p.IsActive && (p.ShowroomKind == "ao" || p.ShowroomKind == "quan" || p.ShowroomKind == "giay") &&
                p.ShowroomAudience != null && p.ShowroomMetadata != null)
            .Include(p => p.Variants.Where(v => v.IsActive));

    public static async Task<LookbookDisplay> BuildAsync(ApplicationDbContext db, LookbookCollection collection)
    {
        var selections = collection.Looks.ToDictionary(look => look.Id, ReadItems);
        var ids = selections.Values.SelectMany(items => items).Select(item => item.ProductId).Distinct().ToArray();
        var candidates = await Products(db).Where(p => ids.Contains(p.Id)).Include(p => p.Category).ToListAsync();
        var products = candidates.Where(ShowroomCatalog.HasRailListing).ToDictionary(p => p.Id);
        return new LookbookDisplay(collection, products, selections);
    }
}
