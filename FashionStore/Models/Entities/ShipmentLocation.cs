
namespace FashionStore.Models.Entities;

public class ShipmentLocation
{
    public int Id { get; set; }

    public int ShipmentId { get; set; }
    public Shipment Shipment { get; set; } = null!;

    /// <summary>Vĩ độ GPS.</summary>
    public double Latitude { get; set; }

    /// <summary>Kinh độ GPS.</summary>
    public double Longitude { get; set; }

    /// <summary>Độ chính xác GPS, đơn vị mét.</summary>
    public double? Accuracy { get; set; }

    /// <summary>Thời điểm ghi nhận tọa độ UTC.</summary>
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}
