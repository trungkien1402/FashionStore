using FashionStore.Data;
using FashionStore.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Services.Implementations;

public static class SalesRules
{
    public static async Task<StoreSettings> GetSettingsAsync(ApplicationDbContext db) =>
        await db.StoreSettings.AsNoTracking().SingleOrDefaultAsync(s => s.Id == 1) ?? new StoreSettings { Id = 1 };

    public static decimal ShippingFee(StoreSettings settings, decimal subtotal) =>
        subtotal >= settings.FreeShippingThreshold ? 0 : settings.ShippingFee;

    public static async Task<(Voucher? Voucher, decimal Discount)> ApplyVoucherAsync(
        ApplicationDbContext db, string code, string userId, decimal subtotal,
        IReadOnlyDictionary<int, int> quantities, IEnumerable<ProductVariant> variants, int? gameScore = null)
    {
        var now = DateTime.UtcNow;
        var voucher = await db.Vouchers.SingleOrDefaultAsync(v => v.Code == code &&
            v.IsActive && v.StartsAt <= now && v.EndsAt > now);
        if (voucher == null || subtotal < voucher.MinimumOrder ||
            voucher.GameMinimumScore is int minimum && (gameScore == null || gameScore < minimum))
            return (null, 0);

        if (await db.VoucherRedemptions.CountAsync(r => r.VoucherId == voucher.Id) >= voucher.TotalLimit ||
            await db.VoucherRedemptions.CountAsync(r => r.VoucherId == voucher.Id && r.CustomerId == userId) >= (voucher.GameMinimumScore.HasValue ? 1 : voucher.CustomerLimit))
            return (null, 0);

        var eligible = variants.Where(v => (voucher.ProductId == null || voucher.ProductId == v.ProductId) &&
            (voucher.CategoryId == null || voucher.CategoryId == v.Product.CategoryId))
            .Sum(v => v.Price * quantities.GetValueOrDefault(v.Id));
        var discount = voucher.IsPercentage ? Math.Floor(eligible * voucher.Value / 100) : voucher.Value;
        discount = Math.Min(eligible, Math.Min(discount, voucher.MaximumDiscount ?? decimal.MaxValue));
        return discount > 0 ? (voucher, discount) : (null, 0);
    }

    public static void Audit(ApplicationDbContext db, string? actor, string action, string target, string detail)
    {
        db.AdminAuditEvents.Add(new AdminAuditEvent
        {
            ActorId = actor, Action = action, Target = target, Detail = detail
        });
    }
}
