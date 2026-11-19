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

    // =========================================================================================
    // [BÀI TOÁN 3: XỬ LÝ TRANH CHẤP GIẬT MÃ GIẢM GIÁ (VOUCHER FLASH SALE) - UPDLOCK & ROWLOCK]
    // Tình huống: Mã giảm giá giới hạn số lượng (TotalLimit), nhiều người cùng bấm áp mã cùng 1 lúc.
    // Cơ chế xử lý:
    // 1. Khi checkout (reserve = true): Dùng câu lệnh SQL `WITH (UPDLOCK, ROWLOCK)` khóa dòng mã này lại.
    // 2. Mọi người dùng đến sau phải chờ người trước hoàn tất giao dịch.
    // 3. Kiểm tra số lượt đã dùng (CountAsync >= voucher.TotalLimit). Nếu hết lượt -> Trả về null và Rollback.
    // =========================================================================================
    public static async Task<(Voucher? Voucher, decimal Discount)> ApplyVoucherAsync(
        ApplicationDbContext db, string code, string userId, decimal subtotal,
        IReadOnlyDictionary<int, int> quantities, IEnumerable<ProductVariant> variants, int? gameScore = null, bool reserve = false)
    {
        var now = DateTime.UtcNow;

        // [BƯỚC 1 - KHÓA DÒNG VOUCHER ĐỘC QUYỀN]: Tránh tranh chấp khi hàng ngàn người áp mã cùng lúc
        var vouchers = reserve
            ? db.Vouchers.FromSqlInterpolated($"SELECT * FROM [Vouchers] WITH (UPDLOCK, ROWLOCK) WHERE [Code] = {code}")
            : db.Vouchers.AsNoTracking().Where(v => v.Code == code);

        var voucher = await vouchers.AsNoTracking().SingleOrDefaultAsync(v =>
            v.IsActive && v.StartsAt <= now && v.EndsAt > now);

        if (voucher == null || subtotal < voucher.MinimumOrder ||
            voucher.GameMinimumScore is int minimum && (gameScore == null || gameScore < minimum))
            return (null, 0);

        // [BƯỚC 2 - KIỂM TRA HẠN MỨC]:
        // - Quá tổng số lượt toàn hệ thống (TotalLimit) -> HẾT LƯỢT DÙNG!
        // - Quá số lần cho phép của cá nhân khách hàng (CustomerLimit) -> KHÔNG ĐƯỢC DÙNG LẶP LẠI!
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
