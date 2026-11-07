using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Shipper")]
public class ShipperController : Controller
{
    private readonly ApplicationDbContext _context;

    public ShipperController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /Shipper
    public async Task<IActionResult> Index(ShipmentStatus? status)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId))
            return Challenge();

        var query = _context.Shipments
            .Include(s => s.Order)
            .Where(s => s.ShipperId == currentUserId)
            .OrderByDescending(s => s.CreatedAt)
            .AsNoTracking()
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        ViewBag.SelectedStatus = status;

        var shipments = await query.ToListAsync();
        return View(shipments);
    }

    // GET: /Shipper/Details/5
    public async Task<IActionResult> Details(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId))
            return Challenge();

        var shipment = await _context.Shipments
            .Include(s => s.Order)
                .ThenInclude(o => o.Items)
            .Include(s => s.Histories.OrderByDescending(h => h.CreatedAt))
                .ThenInclude(h => h.ChangedByUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id && s.ShipperId == currentUserId);

        if (shipment == null)
            return NotFound();

        return View(shipment);
    }

    // POST: /Shipper/UpdateStatus
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateStatus(int id, ShipmentStatus newStatus, string? note)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId))
            return Challenge();

        if (newStatus == ShipmentStatus.Failed && string.IsNullOrWhiteSpace(note))
        {
            TempData["Error"] = "Vui lòng nhập lý do giao hàng không thành công vào phần ghi chú.";
            return RedirectToAction(nameof(Details), new { id });
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var shipment = await _context.Shipments
                .Include(s => s.Order)
                    .ThenInclude(o => o.Items)
                .FirstOrDefaultAsync(s => s.Id == id && s.ShipperId == currentUserId);

            if (shipment == null)
            {
                await transaction.RollbackAsync();
                return NotFound();
            }

            // Kiểm tra quy tắc chuyển trạng thái của shipment
            if (!IsValidShipmentTransition(shipment.Status, newStatus))
            {
                await transaction.RollbackAsync();
                TempData["Error"] = $"Không thể chuyển từ trạng thái {GetShipmentStatusName(shipment.Status)} sang {GetShipmentStatusName(newStatus)}.";
                return RedirectToAction(nameof(Details), new { id });
            }

            var oldShipmentStatus = shipment.Status;
            var now = DateTime.UtcNow;

            shipment.Status = newStatus;
            shipment.UpdatedAt = now;

            var historyNote = string.IsNullOrWhiteSpace(note)
                ? $"Shipper cập nhật trạng thái: {GetShipmentStatusName(oldShipmentStatus)} → {GetShipmentStatusName(newStatus)}"
                : $"Shipper cập nhật: {GetShipmentStatusName(oldShipmentStatus)} → {GetShipmentStatusName(newStatus)}. Ghi chú: {note.Trim()}";

            _context.ShipmentHistories.Add(new ShipmentHistory
            {
                ShipmentId = shipment.Id,
                OldStatus = oldShipmentStatus,
                NewStatus = newStatus,
                Note = historyNote,
                ChangedByUserId = currentUserId,
                CreatedAt = now
            });

            // Đồng bộ sang trạng thái Đơn hàng
            var order = shipment.Order;
            if (order != null)
            {
                var oldOrderStatus = order.Status;

                if (newStatus == ShipmentStatus.Delivered)
                {
                    order.Status = OrderStatus.Delivered;

                    // Nếu COD, shipper giao thành công đồng nghĩa đã thu tiền
                    if (order.PaymentMethod == PaymentMethod.COD && order.PaymentStatus != PaymentStatus.Paid)
                    {
                        order.PaymentStatus = PaymentStatus.Paid;
                    }

                    _context.OrderStatusHistories.Add(new OrderStatusHistory
                    {
                        OrderId = order.Id,
                        OldStatus = oldOrderStatus,
                        NewStatus = OrderStatus.Delivered,
                        ChangedByUserId = currentUserId,
                        Note = "Shipper xác nhận giao hàng thành công" + (order.PaymentMethod == PaymentMethod.COD ? " và đã thu tiền COD." : "."),
                        CreatedAt = now
                    });
                }
                else if (newStatus == ShipmentStatus.Failed)
                {
                    order.Status = OrderStatus.DeliveryFailed;

                    _context.OrderStatusHistories.Add(new OrderStatusHistory
                    {
                        OrderId = order.Id,
                        OldStatus = oldOrderStatus,
                        NewStatus = OrderStatus.DeliveryFailed,
                        ChangedByUserId = currentUserId,
                        Note = $"Giao hàng thất bại: {note?.Trim()}",
                        CreatedAt = now
                    });
                }
                else if (newStatus == ShipmentStatus.Returned)
                {
                    order.Status = OrderStatus.Returned;

                    // Hoàn hàng về kho: hoàn tồn kho nếu chưa hoàn
                    if (!order.InventoryRestored)
                    {
                        foreach (var item in order.Items)
                        {
                            var variant = await _context.ProductVariants
                                .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId);

                            if (variant != null)
                            {
                                variant.StockQuantity += item.Quantity;
                            }
                        }
                        order.InventoryRestored = true;
                    }

                    _context.OrderStatusHistories.Add(new OrderStatusHistory
                    {
                        OrderId = order.Id,
                        OldStatus = oldOrderStatus,
                        NewStatus = OrderStatus.Returned,
                        ChangedByUserId = currentUserId,
                        Note = $"Đã hoàn hàng về kho. {note?.Trim()}",
                        CreatedAt = now
                    });
                }
                else if (newStatus == ShipmentStatus.InTransit && order.Status != OrderStatus.Shipping)
                {
                    order.Status = OrderStatus.Shipping;

                    _context.OrderStatusHistories.Add(new OrderStatusHistory
                    {
                        OrderId = order.Id,
                        OldStatus = oldOrderStatus,
                        NewStatus = OrderStatus.Shipping,
                        ChangedByUserId = currentUserId,
                        Note = "Shipper đang giao đơn hàng.",
                        CreatedAt = now
                    });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            TempData["Success"] = "Cập nhật tiến trình giao hàng thành công.";
            return RedirectToAction(nameof(Details), new { id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            TempData["Error"] = $"Có lỗi xảy ra: {ex.Message}";
            return RedirectToAction(nameof(Details), new { id });
        }
    }

    private static bool IsValidShipmentTransition(ShipmentStatus current, ShipmentStatus next)
    {
        return current switch
        {
            ShipmentStatus.Assigned => next == ShipmentStatus.PickedUp || next == ShipmentStatus.Failed,
            ShipmentStatus.PickedUp => next == ShipmentStatus.InTransit || next == ShipmentStatus.Failed,
            ShipmentStatus.InTransit => next == ShipmentStatus.Delivered || next == ShipmentStatus.Failed,
            ShipmentStatus.Failed => next == ShipmentStatus.InTransit || next == ShipmentStatus.Returned,
            _ => false
        };
    }

    private static string GetShipmentStatusName(ShipmentStatus status) => status switch
    {
        ShipmentStatus.Assigned => "Đã phân công",
        ShipmentStatus.PickedUp => "Đã lấy hàng",
        ShipmentStatus.InTransit => "Đang giao hàng",
        ShipmentStatus.Delivered => "Giao thành công",
        ShipmentStatus.Failed => "Giao thất bại",
        ShipmentStatus.Returned => "Đã hoàn kho",
        _ => status.ToString()
    };
}
