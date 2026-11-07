using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class AdminDashboardViewModel
{
    // Thống kê tổng quan
    public int TotalProducts { get; set; }
    public int TotalCategories { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int TotalCustomers { get; set; }

    // Doanh thu
    public decimal TotalRevenue { get; set; }
    public decimal TodayRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal RevenueInRange { get; set; }

    // Bộ lọc
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Đơn hàng và sản phẩm
    public List<Order> RecentOrders { get; set; } = new();
    public List<TopSellingProductViewModel> TopSellingProducts { get; set; } = new();
    public List<CategoryRevenueViewModel> CategoryRevenues { get; set; } = new();
    public List<LowStockProductViewModel> LowStockProducts { get; set; } = new();

    // Dữ liệu biểu đồ
    public List<string> RevenueChartLabels { get; set; } = new();
    public List<decimal> RevenueChartData { get; set; } = new();

    public List<string> OrderStatusLabels { get; set; } = new();
    public List<int> OrderStatusData { get; set; } = new();

    public List<string> PaymentMethodLabels { get; set; } = new();
    public List<int> PaymentMethodData { get; set; } = new();
}

public class TopSellingProductViewModel
{
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class CategoryRevenueViewModel
{
    public string CategoryName { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public int TotalQuantity { get; set; }
}

public class LowStockProductViewModel
{
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}