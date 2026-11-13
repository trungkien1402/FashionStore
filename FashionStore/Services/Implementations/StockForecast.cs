using FashionStore.Data;
using FashionStore.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Services.Implementations;

public static class StockForecast
{
    public static async Task<StockForecastReport> BuildAsync(ApplicationDbContext db, DateTime today,
        CancellationToken cancellationToken)
    {
        var end = today.Date.AddDays(1);
        var recent = end.AddDays(-30);
        var previous = recent.AddDays(-30);
        var endUtc = end.AddHours(-7);
        var recentUtc = recent.AddHours(-7);
        var previousUtc = previous.AddHours(-7);
        var target = new DateTime(today.Year, today.Month, 1).AddMonths(1);
        var days = DateTime.DaysInMonth(target.Year, target.Month);

        var orders = db.Orders.AsNoTracking()
            .Where(o => o.CreatedAt >= previousUtc && o.CreatedAt < endUtc);
        var daily = await orders.GroupBy(o => o.CreatedAt.AddHours(7).Date)
            .OrderBy(g => g.Key)
            .Select(g => new ForecastDay(g.Key, g.Count(), g.Sum(o => o.TotalAmount),
                g.Sum(o => o.PaymentStatus == PaymentStatus.Paid ? o.TotalAmount : 0),
                g.Sum(o => o.Status == OrderStatus.Delivered ? o.TotalAmount : 0),
                g.Sum(o => o.PaymentStatus == PaymentStatus.Refunded ? o.TotalAmount : 0),
                g.Count(o => o.Status == OrderStatus.Delivered)))
            .ToListAsync(cancellationToken);
        var sales = await db.OrderItems.AsNoTracking()
            .Where(i => i.Order.Status == OrderStatus.Delivered && i.Order.CreatedAt >= previousUtc &&
                i.Order.CreatedAt < endUtc)
            .GroupBy(i => new { i.ProductVariantId, Recent = i.Order.CreatedAt >= recentUtc })
            .Select(g => new { g.Key.ProductVariantId, g.Key.Recent, Units = g.Sum(i => (long)i.Quantity) })
            .ToListAsync(cancellationToken);
        var preferences = await db.OrderItems.AsNoTracking()
            .Where(i => i.Order.Status == OrderStatus.Delivered &&
                i.Order.CreatedAt >= recentUtc && i.Order.CreatedAt < endUtc)
            .GroupBy(i => new
            {
                i.ProductVariant.Product.CategoryId,
                Category = i.ProductVariant.Product.Category.Name,
                i.Color,
                i.Size
            })
            .Select(g => new { g.Key.CategoryId, g.Key.Category, g.Key.Color, g.Key.Size, Units = g.Sum(i => (long)i.Quantity) })
            .ToListAsync(cancellationToken);

        static List<PurchasePreference> Rank(IEnumerable<(string Value, long Units)> values) =>
            values.Where(v => !string.IsNullOrWhiteSpace(v.Value))
                .GroupBy(v => v.Value.Trim(), StringComparer.OrdinalIgnoreCase)
                .Select(g => new PurchasePreference(g.Key, g.Sum(v => v.Units)))
                .OrderByDescending(v => v.Units).ThenBy(v => v.Value, StringComparer.OrdinalIgnoreCase).Take(3).ToList();

        var categoryPreferences = preferences.GroupBy(p => new { p.CategoryId, p.Category })
            .Select(g => new CategoryPurchasePreferences(g.Key.Category, g.Sum(p => p.Units),
                Rank(g.Select(p => (p.Color, p.Units))), Rank(g.Select(p => (p.Size, p.Units)))))
            .OrderByDescending(g => g.Units).ThenBy(g => g.Category, StringComparer.Ordinal).Take(8).ToList();

        var salesBySku = sales.ToDictionary(s => (s.ProductVariantId, s.Recent), s => s.Units);
        var candidates = await db.ProductVariants.AsNoTracking()
            .Where(v => v.IsActive && v.Product.IsActive)
            .Select(v => new { v.Id, v.SKU, v.Size, v.Color, v.StockQuantity, v.ProductId, v.Product.Name })
            .ToListAsync(cancellationToken);

        var rows = new List<StockForecastRow>();
        foreach (var sku in candidates)
        {
            var now = salesBySku.GetValueOrDefault((sku.Id, true));
            var before = salesBySku.GetValueOrDefault((sku.Id, false));
            if (now == 0 && before == 0) continue;

            var expected = (long)Math.Ceiling((now * .65m + before * .35m) * days / 30);
            var suggested = Math.Max(0, expected - sku.StockQuantity);
            rows.Add(new(sku.ProductId, sku.Name, sku.SKU, sku.Size, sku.Color, now, before,
                sku.StockQuantity, expected, suggested, now + before < 5));
        }

        ForecastPeriod Summarize(bool current)
        {
            var group = daily.Where(d => (d.Date >= recent) == current).ToList();
            return new(group.Sum(d => d.Orders), group.Sum(d => d.DeliveredOrders),
                sales.Where(s => s.Recent == current).Sum(s => s.Units),
                group.Sum(d => d.Ordered), group.Sum(d => d.Paid),
                group.Sum(d => d.Delivered), group.Sum(d => d.Refunded));
        }

        return new(previous, recent, end, target, Summarize(false), Summarize(true), daily, categoryPreferences,
            rows.Count(r => r.Suggested > 0),
            rows.OrderByDescending(r => r.Suggested).ThenByDescending(r => r.RecentUnits)
                .ThenBy(r => r.Sku, StringComparer.Ordinal).Take(30).ToList());
    }
}

