using FashionStore.Data;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Services.Implementations;

public class AdminReportService(ApplicationDbContext context)
{
    private readonly ApplicationDbContext _context = context;
    private const int LowStockThreshold = 5;
    private static readonly TimeSpan VietnamOffset = TimeSpan.FromHours(7);

    public static DateTime Today => DateTimeOffset.UtcNow.ToOffset(VietnamOffset).Date;
    public static DateTime ToVietnamTime(DateTime utc) => utc.Add(VietnamOffset);

    public static bool IsValidRange(DateTime start, DateTime end) =>
        start >= new DateTime(1900, 1, 1) && start <= end &&
        end < DateTime.MaxValue.Date && (end - start).Days < 366;

    private static DateTime ToUtc(DateTime local) =>
        new DateTimeOffset(DateTime.SpecifyKind(local, DateTimeKind.Unspecified), VietnamOffset).UtcDateTime;

    public Task<List<AdminReportOrder>> GetOrdersAsync(DateTime start, DateTime end, int limit)
    {
        var startUtc = ToUtc(start);
        var endUtc = ToUtc(end.AddDays(1));
        return _context.Orders.AsNoTracking()
            .Where(o => o.CreatedAt >= startUtc && o.CreatedAt < endUtc)
            .OrderByDescending(o => o.CreatedAt).ThenByDescending(o => o.Id)
            .Take(limit)
            .Select(o => new AdminReportOrder(o.OrderCode, o.CreatedAt, o.Status,
                o.PaymentMethod, o.PaymentStatus, o.TotalAmount))
            .ToListAsync();
    }

