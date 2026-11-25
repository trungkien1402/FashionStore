using FashionStore.Models.Enums;

namespace FashionStore.Models.Entities;

public class Shipment
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    /// <summary>Shipper được phân công (UserId của user có role Shipper).</summary>
    public string ShipperId { get; set; } = string.Empty;
    public ApplicationUser Shipper { get; set; } = null!;

    public string TrackingCode { get; set; } = string.Empty;

    public ShipmentStatus Status { get; set; } = ShipmentStatus.Assigned;

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Số tiền COD cần thu (= TotalAmount nếu COD, = 0 nếu đã thanh toán online).</summary>
    public decimal CODAmount { get; set; }

    public ICollection<ShipmentHistory> Histories { get; set; }
        = new List<ShipmentHistory>();

    public ICollection<ShipmentLocation> Locations { get; set; }
    = new List<ShipmentLocation>();
}
