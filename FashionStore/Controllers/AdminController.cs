using System.Globalization;
using System.Text;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin,Manager,Staff")]
public class AdminController : Controller
{
    private readonly ApplicationDbContext _context;

    private const int LowStockThreshold = 5;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /Admin
    public async Task<IActionResult> Index(DateTime? startDate, DateTime? endDate)
    {
        var today = DateTime.Today;

        var start = (startDate ?? today.AddDays(-6)).Date;
        var end = (endDate ?? today).Date;

        if (end < start)
        {
            (start, end) = (end, start);
        }

        // Dùng mốc đầu ngày kế tiếp để lấy trọn ngày cuối.
        var endExclusive = end.AddDays(1);

        var model = new AdminDashboardViewModel
        {
            StartDate = start,
            EndDate = end
        };

        // =========================
        // 1. THỐNG KÊ TỔNG QUAN
        // =========================

        model.TotalProducts = await _context.Products.CountAsync();
        model.TotalCategories = await _context.Categories.CountAsync();
        model.TotalOrders = await _context.Orders.CountAsync();

        model.PendingOrders = await _context.Orders.CountAsync(
            o => o.Status == OrderStatus.PendingConfirmation);

        model.TotalCustomers = await _context.Users
            .CountAsync(u => u.IsActive);

        // Doanh thu toàn hệ thống: chỉ tính đơn đã giao.
        model.TotalRevenue = await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        // Doanh thu hôm nay.
        model.TodayRevenue = await _context.Orders
            .Where(o =>
                o.Status == OrderStatus.Delivered &&
                o.CreatedAt >= today &&
                o.CreatedAt < today.AddDays(1))
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        // Doanh thu tháng hiện tại.
        var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
        var firstDayOfNextMonth = firstDayOfMonth.AddMonths(1);

        model.MonthlyRevenue = await _context.Orders
            .Where(o =>
                o.Status == OrderStatus.Delivered &&
                o.CreatedAt >= firstDayOfMonth &&
                o.CreatedAt < firstDayOfNextMonth)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        // Doanh thu trong khoảng ngày lọc.
        model.RevenueInRange = await _context.Orders
            .Where(o =>
                o.Status == OrderStatus.Delivered &&
                o.CreatedAt >= start &&
                o.CreatedAt < endExclusive)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        // =========================
        // 2. ĐƠN HÀNG MỚI NHẤT
        // =========================

        model.RecentOrders = await _context.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .ToListAsync();

        // =========================
        // 3. TOP 10 SẢN PHẨM BÁN CHẠY
        // =========================

        var orderItemsInRange = _context.OrderItems
            .AsNoTracking()
            .Where(oi =>
                oi.Order.Status == OrderStatus.Delivered &&
                oi.Order.CreatedAt >= start &&
                oi.Order.CreatedAt < endExclusive);

        model.TopSellingProducts = await orderItemsInRange
            .GroupBy(oi => oi.ProductName)
            .Select(group => new TopSellingProductViewModel
            {
                ProductName = group.Key,
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
            .GroupBy(oi => oi.ProductVariant.Product.Category.Name)
            .Select(group => new CategoryRevenueViewModel
            {
                CategoryName = group.Key,
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
            .Where(v => v.IsActive && v.StockQuantity <= LowStockThreshold)
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

        var dailyRevenue = await _context.Orders
            .AsNoTracking()
            .Where(o =>
                o.Status == OrderStatus.Delivered &&
                o.CreatedAt >= start &&
                o.CreatedAt < endExclusive)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(group => new
            {
                Date = group.Key,
                Revenue = group.Sum(o => o.TotalAmount)
            })
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

        var statusStatistics = await _context.Orders
            .AsNoTracking()
            .Where(o =>
                o.CreatedAt >= start &&
                o.CreatedAt < endExclusive)
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

        var paymentStatistics = await _context.Orders
            .AsNoTracking()
            .Where(o =>
                o.CreatedAt >= start &&
                o.CreatedAt < endExclusive)
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

        return View(model);
    }

    // GET: /Admin/ExportReport
    // Xuất báo cáo CSV tương thích Excel.
    public async Task<IActionResult> ExportReport(DateTime? startDate, DateTime? endDate)
    {
        var start = (startDate ?? DateTime.Today.AddDays(-6)).Date;
        var end = (endDate ?? DateTime.Today).Date;

        if (end < start)
        {
            (start, end) = (end, start);
        }

        var endExclusive = end.AddDays(1);

        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o =>
                o.Status == OrderStatus.Delivered &&
                o.CreatedAt >= start &&
                o.CreatedAt < endExclusive)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var csv = new StringBuilder();

        // BOM giúp Excel nhận diện UTF-8 và hiển thị tiếng Việt.
        csv.AppendLine("Bao cao doanh thu FashionStore");
        csv.AppendLine($"Tu ngay,{start:dd/MM/yyyy}");
        csv.AppendLine($"Den ngay,{end:dd/MM/yyyy}");
        csv.AppendLine();
        csv.AppendLine("Ma don,Ngay dat,Nguoi nhan,So dien thoai,Phuong thuc thanh toan,Tong tien");

        foreach (var order in orders)
        {
            csv.AppendLine(string.Join(",",
                CsvEscape(order.OrderCode),
                CsvEscape(order.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm")),
                CsvEscape(order.ReceiverName),
                CsvEscape(order.Phone),
                CsvEscape(GetPaymentMethodName(order.PaymentMethod)),
                order.TotalAmount.ToString(CultureInfo.InvariantCulture)));
        }

        csv.AppendLine();
        csv.AppendLine($"Tong doanh thu,,,,,{orders.Sum(o => o.TotalAmount).ToString(CultureInfo.InvariantCulture)}");

        var bytes = Encoding.UTF8.GetPreamble()
            .Concat(Encoding.UTF8.GetBytes(csv.ToString()))
            .ToArray();

        var fileName = $"FashionStore_Report_{start:yyyyMMdd}_{end:yyyyMMdd}.csv";

        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    private static string CsvEscape(string? value)
    {
        value ??= string.Empty;
        return "\"" + value.Replace("\"", "\"\"") + "\"";
    }

    private static string GetStatusName(OrderStatus status)
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

    private static string GetPaymentMethodName(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.COD => "COD",
            PaymentMethod.VietQR => "VietQR",
            _ => method.ToString()
        };
    }
}