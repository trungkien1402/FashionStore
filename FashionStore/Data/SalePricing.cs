using FashionStore.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Data;

public static class SalePricing
{
    public static Task<LookbookCollection?> ActiveCampaignAsync(ApplicationDbContext db)
    {
        var now = DateTimeOffset.UtcNow;
        return db.LookbookCollections.AsNoTracking().Include(c => c.Looks)
            .Where(c => c.IsSale && c.IsPublished && c.StartsAt <= now && now < c.EndsAt)
            .OrderByDescending(c => c.StartsAt).ThenByDescending(c => c.Id).FirstOrDefaultAsync();
    }

    public static async Task<Dictionary<(int ProductId, string Color), int>> DiscountsAsync(ApplicationDbContext db)
    {
        var campaign = await ActiveCampaignAsync(db);
        return campaign?.Looks.SelectMany(LookbookCatalog.ReadItems)
            .Where(item => item.DiscountPercent is > 0 and <= 100)
            .GroupBy(item => (item.ProductId, item.Color))
            .ToDictionary(group => group.Key, group => group.Max(item => item.DiscountPercent)) ?? [];
    }

    public static decimal Discounted(decimal price, int percent) =>
        decimal.Round(price * (100 - percent) / 100, 0, MidpointRounding.AwayFromZero);

    public static decimal Price(ProductVariant variant, IReadOnlyDictionary<(int, string), int> discounts) =>
        discounts.TryGetValue((variant.ProductId, variant.Color), out var percent)
            ? Discounted(variant.Price, percent) : variant.Price;
}
