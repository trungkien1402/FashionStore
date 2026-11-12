
using FashionStore.Data;
using FashionStore.Hubs;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Services.Implementations;

public class ShipperService : IShipperService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ShipperService> _logger;
    private readonly IHubContext<ShipmentTrackingHub> _hubContext;

    public ShipperService(
        ApplicationDbContext context,
        ILogger<ShipperService> logger,
        IHubContext<ShipmentTrackingHub> hubContext)
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
    }

    // Lấy danh sách vận đơn của shipper
    public async Task<List<Shipment>> GetShipmentsAsync(
        string shipperId,
        ShipmentStatus? status = null)
    {
        var query = _context.Shipments
            .AsNoTracking()
            .Include(s => s.Order)
            .Where(s => s.ShipperId == shipperId);

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        return await query
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    // Lấy chi tiết vận đơn
    public async Task<Shipment?> GetShipmentDetailsAsync(
        int id,
        string shipperId)
    {
        return await _context.Shipments
            .AsNoTracking()
            .Include(s => s.Order)
                .ThenInclude(o => o.Items)
            .Include(s => s.Histories)
                .ThenInclude(h => h.ChangedByUser)
            .FirstOrDefaultAsync(s =>
                s.Id == id &&
                s.ShipperId == shipperId);
    }

    // Cập nhật trạng thái vận đơn
    public async Task<ShipperUpdateResult> UpdateStatusAsync(
        int id,
        string shipperId,
        ShipmentStatus newStatus,
        string? note)
    {
        if (!Enum.IsDefined(typeof(ShipmentStatus), newStatus))
        {
            return Failure("Trạng thái vận đơn không hợp lệ.");
        }

        if (newStatus == ShipmentStatus.Failed &&
            string.IsNullOrWhiteSpace(note))
        {
            return Failure("Vui lòng nhập lý do giao hàng thất bại.");
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var shipment = await _context.Shipments
                .Include(s => s.Order)
                    .ThenInclude(o => o.Items)
                .FirstOrDefaultAsync(s =>
                    s.Id == id &&
                    s.ShipperId == shipperId);

            if (shipment == null)
            {
                await transaction.RollbackAsync();

                return new ShipperUpdateResult
                {
                    NotFound = true,
                    Message = "Không tìm thấy vận đơn hoặc bạn không được phân công vận đơn này."
                };
            }

            if (!IsValidTransition(shipment.Status, newStatus))
            {
                await transaction.RollbackAsync();

                return Failure(
                    $"Không thể chuyển từ {GetStatusName(shipment.Status)} sang {GetStatusName(newStatus)}.");
            }

            var now = DateTime.UtcNow;
            var oldShipmentStatus = shipment.Status;

            shipment.Status = newStatus;
            shipment.UpdatedAt = now;

            var historyNote = string.IsNullOrWhiteSpace(note)
                ? $"Shipper cập nhật: {GetStatusName(oldShipmentStatus)} → {GetStatusName(newStatus)}."
                : $"Shipper cập nhật: {GetStatusName(oldShipmentStatus)} → {GetStatusName(newStatus)}. Ghi chú: {note.Trim()}";

            _context.ShipmentHistories.Add(new ShipmentHistory
            {
                ShipmentId = shipment.Id,
                OldStatus = oldShipmentStatus,
                NewStatus = newStatus,
                Note = historyNote,
                ChangedByUserId = shipperId,
                CreatedAt = now
            });

            var order = shipment.Order;

            if (order != null)
            {
                var oldOrderStatus = order.Status;
                OrderStatus? newOrderStatus = null;
                string orderNote = string.Empty;

                switch (newStatus)
                {
                    case ShipmentStatus.Delivered:
                        newOrderStatus = OrderStatus.Delivered;
                        orderNote = "Shipper xác nhận giao hàng thành công.";

                        if (order.PaymentMethod == PaymentMethod.COD)
                        {
                            if (order.PaymentStatus != PaymentStatus.Paid)
                            {
                                order.PaymentStatus = PaymentStatus.Paid;
                            }

                            orderNote += " Đã thu tiền COD.";
                        }

                        break;

                    case ShipmentStatus.Failed:
                        newOrderStatus = OrderStatus.DeliveryFailed;
                        orderNote = $"Giao hàng thất bại: {note!.Trim()}";
                        break;

                    case ShipmentStatus.Returned:
                        newOrderStatus = OrderStatus.Returned;
                        orderNote = "Đã hoàn hàng về kho.";

                        if (!order.InventoryRestored)
                        {
                            foreach (var item in order.Items)
                            {
                                var variant = await _context.ProductVariants
                                    .FirstOrDefaultAsync(v =>
                                        v.Id == item.ProductVariantId);

                                if (variant != null)
                                {
                                    variant.StockQuantity += item.Quantity;
                                }
                            }

                            order.InventoryRestored = true;
                        }

                        break;

                    case ShipmentStatus.InTransit:
                        if (order.Status != OrderStatus.Shipping)
                        {
                            newOrderStatus = OrderStatus.Shipping;
                            orderNote = "Shipper bắt đầu giao đơn hàng.";
                        }

                        break;
                }

                if (newOrderStatus.HasValue)
                {
                    order.Status = newOrderStatus.Value;

                    _context.OrderStatusHistories.Add(
                        new OrderStatusHistory
                        {
                            OrderId = order.Id,
                            OldStatus = oldOrderStatus,
                            NewStatus = newOrderStatus.Value,
                            ChangedByUserId = shipperId,
                            Note = orderNote,
                            CreatedAt = now
                        });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new ShipperUpdateResult
            {
                Success = true,
                Message = "Cập nhật tiến trình giao hàng thành công."
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            _logger.LogError(
                ex,
                "Lỗi cập nhật vận đơn {ShipmentId} của shipper {ShipperId}",
                id,
                shipperId);

            return Failure(
                "Có lỗi xảy ra khi cập nhật vận đơn. Vui lòng thử lại.");
        }
    }

    // Cập nhật vị trí GPS và phát SignalR
    public async Task<ShipperLocationUpdateResult> UpdateLocationAsync(
        int shipmentId,
        string shipperId,
        double latitude,
        double longitude,
        double? accuracy)
    {
        if (!double.IsFinite(latitude) ||
            latitude < -90 || latitude > 90 ||
            !double.IsFinite(longitude) ||
            longitude < -180 || longitude > 180 ||
            (accuracy.HasValue &&
             (!double.IsFinite(accuracy.Value) ||
              accuracy.Value < 0 ||
              accuracy.Value > 10000)))
        {
            return LocationFailure("Tọa độ GPS không hợp lệ.");
        }

        var shipment = await _context.Shipments
            .AsNoTracking()
            .Where(s =>
                s.Id == shipmentId &&
                s.ShipperId == shipperId)
            .Select(s => new
            {
                s.Id,
                s.Status
            })
            .FirstOrDefaultAsync();

        if (shipment == null)
        {
            return new ShipperLocationUpdateResult
            {
                NotFound = true,
                Message = "Không tìm thấy vận đơn hoặc bạn không được phân công."
            };
        }

        if (shipment.Status != ShipmentStatus.InTransit)
        {
            return LocationFailure(
                "Chỉ được cập nhật GPS khi đơn hàng đang giao.");
        }

        var now = DateTime.UtcNow;

        var location = new ShipmentLocation
        {
            ShipmentId = shipmentId,
            Latitude = latitude,
            Longitude = longitude,
            Accuracy = accuracy,
            RecordedAt = now
        };

        _context.ShipmentLocations.Add(location);

        await _context.SaveChangesAsync();

        // Phát vị trí mới đến những người đang theo dõi vận đơn
        try
        {
            await _hubContext.Clients
                .Group($"shipment_{shipmentId}")
                .SendAsync("ReceiveLocation", new
                {
                    shipmentId,
                    latitude,
                    longitude,
                    accuracy,
                    recordedAt = now
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Không thể phát GPS realtime cho vận đơn {ShipmentId}",
                shipmentId);
        }

        return new ShipperLocationUpdateResult
        {
            Success = true,
            Message = "Cập nhật vị trí thành công."
        };
    }

    // Lấy vị trí GPS mới nhất
    public async Task<ShipmentLocation?> GetLatestLocationAsync(
        int shipmentId)
    {
        return await _context.ShipmentLocations
            .AsNoTracking()
            .Where(x => x.ShipmentId == shipmentId)
            .OrderByDescending(x => x.RecordedAt)
            .FirstOrDefaultAsync();
    }

    // Quy tắc chuyển trạng thái
    private static bool IsValidTransition(
        ShipmentStatus current,
        ShipmentStatus next)
    {
        return current switch
        {
            ShipmentStatus.Assigned =>
                next == ShipmentStatus.PickedUp ||
                next == ShipmentStatus.Failed,

            ShipmentStatus.PickedUp =>
                next == ShipmentStatus.InTransit ||
                next == ShipmentStatus.Failed,

            ShipmentStatus.InTransit =>
                next == ShipmentStatus.Delivered ||
                next == ShipmentStatus.Failed,

            ShipmentStatus.Failed =>
                next == ShipmentStatus.InTransit ||
                next == ShipmentStatus.Returned,

            _ => false
        };
    }

    private static string GetStatusName(ShipmentStatus status)
    {
        return status switch
        {
            ShipmentStatus.Assigned => "Mới phân công",
            ShipmentStatus.PickedUp => "Đã lấy hàng",
            ShipmentStatus.InTransit => "Đang giao hàng",
            ShipmentStatus.Delivered => "Giao thành công",
            ShipmentStatus.Failed => "Giao thất bại",
            ShipmentStatus.Returned => "Đã hoàn kho",
            _ => status.ToString()
        };
    }

    private static ShipperUpdateResult Failure(string message)
    {
        return new ShipperUpdateResult
        {
            Success = false,
            Message = message
        };
    }

    private static ShipperLocationUpdateResult LocationFailure(
        string message)
    {
        return new ShipperLocationUpdateResult
        {
            Success = false,
            Message = message
        };
    }
}