public record ForecastDay(DateTime Date, int Orders, decimal Ordered, decimal Paid, decimal Delivered,
    decimal Refunded, int DeliveredOrders);

public record ForecastPeriod(int Orders, int DeliveredOrders, long Units, decimal Ordered,
    decimal Paid, decimal DeliveredAmount, decimal Refunded);

public record StockForecastRow(int ProductId, string ProductName, string Sku, string Size, string Color,
    long RecentUnits, long PreviousUnits, int Stock, long Expected, long Suggested, bool SparseData);

public record StockForecastReport(DateTime PreviousStart, DateTime RecentStart, DateTime EndExclusive,
    DateTime TargetMonth, ForecastPeriod Previous, ForecastPeriod Recent, List<ForecastDay> Daily, List<CategoryPurchasePreferences> Preferences, int SkusToOrder, List<StockForecastRow> Rows)
{
    public const string Method = "Dự báo theo SKU: 65% lượng bán 30 ngày gần đây + 35% lượng bán 30 ngày trước, quy đổi theo số ngày của tháng tới. Gợi ý nhập bằng nhu cầu dự báo trừ tồn hiện có.";
    public const string Assumptions = "Gợi ý nhập chỉ tính đơn đã giao theo ngày đặt, giờ Việt Nam. SKU bán dưới 5 món trong 60 ngày có ít dữ liệu. Cần kiểm tra hàng đang về, thời gian giao của nhà cung cấp và các đợt khuyến mãi trước khi chốt số nhập.";

    public const string RevenueBasis = "Số liệu theo ngày đặt, giờ Việt Nam và trạng thái hiện tại. Đã thanh toán chỉ gồm đơn đang ở trạng thái Paid. Đã hoàn là giá trị đơn ở trạng thái Refunded. Ngày hôm nay có thể chưa đủ dữ liệu.";

    public (string Theme, string Items, string Colors) SeasonalIdea => TargetMonth.Month switch
    {
        12 => ("Giáng sinh và cuối năm", "Áo len, cardigan, hoodie hoặc đồ phối đi tiệc", "Đỏ rượu, xanh thông, kem"),
        1 or 2 => ("Dịp Tết và đầu năm", "Áo sơ mi, đồ phối đi chơi và áo khoác nhẹ. Đối chiếu lịch Tết của năm khi đặt hàng.", "Đỏ, kem, be"),
        3 or 4 => ("Giao mùa", "Áo thun cotton, sơ mi mỏng và quần nhẹ", "Trắng, xanh nhạt, be"),
        5 or 6 or 7 => ("Mùa hè", "Áo thun thoáng, quần shorts và đồ đi biển", "Trắng, xanh biển, be"),
        8 or 9 => ("Mùa tựu trường", "Áo thun cơ bản, sơ mi và quần jean", "Trắng, xanh denim, đen"),
        _ => ("Giao mùa cuối năm", "Hoodie, áo khoác nhẹ và đồ phối nhiều lớp", "Nâu, xám, đen")
    };

    public const string SeasonNote = "Gợi ý theo lịch mùa vụ, nên thử lô nhỏ và cân nhắc vùng bán. Chọn size dựa trên số bán của từng danh mục.";

    public string PaidChange => DescribeChange(Recent.Paid, Previous.Paid);
    public string OrderedChange => DescribeChange(Recent.Ordered, Previous.Ordered);
    public string DeliveredChange => DescribeChange(Recent.DeliveredAmount, Previous.DeliveredAmount);
    public string RefundedChange => DescribeChange(Recent.Refunded, Previous.Refunded);

    public string Insight => Recent.Units == 0 && Previous.Units == 0
        ? "Chưa có lượng bán đã giao trong hai kỳ để dự báo nhập theo SKU."
        : $"Lượng bán đã giao: {DescribeChange(Recent.Units, Previous.Units)}.";

    private static string DescribeChange(decimal current, decimal previous)
    {
        if (current == previous) return "Không đổi";
        if (previous == 0) return "Có phát sinh so với kỳ trước";
        var ratio = (current - previous) / previous;
        return $"{(ratio > 0 ? "Tăng" : "Giảm")} {Math.Abs(ratio):P1} so với kỳ trước";
    }
}

public record PurchasePreference(string Value, long Units);
public record CategoryPurchasePreferences(string Category, long Units,
    List<PurchasePreference> Colors, List<PurchasePreference> Sizes);