    public async Task<AdminDashboardViewModel> GetAsync(DateTime start, DateTime end)
    {
        var startUtc = ToUtc(start);
        var endUtc = ToUtc(end.AddDays(1));
        var model = new AdminDashboardViewModel
        {
            StartDate = start,
            EndDate = end
        };

        var orders = _context.Orders.AsNoTracking()
            .Where(o => o.CreatedAt >= startUtc && o.CreatedAt < endUtc);
        var delivered = orders.Where(o => o.Status == OrderStatus.Delivered);
        var paid = orders.Where(o => o.PaymentStatus == PaymentStatus.Paid);
        model.TotalProducts = await _context.Products.CountAsync();
        model.TotalCategories = await _context.Categories.CountAsync();
        model.TotalOrders = await orders.CountAsync();
        model.OrderedAmount = await orders.SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
        model.PendingOrders = await orders.CountAsync(o => o.Status == OrderStatus.PendingConfirmation);
        model.DeliveredOrders = await delivered.CountAsync();
        model.CancelledOrders = await orders.CountAsync(o => o.Status == OrderStatus.Cancelled);
        model.PaidOrders = await paid.CountAsync();
        model.TotalCustomers = await (
            from user in _context.Users
            join membership in _context.UserRoles on user.Id equals membership.UserId
            join role in _context.Roles on membership.RoleId equals role.Id
            where user.IsActive && role.NormalizedName == "CUSTOMER"
            select user.Id).CountAsync();
        model.PaidAmount = await paid.SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
        model.RevenueInRange = await delivered.SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
        model.RecentOrders = await orders.OrderByDescending(o => o.CreatedAt)
            .ThenByDescending(o => o.Id).Take(5).ToListAsync();

        // =========================
        // 3. TOP 10 SẢN PHẨM BÁN CHẠY
        // =========================

        var orderItemsInRange = _context.OrderItems
            .AsNoTracking()
            .Where(oi =>
                oi.Order.Status == OrderStatus.Delivered &&
                oi.Order.CreatedAt >= startUtc &&
                oi.Order.CreatedAt < endUtc);

        model.TopSellingProducts = await orderItemsInRange
            .GroupBy(oi => new { oi.ProductVariant.ProductId, oi.ProductName })
            .Select(group => new TopSellingProductViewModel
            {
                ProductName = group.Key.ProductName,
                TotalQuantity = group.Sum(oi => oi.Quantity),
                TotalRevenue = group.Sum(oi => oi.UnitPrice * oi.Quantity)
            })
            .OrderByDescending(p => p.TotalQuantity)
            .Take(10)
            .ToListAsync();

        // =========================
        // 4. DOANH THU THEO DANH MỤC
        // =========================

        model.CategoryRevenues = await orderItemsInRange
            .GroupBy(oi => new { oi.ProductVariant.Product.CategoryId, oi.ProductVariant.Product.Category.Name })
            .Select(group => new CategoryRevenueViewModel
            {
                CategoryName = group.Key.Name,
                TotalQuantity = group.Sum(oi => oi.Quantity),
                TotalRevenue = group.Sum(oi => oi.UnitPrice * oi.Quantity)
            })
            .OrderByDescending(c => c.TotalRevenue)
            .ToListAsync();

        // =========================
        // 5. CẢNH BÁO SẮP HẾT HÀNG
        // =========================

        model.LowStockProducts = await _context.ProductVariants
            .AsNoTracking()
            .Where(v => v.IsActive && v.Product.IsActive && v.StockQuantity <= LowStockThreshold)
            .OrderBy(v => v.StockQuantity)
            .Take(10)
            .Select(v => new LowStockProductViewModel
            {
                ProductName = v.Product.Name,
                SKU = v.SKU,
                Size = v.Size,
                Color = v.Color,
                StockQuantity = v.StockQuantity
            })
            .ToListAsync();

        // =========================
        // 6. BIỂU ĐỒ DOANH THU THEO NGÀY
        // =========================

        var dailyRevenue = await delivered
            .GroupBy(o => o.CreatedAt.AddHours(7).Date)
            .Select(group => new { Date = group.Key, Revenue = group.Sum(o => o.TotalAmount) })
            .ToListAsync();

        var revenueDictionary = dailyRevenue.ToDictionary(
            x => x.Date.Date,
            x => x.Revenue);

        for (var date = start; date <= end; date = date.AddDays(1))
        {
            model.RevenueChartLabels.Add(date.ToString("dd/MM"));
            model.RevenueChartData.Add(
                revenueDictionary.GetValueOrDefault(date.Date, 0));
        }

        // =========================
        // 7. BIỂU ĐỒ TRẠNG THÁI ĐƠN
        // =========================

        var statusStatistics = await orders
            .GroupBy(o => o.Status)
            .Select(group => new
            {
                Status = group.Key,
                Count = group.Count()
            })
            .ToListAsync();

        foreach (var status in Enum.GetValues<OrderStatus>())
        {
            model.OrderStatusLabels.Add(GetStatusName(status));

            model.OrderStatusData.Add(
                statusStatistics.FirstOrDefault(x => x.Status == status)?.Count ?? 0);
        }

        // =========================
        // 8. BIỂU ĐỒ PHƯƠNG THỨC THANH TOÁN
        // =========================

        var paymentStatistics = await orders
            .GroupBy(o => o.PaymentMethod)
            .Select(group => new
            {
                Method = group.Key,
                Count = group.Count()
            })
            .ToListAsync();

        foreach (var method in Enum.GetValues<PaymentMethod>())
        {
            model.PaymentMethodLabels.Add(GetPaymentMethodName(method));

            model.PaymentMethodData.Add(
                paymentStatistics.FirstOrDefault(x => x.Method == method)?.Count ?? 0);
        }

        return model;
    }

    public static string GetStatusName(OrderStatus status)
    {
        return status switch
        {
            OrderStatus.PendingConfirmation => "Chờ xác nhận",
            OrderStatus.Confirmed => "Đã xác nhận",
            OrderStatus.Processing => "Đang xử lý",
            OrderStatus.Shipping => "Đang giao",
            OrderStatus.Delivered => "Đã giao",
            OrderStatus.Cancelled => "Đã hủy",
            OrderStatus.DeliveryFailed => "Giao thất bại",
            OrderStatus.Returned => "Đã hoàn trả",
            _ => status.ToString()
        };
    }

    public static string GetPaymentMethodName(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.COD => "COD",
            PaymentMethod.VietQR => "VietQR",
            _ => method.ToString()
        };
    }
}