using FashionStore.Services;

using FashionStore.Data;
using FashionStore.Services.Interfaces;
using FashionStore.Services.Implementations;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FashionStore.Controllers;

[Authorize(Roles = AccessRoles.BackOffice)]
public class AdminOrdersController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IPaymentService _payments;

    public AdminOrdersController(ApplicationDbContext context, IPaymentService payments)
    {
        _context = context;
        _payments = payments;
    }

    // GET: /AdminOrders
    public async Task<IActionResult> Index(OrderStatus? status, PaymentStatus? paymentStatus,
        PaymentMethod? paymentMethod, ShipmentStatus? shipmentStatus, string? search,
        DateOnly? from, DateOnly? to, string? sort, int page = 1)
    {
        if (!ModelState.IsValid || from > to || from < new DateOnly(1900, 1, 1) || to == DateOnly.MaxValue ||
            status is { } os && !Enum.IsDefined(os) ||
            paymentStatus is { } ps && !Enum.IsDefined(ps) ||
            paymentMethod is { } pm && !Enum.IsDefined(pm) ||
            shipmentStatus is { } ss && !Enum.IsDefined(ss))
            return BadRequest("Bộ lọc đơn hàng không hợp lệ.");

        var query = _context.Orders.AsNoTracking();
        var term = search?.Trim();
        if (!string.IsNullOrEmpty(term))
        {
            term = term[..Math.Min(term.Length, 100)];
            query = query.Where(o => o.OrderCode.Contains(term) || o.ReceiverName.Contains(term) ||
                o.Phone.Contains(term));
        }
        if (status.HasValue)
            query = query.Where(o => o.Status == status);
        if (paymentStatus.HasValue)
            query = query.Where(o => o.PaymentStatus == paymentStatus);
        if (paymentMethod.HasValue)
            query = query.Where(o => o.PaymentMethod == paymentMethod);
        if (shipmentStatus.HasValue)
            query = query.Where(o => o.Shipments.OrderByDescending(s => s.CreatedAt).ThenByDescending(s => s.Id)
                .Select(s => (ShipmentStatus?)s.Status).FirstOrDefault() == shipmentStatus);
        if (from.HasValue)
        {
            var start = from.Value.ToDateTime(TimeOnly.MinValue).AddHours(-7);
            query = query.Where(o => o.CreatedAt >= start);
        }
        if (to.HasValue)
        {
            var end = to.Value.AddDays(1).ToDateTime(TimeOnly.MinValue).AddHours(-7);
            query = query.Where(o => o.CreatedAt < end);
        }

        const int pageSize = 30;
        var count = await query.CountAsync();
        var pageCount = Math.Max(1, (int)Math.Ceiling(count / (double)pageSize));
        page = Math.Clamp(page, 1, pageCount);
        var ordered = sort switch
        {
            "oldest" => query.OrderBy(o => o.CreatedAt),
            "amount" => query.OrderByDescending(o => o.TotalAmount),
            _ => query.OrderByDescending(o => o.CreatedAt)
        };
        ViewBag.Count = count;
        ViewBag.Page = page;
        ViewBag.PageCount = pageCount;
        ViewBag.Search = term;
        ViewBag.SelectedStatus = status;
        ViewBag.PaymentStatus = paymentStatus;
        ViewBag.PaymentMethod = paymentMethod;
        ViewBag.ShipmentStatus = shipmentStatus;
        ViewBag.From = from?.ToString("yyyy-MM-dd");
        ViewBag.To = to?.ToString("yyyy-MM-dd");
        ViewBag.Sort = sort;
        return View(await ordered.ThenByDescending(o => o.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync());
    }

    // GET: /AdminOrders/Details/5
    public async Task<IActionResult> Details(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        // Lấy lịch sử thay đổi trạng thái của đơn hàng
        var histories = await _context.OrderStatusHistories
            .Include(h => h.ChangedByUser)
            .Where(h => h.OrderId == id)
            .OrderBy(h => h.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        ViewBag.StatusHistories = histories;

        // Lấy lô giao hàng (shipments) của đơn
        var shipments = await _context.Shipments
            .Include(s => s.Shipper)
            .Where(s => s.OrderId == id)
            .OrderByDescending(s => s.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        ViewBag.Shipments = shipments;

        return View(order);
    }

    // POST: /AdminOrders/UpdateStatus
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateStatus(int id, OrderStatus newStatus)
    {
        if (!ModelState.IsValid || !Enum.IsDefined(newStatus))
        {
            TempData["Error"] = "Trạng thái đơn hàng không hợp lệ.";
            return RedirectToAction(nameof(Index));
        }

        if (newStatus is OrderStatus.Cancelled or OrderStatus.Returned &&
            !User.IsInRole("Admin") && !User.IsInRole("Manager"))
            return Forbid();

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                await transaction.RollbackAsync();

                TempData["Error"] = "Không tìm thấy đơn hàng.";
                return RedirectToAction(nameof(Index));
            }

            if (order.Status == OrderStatus.Shipping && await _context.Shipments.AnyAsync(s =>
                    s.OrderId == order.Id && (s.Status == ShipmentStatus.Assigned ||
                    s.Status == ShipmentStatus.PickedUp || s.Status == ShipmentStatus.InTransit)))
            {
                TempData["Error"] = "Cập nhật kết quả giao hàng từ vận đơn đang hoạt động.";
                return RedirectToAction(nameof(Details), new { id });
            }

            // Kiểm tra quy tắc chuyển trạng thái
            if (!IsValidTransition(order.Status, newStatus))
            {
                await transaction.RollbackAsync();

                TempData["Error"] =
                    $"Không thể chuyển từ {order.Status} sang {newStatus}.";

                return RedirectToAction(nameof(Details), new { id });
            }

            var oldStatus = order.Status;

            // Hoàn kho nếu chuyển sang Cancelled, DeliveryFailed, hoặc Returned
            // Dùng cờ InventoryRestored để tránh hoàn kho nhiều lần.
            bool needsInventoryRestore =
                newStatus == OrderStatus.Cancelled ||
                newStatus == OrderStatus.DeliveryFailed ||
                newStatus == OrderStatus.Returned;

            if (needsInventoryRestore && !order.InventoryRestored)
            {
                foreach (var item in order.Items)
                {
                    var variant = await _context.ProductVariants
                        .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId);

                    if (variant == null)
                    {
                        throw new InvalidOperationException(
                            $"Không tìm thấy biến thể sản phẩm có ID {item.ProductVariantId}.");
                    }

                    variant.StockQuantity += item.Quantity;
                }

                order.InventoryRestored = true;
            }

            // Cập nhật trạng thái đơn hàng
            order.Status = newStatus;

            // Tạo lịch sử trạng thái
            var history = new OrderStatusHistory
            {
                OrderId = order.Id,
                OldStatus = oldStatus,
                NewStatus = newStatus,
                ChangedByUserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
                Note = $"Cập nhật trạng thái: {GetStatusName(oldStatus)} → {GetStatusName(newStatus)}",
                CreatedAt = DateTime.UtcNow
            };

            _context.OrderStatusHistories.Add(history);

            // Lưu trạng thái, lịch sử và tồn kho trong cùng transaction
            _context.StockActorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _context.StockReason = "Cập nhật đơn " + order.OrderCode;
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            TempData["Success"] = "Cập nhật trạng thái đơn hàng thành công.";

            return RedirectToAction(nameof(Details), new { id });
        }
        catch (Exception)
        {
            try
            {
                await transaction.RollbackAsync();
            }
            catch
            {
                // Không để lỗi rollback che mất lỗi ban đầu.
            }

            TempData["Error"] =
                "Có lỗi xảy ra khi cập nhật đơn hàng. Vui lòng thử lại.";

            return RedirectToAction(nameof(Details), new { id });
        }
    }

    // Kiểm tra quy tắc chuyển trạng thái
    private static bool IsValidTransition(
        OrderStatus currentStatus,
        OrderStatus newStatus)
    {
        return currentStatus switch
        {
            OrderStatus.PendingConfirmation =>
                newStatus == OrderStatus.Confirmed ||
                newStatus == OrderStatus.Cancelled,

            OrderStatus.Confirmed =>
                newStatus == OrderStatus.Processing ||
                newStatus == OrderStatus.Cancelled,

            OrderStatus.Processing =>
                newStatus == OrderStatus.Shipping ||
                newStatus == OrderStatus.Cancelled,

            OrderStatus.Shipping =>
                newStatus == OrderStatus.Delivered ||
                newStatus == OrderStatus.DeliveryFailed,

            OrderStatus.DeliveryFailed =>
                newStatus == OrderStatus.Returned,

            _ => false
        };
    }

    private static string GetStatusName(OrderStatus status) => status switch
    {
        OrderStatus.PendingConfirmation => "Chờ xác nhận",
        OrderStatus.Confirmed => "Đã xác nhận",
        OrderStatus.Processing => "Đang xử lý",
        OrderStatus.Shipping => "Đang giao hàng",
        OrderStatus.Delivered => "Đã giao thành công",
        OrderStatus.Cancelled => "Đã hủy",
        OrderStatus.DeliveryFailed => "Giao hàng thất bại",
        OrderStatus.Returned => "Đã hoàn hàng",
        _ => status.ToString()
    };

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = AccessRoles.Management)]
    public async Task<IActionResult> UpdatePaymentStatus(int id, PaymentStatus newStatus)
    {
        if (!ModelState.IsValid || !Enum.IsDefined(newStatus))
        {
            TempData["Error"] = "Trạng thái thanh toán không hợp lệ.";
            return RedirectToAction(nameof(Details), new { id });
        }
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(actor)) return Challenge();
        if (newStatus == PaymentStatus.Refunded && await _context.MerchandiseReturns.AnyAsync(r =>
                r.OrderId == id && r.State != ReturnState.Rejected))
        {
            TempData["Error"] = "Ghi nhận hoàn tiền trong yêu cầu đổi trả của đơn này.";
            return RedirectToAction("Returns", "AdminOperations", new { id });
        }

        var result = await _payments.UpdateStatusAsync(id, newStatus, actor);
        TempData[result.Success ? "Success" : "Error"] = result.Message;
        return RedirectToAction(nameof(Details), new { id });
    }

    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    [Authorize(Roles = AccessRoles.Management)]
    public async Task<IActionResult> PaymentHistory(int id)
    {
        if (!await _context.Orders.AnyAsync(o => o.Id == id)) return NotFound();
        var histories = await _context.PaymentHistories.AsNoTracking()
            .Where(h => h.OrderId == id).OrderBy(h => h.CreatedAt).ThenBy(h => h.Id)
            .Select(h => new { h.Id, h.Event, oldStatus = h.OldStatus.ToString(),
                newStatus = h.NewStatus.ToString(), h.Amount, h.ActorUserId, h.CreatedAt })
            .ToListAsync();
        return Json(histories);
    }
}
