
using FashionStore.Data;
using FashionStore.Services.Interfaces;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin,Manager,Staff")]
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
    public async Task<IActionResult> Index(OrderStatus? status)
    {
        var query = _context.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        ViewBag.SelectedStatus = status;

        var orders = await query.ToListAsync();

        return View(orders);
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
        if (!Enum.IsDefined(typeof(OrderStatus), newStatus))
        {
            TempData["Error"] = "Trạng thái đơn hàng không hợp lệ.";
            return RedirectToAction(nameof(Index));
        }

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
                newStatus == OrderStatus.Shipping ||
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
    public async Task<IActionResult> UpdatePaymentStatus(int id, PaymentStatus newStatus)
    {
        if (!ModelState.IsValid || !Enum.IsDefined(newStatus))
        {
            TempData["Error"] = "Trạng thái thanh toán không hợp lệ.";
            return RedirectToAction(nameof(Details), new { id });
        }
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(actor)) return Challenge();
        var result = await _payments.UpdateStatusAsync(id, newStatus, actor);
        TempData[result.Success ? "Success" : "Error"] = result.Message;
        return RedirectToAction(nameof(Details), new { id });
    }

    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
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
