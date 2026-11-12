
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;

namespace FashionStore.Services.Interfaces;

public interface IShipperService
{
    Task<List<Shipment>> GetShipmentsAsync(
        string shipperId,
        ShipmentStatus? status = null);

    Task<Shipment?> GetShipmentDetailsAsync(
        int id,
        string shipperId);

    Task<ShipperUpdateResult> UpdateStatusAsync(
        int id,
        string shipperId,
        ShipmentStatus newStatus,
        string? note);

    Task<ShipperLocationUpdateResult> UpdateLocationAsync(
    int shipmentId,
    string shipperId,
    double latitude,
    double longitude,
    double? accuracy);

    Task<ShipmentLocation?> GetLatestLocationAsync(
        int shipmentId);
}

public class ShipperUpdateResult
{
    public bool Success { get; set; }
    public bool NotFound { get; set; }
    public string Message { get; set; } = string.Empty;
}
public class ShipperLocationUpdateResult
{
    public bool Success { get; set; }
    public bool NotFound { get; set; }
    public string Message { get; set; } = string.Empty;
}