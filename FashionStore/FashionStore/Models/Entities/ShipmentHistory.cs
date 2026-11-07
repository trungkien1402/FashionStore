using FashionStore.Models.Enums;

namespace FashionStore.Models.Entities;

public class ShipmentHistory
{
    public int Id { get; set; }

    public int ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;

    public ShipmentStatus OldStatus { get; set; }
    public ShipmentStatus NewStatus { get; set; }

    public string? Note { get; set; }

    public string? ChangedByUserId { get; set; }
    public ApplicationUser? ChangedByUser { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
