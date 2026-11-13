using FashionStore.Services;
using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = AccessRoles.BackOffice)]
public class AdminShipmentsController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminShipmentsController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET: /AdminShipments
    public async Task<IActionResult> Index(ShipmentStatus? status, string? search, int page = 1)
    {
        var query = _context.Shipments
            .Include(s => s.Order)
            .Include(s => s.Shipper)
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            s = s[..Math.Min(s.Length, 100)];
            query = query.Where(x =>
                x.TrackingCode.Contains(s) ||
                x.Order.OrderCode.Contains(s) ||
                x.Order.ReceiverName.Contains(s) ||
                x.Order.Phone.Contains(s) ||
                x.Shipper.FullName.Contains(s) ||
                (x.Shipper.PhoneNumber != null && x.Shipper.PhoneNumber.Contains(s)));
        }

        ViewBag.SelectedStatus = status;
        ViewBag.Search = search;

        const int pageSize = 30;
        var count = await query.CountAsync();
        var pageCount = Math.Max(1, (count + pageSize - 1) / pageSize);
        page = Math.Clamp(page, 1, pageCount);
        ViewBag.Count = count;
        ViewBag.Page = page;
        ViewBag.PageCount = pageCount;
        var shipments = await query.OrderByDescending(s => s.CreatedAt).ThenByDescending(s => s.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return View(shipments);
    }

    // GET: /AdminShipments/Details/5
    public async Task<IActionResult> Details(int id)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Order)
                .ThenInclude(o => o.Items)
            .Include(s => s.Shipper)
            .Include(s => s.Histories.OrderByDescending(h => h.CreatedAt))
                .ThenInclude(h => h.ChangedByUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shipment == null)
            return NotFound();

        // Lấy danh sách Shipper để phục vụ điều phối lại (reassign) nếu cần
        var shippers = await _userManager.GetUsersInRoleAsync("Shipper");
        ViewBag.Shippers = shippers.Where(u => u.IsActive).ToList();

        return View(shipment);
    }

    // GET: /AdminShipments/Create?orderId=5
    [HttpGet]
    public async Task<IActionResult> Create(int orderId)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return NotFound();

        if (order.Status is not (OrderStatus.Confirmed or OrderStatus.Processing or OrderStatus.Shipping))
        {
            TempData["Error"] = $"Đơn hàng đang ở trạng thái {order.Status}, không thể tạo lượt giao hàng.";
            return RedirectToAction("Details", "AdminOrders", new { id = orderId });
        }

        var shippers = await _userManager.GetUsersInRoleAsync("Shipper");
        var activeShippers = shippers.Where(u => u.IsActive).ToList();

        var codAmount = 0m;
        if (order.PaymentMethod == PaymentMethod.COD && order.PaymentStatus != PaymentStatus.Paid)
        {
            codAmount = order.TotalAmount;
        }

        var model = new CreateShipmentViewModel
        {
            OrderId = order.Id,
            OrderCode = order.OrderCode,
            ReceiverName = order.ReceiverName,
            Phone = order.Phone,
            Address = order.Address,
            CODAmount = codAmount,
            PaymentMethod = order.PaymentMethod.ToString(),
            AvailableShippers = activeShippers.Select(u => new SelectListItem
            {
                Value = u.Id,
                Text = $"{u.FullName} ({u.PhoneNumber ?? u.UserName})"
            }).ToList()
        };

        return View(model);
    }

    // POST: /AdminShipments/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CreateShipmentViewModel model)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == model.OrderId);

        if (order == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(model.ShipperId))
        {
            ModelState.AddModelError(nameof(model.ShipperId), "Vui lòng chọn Shipper.");
        }

        if (!ModelState.IsValid)
        {
            var shippers = await _userManager.GetUsersInRoleAsync("Shipper");
            model.AvailableShippers = shippers.Where(u => u.IsActive).Select(u => new SelectListItem
            {
                Value = u.Id,
                Text = $"{u.FullName} ({u.PhoneNumber ?? u.UserName})"
            }).ToList();
            return View(model);
        }

        var shipper = await _userManager.FindByIdAsync(model.ShipperId);
        if (shipper == null || !shipper.IsActive || !await _userManager.IsInRoleAsync(shipper, "Shipper"))
        {
            ModelState.AddModelError(nameof(model.ShipperId), "Shipper được chọn không tồn tại hoặc đã bị khóa.");
            var shippers = await _userManager.GetUsersInRoleAsync("Shipper");
            model.AvailableShippers = shippers.Where(u => u.IsActive).Select(u => new SelectListItem
            {
                Value = u.Id,
                Text = $"{u.FullName} ({u.PhoneNumber ?? u.UserName})"
            }).ToList();
            return View(model);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
        try
        {
            await _context.Entry(order).ReloadAsync();
            if (_context.Entry(order).State == EntityState.Detached ||
                order.Status is not (OrderStatus.Confirmed or OrderStatus.Processing or OrderStatus.Shipping) ||
                order.InventoryRestored ||
                await _context.Shipments.AnyAsync(s => s.OrderId == order.Id))
            {
                TempData["Error"] = "Đơn chưa sẵn sàng giao hoặc đã có vận đơn. Mở vận đơn hiện có để xử lý.";
                return RedirectToAction("Details", "AdminOrders", new { id = model.OrderId });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var now = DateTime.UtcNow;

            var codAmount = 0m;
            if (order.PaymentMethod == PaymentMethod.COD && order.PaymentStatus != PaymentStatus.Paid)
            {
                codAmount = order.TotalAmount;
            }

            var trackingCode = $"SH{now:yyyyMMddHHmmss}{Guid.NewGuid().ToString("N")[..4].ToUpper()}";

            var shipment = new Shipment
            {
                OrderId = order.Id,
                ShipperId = model.ShipperId,
                TrackingCode = trackingCode,
                Status = ShipmentStatus.Assigned,
                Note = model.Note?.Trim(),
                CODAmount = codAmount,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.Shipments.Add(shipment);
            await _context.SaveChangesAsync();

            // Tạo lịch sử shipment
            var shipmentHistory = new ShipmentHistory
            {
                ShipmentId = shipment.Id,
                OldStatus = ShipmentStatus.Assigned,
                NewStatus = ShipmentStatus.Assigned,
                Note = $"Phân công cho shipper {shipper.FullName}. Ghi chú: {model.Note}",
                ChangedByUserId = currentUserId,
                CreatedAt = now
            };
            _context.ShipmentHistories.Add(shipmentHistory);

            // Tự động chuyển trạng thái đơn sang Shipping nếu đơn đang Confirmed hoặc Processing
            if (order.Status == OrderStatus.Confirmed || order.Status == OrderStatus.Processing)
            {
                var oldOrderStatus = order.Status;
                order.Status = OrderStatus.Shipping;

                var orderHistory = new OrderStatusHistory
                {
                    OrderId = order.Id,
                    OldStatus = oldOrderStatus,
                    NewStatus = OrderStatus.Shipping,
                    ChangedByUserId = currentUserId,
                    Note = $"Đã tạo mã vận đơn {trackingCode} và giao cho Shipper {shipper.FullName}.",
                    CreatedAt = now
                };
                _context.OrderStatusHistories.Add(orderHistory);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            TempData["Success"] = $"Đã tạo lượt giao hàng thành công! Mã vận đơn: {trackingCode}";
            return RedirectToAction(nameof(Details), new { id = shipment.Id });
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();
            ModelState.AddModelError("", "Không thể tạo vận đơn. Tải lại đơn và thử lại.");
            var shippers = await _userManager.GetUsersInRoleAsync("Shipper");
            model.AvailableShippers = shippers.Where(u => u.IsActive).Select(u => new SelectListItem
            {
                Value = u.Id,
                Text = $"{u.FullName} ({u.PhoneNumber ?? u.UserName})"
            }).ToList();
            return View(model);
        }
    }

    // POST: /AdminShipments/Reassign
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Reassign(int id, string newShipperId, string? note)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Order)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shipment == null)
            return NotFound();

        if (shipment.Status == ShipmentStatus.Delivered || shipment.Status == ShipmentStatus.Returned)
        {
            TempData["Error"] = "Không thể phân công lại đơn giao đã hoàn thành hoặc đã trả hàng.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var newShipper = await _userManager.FindByIdAsync(newShipperId);
        if (newShipper == null || !newShipper.IsActive)
        {
            TempData["Error"] = "Shipper được chọn không hợp lệ hoặc đã bị khóa.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var oldShipperId = shipment.ShipperId;
        shipment.ShipperId = newShipperId;
        shipment.UpdatedAt = DateTime.UtcNow;

        var historyNote = $"Điều phối lại từ shipper cũ sang {newShipper.FullName}." +
                          (string.IsNullOrWhiteSpace(note) ? "" : $" Lý do: {note.Trim()}");

        var history = new ShipmentHistory
        {
            ShipmentId = shipment.Id,
            OldStatus = shipment.Status,
            NewStatus = shipment.Status,
            Note = historyNote,
            ChangedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.ShipmentHistories.Add(history);
        await _context.SaveChangesAsync();

        TempData["Success"] = $"Đã điều phối lại cho shipper {newShipper.FullName} thành công.";
        return RedirectToAction(nameof(Details), new { id });
    }
}
