using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class AdminNotificationItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Type { get; set; } = "Order"; // "Order", "Stock", "Shipment", "Return", "Review", "System"
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string BadgeText { get; set; } = "";
    public string BadgeClass { get; set; } = "";
    public string Icon { get; set; } = "bi-bell";
    public string IconColor { get; set; } = "#F59E0B";
    public string IconBg = "rgba(245, 158, 11, 0.12)";
    public DateTime Timestamp { get; set; }
    public string ActionUrl { get; set; } = "";
    public string ActionText { get; set; } = "Xem chi tiết";
    public bool IsUrgent { get; set; }
}

public class AdminAlertsViewModel
{
    public int NewOrdersCount { get; set; }
    public int LowStockCount { get; set; }
    public int FailedShipmentsCount { get; set; }
    public int PendingReturnsCount { get; set; }
    public int TotalAlertsCount => NewOrdersCount + (LowStockCount > 0 ? 1 : 0) + FailedShipmentsCount + PendingReturnsCount;
    public string CurrentFilter { get; set; } = "all";
    public List<AdminNotificationItem> Notifications { get; set; } = [];
    public List<AdminAuditEvent> RecentEvents { get; set; } = [];
}
