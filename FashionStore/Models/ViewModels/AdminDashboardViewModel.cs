
using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class AdminDashboardViewModel
{
    public int TotalProducts { get; set; }

    public int TotalCategories { get; set; }

    public int TotalOrders { get; set; }

    public int PendingOrders { get; set; }

    public decimal TotalRevenue { get; set; }

    public List<Order> RecentOrders { get; set; } = new();

    public List<TopSellingProductViewModel> TopSellingProducts { get; set; } = new();
}

public class TopSellingProductViewModel
{
    public string ProductName { get; set; } = string.Empty;

    public int TotalQuantity { get; set; }

    public decimal TotalRevenue { get; set; }
}
