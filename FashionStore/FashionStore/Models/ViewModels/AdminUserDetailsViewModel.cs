using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class AdminUserDetailsViewModel
{
    public ApplicationUser User { get; set; } = null!;

    public IList<string> Roles { get; set; } = new List<string>();

    public int TotalOrders { get; set; }

    public decimal TotalSpent { get; set; }

    public List<Order> RecentOrders { get; set; } = new();

    public int TotalShipments { get; set; }

    public int DeliveredShipments { get; set; }

    public List<Shipment> RecentShipments { get; set; } = new();

    public bool IsCurrentAdmin { get; set; }
}
