using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Enums;
using FashionStore.Services;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize]
public class NotificationsController(ApplicationDbContext db) : Controller
{
    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> Feed(CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Challenge();

        var items = new List<NotificationItem>();
        if (User.IsInRole("Customer"))
        {
            var orders = await db.Orders.AsNoTracking().Where(o => o.UserId == userId)
                .Select(o => new
                {
                    o.Id, o.OrderCode, o.Status,
                    UpdatedAt = db.OrderStatusHistories.Where(h => h.OrderId == o.Id)
                        .Max(h => (DateTime?)h.CreatedAt) ?? o.CreatedAt
                })
                .OrderByDescending(o => o.UpdatedAt).ThenByDescending(o => o.Id).Take(5).ToListAsync(ct);

            foreach (var order in orders)
            {
                var kind = order.Status switch
                {
                    OrderStatus.Delivered => "delivered",
                    OrderStatus.Shipping => "shipping",
                    OrderStatus.Cancelled or OrderStatus.DeliveryFailed => "warning",
                    _ => "order"
                };
                items.Add(new(kind, AdminReportService.GetStatusName(order.Status),
                    Url.Action("Details", "Orders", new { id = order.Id })!,
                    $"Đơn hàng #{order.OrderCode}", DateTime.SpecifyKind(order.UpdatedAt, DateTimeKind.Utc)));
            }

            var returns = await db.MerchandiseReturns.AsNoTracking()
                .Where(r => r.Order.UserId == userId)
                .Select(r => new
                {
                    r.Id, r.OrderId, r.Order.OrderCode, r.State,
                    UpdatedAt = r.Events.Max(e => (DateTime?)e.CreatedAt) ?? r.CreatedAt
                })
                .OrderByDescending(r => r.UpdatedAt).ThenByDescending(r => r.Id).Take(5).ToListAsync(ct);
            foreach (var request in returns)
                items.Add(new("return", ReturnRequests.Label(request.State),
                    Url.Action("ReturnRequest", "Orders", new { id = request.OrderId })!,
                    $"Trả hàng · #{request.OrderCode}", DateTime.SpecifyKind(request.UpdatedAt, DateTimeKind.Utc)));
        }

        if (User.IsInRole("Shipper"))
        {
            var shipments = await db.Shipments.AsNoTracking()
                .Where(s => s.ShipperId == userId && (s.Status == ShipmentStatus.Assigned ||
                    s.Status == ShipmentStatus.PickedUp || s.Status == ShipmentStatus.InTransit))
                .OrderByDescending(s => s.UpdatedAt).ThenByDescending(s => s.Id).Take(5)
                .Select(s => new { s.Id, s.TrackingCode, s.Status, s.UpdatedAt }).ToListAsync(ct);
            foreach (var shipment in shipments)
            {
                var status = shipment.Status switch
                {
                    ShipmentStatus.Assigned => "Chờ lấy hàng",
                    ShipmentStatus.PickedUp => "Đã lấy hàng",
                    _ => "Đang giao"
                };
                items.Add(new("shipping", status, Url.Action("Details", "Shipper", new { id = shipment.Id })!,
                    $"Vận đơn #{shipment.TrackingCode}", DateTime.SpecifyKind(shipment.UpdatedAt, DateTimeKind.Utc)));
            }
        }

        if (AccessRoles.CanUseBackOffice(User))
        {
            var pending = await db.Orders.CountAsync(o => o.Status == OrderStatus.PendingConfirmation, ct);
            var failed = await db.Shipments.CountAsync(s => s.Status == ShipmentStatus.Failed, ct);
            var support = await db.SupportRequests.CountAsync(s => s.Status == SupportRequestStatus.Pending, ct);
            if (pending > 0)
                items.Add(new("order", $"{pending} đơn chờ xác nhận",
                    Url.Action("Index", "AdminOrders", new { status = OrderStatus.PendingConfirmation })!));
            if (failed > 0)
                items.Add(new("warning", $"{failed} vận đơn giao thất bại",
                    Url.Action("Index", "AdminShipments", new { status = ShipmentStatus.Failed })!));
            if (support > 0)
                items.Add(new("support", $"{support} yêu cầu hỗ trợ đang chờ",
                    Url.Action("Index", "AdminSupportRequests", new { status = SupportRequestStatus.Pending })!));
        }

        if (AccessRoles.CanManage(User))
        {
            var low = await db.ProductVariants.CountAsync(v => v.IsActive && v.Product.IsActive && v.StockQuantity <= 5, ct);
            var returns = await db.MerchandiseReturns.CountAsync(r => r.State == Models.Entities.ReturnState.Requested, ct);
            if (low > 0)
                items.Add(new("stock", $"{low} biến thể tồn kho thấp", Url.Action("Inventory", "AdminOperations", new { low = true })!));
            if (returns > 0)
                items.Add(new("return", $"{returns} yêu cầu đổi trả chờ duyệt", Url.Action("Returns", "AdminOperations")!));
        }

        return Json(items);
    }

    private record NotificationItem(string Kind, string Title, string Url, string? Detail = null, DateTime? UpdatedAt = null);
}
