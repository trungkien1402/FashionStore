
using FashionStore.Data;
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

    public AdminOrdersController(ApplicationDbContext context)
    {
        _context = context;
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

            // Nếu hủy đơn, hoàn lại số lượng hàng đã trừ lúc checkout
            if (newStatus == OrderStatus.Cancelled)
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
                Note = $"Cập nhật trạng thái: {oldStatus} → {newStatus}",
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

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdatePaymentStatus(int id, PaymentStatus newStatus)
    {
        if (!Enum.IsDefined(typeof(PaymentStatus), newStatus))
        {
            TempData["Error"] = "Trạng thái thanh toán không hợp lệ.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        var currentStatus = order.PaymentStatus;

        // Không cho phép cập nhật lại đơn đã hoàn tiền.
        if (currentStatus == PaymentStatus.Refunded)
        {
            TempData["Error"] = "Đơn hàng đã hoàn tiền, không thể cập nhật tiếp.";
            return RedirectToAction(nameof(Details), new { id });
        }

        // Chỉ cho phép chuyển sang Paid từ Pending hoặc Failed.
        if (newStatus == PaymentStatus.Paid)
        {
            if (currentStatus != PaymentStatus.Pending &&
                currentStatus != PaymentStatus.Failed)
            {
                TempData["Error"] = "Không thể cập nhật trạng thái thanh toán này.";
                return RedirectToAction(nameof(Details), new { id });
            }
        }
        // Chỉ được đánh dấu Failed khi chưa thanh toán.
        else if (newStatus == PaymentStatus.Failed)
        {
            if (currentStatus != PaymentStatus.Pending)
            {
                TempData["Error"] = "Không thể chuyển trạng thái thanh toán hiện tại sang thất bại.";
                return RedirectToAction(nameof(Details), new { id });
            }
        }
        // Chỉ hoàn tiền khi đã thanh toán và đơn đã hủy, giao thất bại hoặc hoàn hàng.
        else if (newStatus == PaymentStatus.Refunded)
        {
            if (currentStatus != PaymentStatus.Paid)
            {
                TempData["Error"] = "Chỉ có thể hoàn tiền cho đơn hàng đã thanh toán.";
                return RedirectToAction(nameof(Details), new { id });
            }

            if (order.Status != OrderStatus.Cancelled &&
                order.Status != OrderStatus.DeliveryFailed &&
                order.Status != OrderStatus.Returned)
            {
                TempData["Error"] = "Đơn hàng chưa đủ điều kiện ghi nhận hoàn tiền.";
                return RedirectToAction(nameof(Details), new { id });
            }
        }
        else
        {
            TempData["Error"] = "Trạng thái thanh toán không được hỗ trợ.";
            return RedirectToAction(nameof(Details), new { id });
        }

        order.PaymentStatus = newStatus;

        await _context.SaveChangesAsync();

        TempData["Success"] = "Cập nhật trạng thái thanh toán thành công.";

        return RedirectToAction(nameof(Details), new { id });
    }
}
