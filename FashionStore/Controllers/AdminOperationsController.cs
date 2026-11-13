using FashionStore.Services;
using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = AccessRoles.Management)]
[AutoValidateAntiforgeryToken]
public partial class AdminOperationsController(ApplicationDbContext db) : Controller
{
    private string? Actor => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet]
    public async Task<IActionResult> Inventory(string? search, bool low = false)
    {
        var query = db.ProductVariants.AsNoTracking().Include(v => v.Product).AsQueryable();
        var term = search?.Trim();
        if (!string.IsNullOrEmpty(term))
        {
            term = term[..Math.Min(term.Length, 100)];
            query = query.Where(v => v.SKU.Contains(term) || v.Product.Name.Contains(term));
        }
        if (low)
            query = query.Where(v => v.IsActive && v.StockQuantity <= 5);
        ViewBag.Search = term;
        ViewBag.Low = low;
        return View(await query.OrderBy(v => v.StockQuantity).ThenBy(v => v.Id).Take(100).ToListAsync());
    }

    [HttpGet]
    public async Task<IActionResult> Stock(int id)
    {
        var variant = await db.ProductVariants.AsNoTracking().Include(v => v.Product).SingleOrDefaultAsync(v => v.Id == id);
        if (variant == null) return NotFound();
        ViewBag.History = await db.StockMovements.AsNoTracking().Where(m => m.ProductVariantId == id)
            .OrderByDescending(m => m.Id).Take(100).ToListAsync();
        return View(variant);
    }

    [HttpPost]
    public async Task<IActionResult> AdjustStock(int id, int expected, int quantity, string? reason)
    {
        reason = reason?.Trim();
        if (!ModelState.IsValid || quantity < 0 || reason is null or { Length: 0 or > 250 })
            return Error(nameof(Stock), "Nhập số tồn hợp lệ và lý do tối đa 250 ký tự.", id);

        var variant = await db.ProductVariants.SingleOrDefaultAsync(v => v.Id == id);
        if (variant == null) return NotFound();
        if (expected != variant.StockQuantity)
            return Error(nameof(Stock), "Tồn kho vừa thay đổi. Kiểm tra lại số lượng trước khi lưu.", id);
        db.StockReason = reason;
        db.StockActorId = Actor;
        variant.StockQuantity = quantity;
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Error(nameof(Stock), "Tồn kho vừa thay đổi. Vui lòng thử lại.", id);
        }
        return Success(nameof(Stock), "Đã ghi nhận số tồn.", id);
    }

    [HttpGet]
    public async Task<IActionResult> Customers(string? search, int page = 1)
    {
        var users = from user in db.Users.AsNoTracking()
                    join membership in db.UserRoles on user.Id equals membership.UserId
                    join role in db.Roles on membership.RoleId equals role.Id
                    where role.NormalizedName == "CUSTOMER"
                    select user;
        var term = search?.Trim();
        if (!string.IsNullOrEmpty(term))
        {
            term = term[..Math.Min(term.Length, 100)];
            users = users.Where(u => u.FullName.Contains(term) || (u.Email != null && u.Email.Contains(term)));
        }
        var count = await users.CountAsync();
        ViewBag.Search = term;
        ViewBag.Count = count;
        ViewBag.PageCount = Math.Max(1, (count + 29) / 30);
        page = Math.Clamp(page, 1, (int)ViewBag.PageCount);
        ViewBag.Page = page;
        var rows = users.OrderBy(u => u.FullName).ThenBy(u => u.Id).Skip((page - 1) * 30).Take(30)
            .Select(user => new CustomerSummary(user.Id, user.FullName, user.Email,
                db.Orders.Count(o => o.UserId == user.Id),
                db.Orders.Where(o => o.UserId == user.Id && o.PaymentStatus == PaymentStatus.Paid)
                    .Sum(o => (decimal?)o.TotalAmount) ?? 0,
                db.Orders.Where(o => o.UserId == user.Id).Max(o => (DateTime?)o.CreatedAt)));
        return View(await rows.ToListAsync());
    }

    [HttpGet]
    public async Task<IActionResult> Customer(string id)
    {
        var user = await (from account in db.Users.AsNoTracking()
                          join membership in db.UserRoles on account.Id equals membership.UserId
                          join role in db.Roles on membership.RoleId equals role.Id
                          where account.Id == id && role.NormalizedName == "CUSTOMER"
                          select account).SingleOrDefaultAsync();
        if (user == null) return NotFound();
        ViewBag.Name = user.FullName;
        return View(await db.Orders.AsNoTracking().Where(o => o.UserId == id)
            .OrderByDescending(o => o.CreatedAt).Take(100).ToListAsync());
    }

    [HttpGet]
    public async Task<IActionResult> Returns(int? id, ReturnState? status)
    {
        if (!ModelState.IsValid || status is { } value && !Enum.IsDefined(value))
            return BadRequest("Trạng thái yêu cầu không hợp lệ.");

        ViewBag.OrderId = id;
        ViewBag.ReturnStatus = status;
        var query = db.MerchandiseReturns.AsNoTracking().Include(r => r.Order)
            .Include(r => r.Events).AsSplitQuery().AsQueryable();
        if (id.HasValue) query = query.Where(r => r.OrderId == id);
        if (status.HasValue) query = query.Where(r => r.State == status);
        return View(await query.OrderByDescending(r => r.Id).Take(50).ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> RequestReturn(int orderId, string? reason, string? evidence)
    {
        if (!ModelState.IsValid) return BadRequest();
        var order = await db.Orders.AsNoTracking().SingleOrDefaultAsync(o => o.Id == orderId);
        if (order == null) return NotFound();
        var error = await ReturnRequests.SubmitAsync(db, order, Actor, reason, evidence);
        return error == null
            ? Success(nameof(Returns), "Đã tiếp nhận yêu cầu.", orderId)
            : Error(nameof(Returns), error, orderId);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateReturn(int id, ReturnState state, string? note, bool restock, string? refundReference)
    {
        note = note?.Trim();
        refundReference = refundReference?.Trim();
        if (!ModelState.IsValid || note is null or { Length: 0 or > 500 })
            return Error(nameof(Returns), "Cần ghi chú tối đa 500 ký tự.");

        var request = await db.MerchandiseReturns.Include(r => r.Order).ThenInclude(o => o.Items)
            .SingleOrDefaultAsync(r => r.Id == id);
        if (request == null) return NotFound();
        var order = request.Order;
        var allowed = (request.State, state) switch
        {
            (ReturnState.Requested, ReturnState.Approved or ReturnState.Rejected) => true,
            (ReturnState.Approved, ReturnState.Received or ReturnState.Rejected) =>
                order.Status == OrderStatus.Delivered && !order.InventoryRestored,
            (ReturnState.Received, ReturnState.Refunded) =>
                order.Status == OrderStatus.Returned && order.PaymentStatus == PaymentStatus.Paid,
            _ => false
        };
        if (!allowed) return Error(nameof(Returns), "Yêu cầu không thể chuyển sang trạng thái đã chọn.", order.Id);

        if (state == ReturnState.Received)
        {
            if (restock && !order.InventoryRestored)
            {
                var amounts = order.Items.GroupBy(i => i.ProductVariantId).ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));
                var variants = await db.ProductVariants.Where(v => amounts.Keys.Contains(v.Id)).ToListAsync();
                if (variants.Count != amounts.Count)
                    return Error(nameof(Returns), "Không tìm đủ biến thể để nhập lại kho.", order.Id);
                foreach (var variant in variants) variant.StockQuantity = checked(variant.StockQuantity + amounts[variant.Id]);
                order.InventoryRestored = true;
                db.StockReason = "Nhận hàng trả " + order.OrderCode;
                db.StockActorId = Actor;
            }
            db.OrderStatusHistories.Add(new OrderStatusHistory
            {
                OrderId = order.Id, OldStatus = order.Status, NewStatus = OrderStatus.Returned,
                ChangedByUserId = Actor, Note = note
            });
            order.Status = OrderStatus.Returned;
        }
        if (state == ReturnState.Refunded)
        {
            if (refundReference is null or { Length: 0 or > 100 })
                return Error(nameof(Returns), "Nhập mã giao dịch hoặc mã chứng từ hoàn tiền thực tế.", order.Id);
            request.RefundAmount = order.TotalAmount;
            SalesRules.Audit(db, Actor, "ReturnRefundConfirmed", order.OrderCode,
                $"Số tiền {request.RefundAmount}; chứng từ {refundReference}");
            db.PaymentHistories.Add(new PaymentHistory
            {
                OrderId = order.Id, Event = "ReturnRefundConfirmed", Amount = request.RefundAmount,
                OldStatus = order.PaymentStatus, NewStatus = PaymentStatus.Refunded, ActorUserId = Actor
            });
            order.PaymentStatus = PaymentStatus.Refunded;
        }
        SalesRules.Audit(db, Actor, "ReturnStateChanged", order.OrderCode, $"{request.State} → {state}");
        request.State = state;
        request.Events.Add(new ReturnEvent { State = state, ActorId = Actor, Note = note });
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { return Error(nameof(Returns), "Đơn hoặc tồn kho vừa thay đổi. Vui lòng tải lại.", order.Id); }
        return Success(nameof(Returns), "Đã cập nhật yêu cầu đổi trả.", order.Id);
    }

    [HttpGet]
    public async Task<IActionResult> Promotions()
    {
        var vouchers = await db.Vouchers.AsNoTracking()
            .OrderByDescending(v => v.Id).Take(100).ToListAsync();
        var categoryIds = vouchers.Select(v => v.CategoryId).OfType<int>().Distinct().ToList();
        var productIds = vouchers.Select(v => v.ProductId).OfType<int>().Distinct().ToList();
        var categories = await db.Categories.AsNoTracking()
            .Where(c => c.IsActive || categoryIds.Contains(c.Id))
            .OrderBy(c => c.Name).Select(c => new VoucherOption(c.Id, c.Name, c.IsActive))
            .ToListAsync();
        var products = await db.Products.AsNoTracking()
            .Where(p => p.IsActive || productIds.Contains(p.Id))
            .OrderBy(p => p.Name).ThenBy(p => p.Id)
            .Select(p => new VoucherOption(p.Id, p.Name + " · " + p.Category.Name + " · " + p.Slug, p.IsActive))
            .ToListAsync();
        return View(new VoucherPage(vouchers, categories, products));
    }

    [HttpPost]
    public async Task<IActionResult> CreateVoucher(string? code, DateOnly start, DateOnly end, bool percentage, decimal value,
        decimal minimum, decimal? maximum, int totalLimit, int customerLimit, string? scope, int? categoryId, int? productId)
    {
        code = code?.Trim().ToUpperInvariant();
        const decimal maxVnd = 999999999999m;
        if (!ModelState.IsValid || code is null or { Length: 0 or > 40 } ||
            code.Any(c => !char.IsAsciiLetterOrDigit(c) && c != '-') || start.Year < 1900 || end < start ||
            end == DateOnly.MaxValue || value <= 0 || value > maxVnd || percentage && value > 100 ||
            minimum < 0 || minimum > maxVnd || maximum is <= 0 or > maxVnd ||
            totalLimit < 1 || customerLimit < 1 || customerLimit > totalLimit)
            return Error(nameof(Promotions), "Kiểm tra mã, thời hạn, giá trị giảm và giới hạn sử dụng.");

        var validScope = scope switch
        {
            "all" => categoryId == null && productId == null,
            "category" => categoryId.HasValue && productId == null &&
                await db.Categories.AnyAsync(c => c.Id == categoryId && c.IsActive),
            "product" => productId.HasValue && categoryId == null &&
                await db.Products.AnyAsync(p => p.Id == productId && p.IsActive),
            _ => false
        };
        if (!validScope)
            return Error(nameof(Promotions), "Chọn phạm vi áp dụng và danh mục hoặc sản phẩm đang hoạt động.");

        db.Vouchers.Add(new Voucher
        {
            Code = code, StartsAt = start.ToDateTime(TimeOnly.MinValue).AddHours(-7),
            EndsAt = end.AddDays(1).ToDateTime(TimeOnly.MinValue).AddHours(-7),
            IsPercentage = percentage, Value = value, MinimumOrder = minimum, MaximumDiscount = maximum,
            TotalLimit = totalLimit, CustomerLimit = customerLimit, CategoryId = categoryId, ProductId = productId
        });
        SalesRules.Audit(db, Actor, "VoucherCreated", code, $"Giá trị {value}; giới hạn {totalLimit}/{customerLimit}");
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException) { return Error(nameof(Promotions), "Không lưu được mã. Kiểm tra mã trùng."); }
        return Success(nameof(Promotions), "Đã tạo mã giảm giá.");
    }

    [HttpPost]
    public async Task<IActionResult> SetVoucherActive(int id, bool active)
    {
        var voucher = await db.Vouchers.SingleOrDefaultAsync(v => v.Id == id);
        if (voucher == null) return NotFound();
        SalesRules.Audit(db, Actor, "VoucherAvailability", voucher.Code, $"{voucher.IsActive} → {active}");
        voucher.IsActive = active;
        await db.SaveChangesAsync();
        return Success(nameof(Promotions), "Đã cập nhật mã giảm giá.");
    }

    [HttpGet, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Settings() => View(await SalesRules.GetSettingsAsync(db));

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Settings(string? storeName, decimal shippingFee, decimal? freeShippingThreshold,
        int returnWindowDays, string? returnPolicy)
    {
        storeName = storeName?.Trim();
        returnPolicy = returnPolicy?.Trim();
        if (!ModelState.IsValid || storeName is null or { Length: 0 or > 100 } ||
            shippingFee is < 0 or > 999999999999m || freeShippingThreshold is < 0 or > 999999999999m ||
            returnWindowDays is < 1 or > 365 || returnPolicy is { Length: > 1000 })
            return Error(nameof(Settings), "Kiểm tra phí giao, ngưỡng miễn phí và thời hạn đổi trả.");

        var settings = await db.StoreSettings.SingleOrDefaultAsync(s => s.Id == 1);
        if (settings == null)
        {
            settings = new StoreSettings { Id = 1 };
            db.StoreSettings.Add(settings);
        }
        SalesRules.Audit(db, Actor, "StoreSettings", "1",
            $"Phí giao {settings.ShippingFee} → {shippingFee}; miễn phí {settings.FreeShippingThreshold} → {freeShippingThreshold}; đổi trả {settings.ReturnWindowDays} → {returnWindowDays} ngày");
        settings.StoreName = storeName;
        settings.ShippingFee = shippingFee;
        settings.FreeShippingThreshold = freeShippingThreshold;
        settings.ReturnWindowDays = returnWindowDays;
        settings.ReturnPolicy = returnPolicy ?? "";
        await db.SaveChangesAsync();
        return Success(nameof(Settings), "Đã lưu cài đặt.");
    }

    [HttpGet]
    public async Task<IActionResult> Reviews() => View(await db.ProductReviews.AsNoTracking().Include(r => r.Product)
        .OrderByDescending(r => r.IsReported).ThenByDescending(r => r.Id).Take(100).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> ModerateReview(int id, bool visible)
    {
        if (!ModelState.IsValid) return BadRequest();
        var review = await db.ProductReviews.SingleOrDefaultAsync(r => r.Id == id);
        if (review == null) return NotFound();
        SalesRules.Audit(db, Actor, "ReviewVisibility", id.ToString(), $"{review.IsVisible} → {visible}");
        review.IsVisible = visible;
        review.IsReported = false;
        await db.SaveChangesAsync();
        return Success(nameof(Reviews), "Đã xử lý đánh giá.");
    }

    [HttpGet]
    public IActionResult Featured() =>
        RedirectToAction(nameof(Analytics), null, null, "best-selling-products");

    [HttpGet]
    public async Task<IActionResult> Alerts()
    {
        ViewBag.NewOrders = await db.Orders.CountAsync(o => o.Status == OrderStatus.PendingConfirmation);
        ViewBag.LowStock = await db.ProductVariants.CountAsync(v => v.IsActive && v.StockQuantity <= 5);
        ViewBag.FailedShipments = await db.Shipments.CountAsync(s => s.Status == ShipmentStatus.Failed);
        ViewBag.PendingReturns = await db.MerchandiseReturns.CountAsync(r => r.State == ReturnState.Requested);
        return View();
    }

    [HttpGet, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Staff()
    {
        var roles = await (from membership in db.UserRoles
                           join role in db.Roles on membership.RoleId equals role.Id
                           where role.Name == "Admin" || role.Name == "Manager" || role.Name == "Staff" || role.Name == "Shipper"
                           select new { membership.UserId, role.Name }).ToListAsync();
        var ids = roles.Select(r => r.UserId).Distinct().ToList();
        var users = await db.Users.AsNoTracking().Where(u => ids.Contains(u.Id))
            .OrderBy(u => u.FullName).Take(100).ToListAsync();
        ViewBag.Roles = roles.ToLookup(r => r.UserId, r => r.Name);
        return View(users);
    }

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetStaffRole(string id, string role, [FromServices] Microsoft.AspNetCore.Identity.UserManager<ApplicationUser> userManager)
    {
        if (role is not ("Manager" or "Staff" or "Shipper") || id == Actor)
            return Error(nameof(Staff), "Vai trò hoặc tài khoản không hợp lệ.");
        await using var transaction = await db.Database.BeginTransactionAsync();
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return NotFound();
        var current = await userManager.GetRolesAsync(user);
        if (current.Contains("Admin") || current.Contains("Customer") ||
            !current.Any(r => r is "Manager" or "Staff" or "Shipper"))
            return Error(nameof(Staff), "Chỉ đổi vai trò vận hành của nhân viên hiện có.");
        if (current.Count == 1 && current.Contains(role))
            return Success(nameof(Staff), "Vai trò hiện tại đã khớp.");
        var removed = await userManager.RemoveFromRolesAsync(user, current.Where(r => r is "Manager" or "Staff" or "Shipper"));
        if (!removed.Succeeded || !(await userManager.AddToRoleAsync(user, role)).Succeeded ||
            !(await userManager.UpdateSecurityStampAsync(user)).Succeeded)
            return Error(nameof(Staff), "Không thể cập nhật vai trò.");
        SalesRules.Audit(db, Actor, "StaffRole", id, $"{string.Join(", ", current)} → {role}");
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Success(nameof(Staff), "Đã cập nhật vai trò.");
    }

    [HttpGet]
    public async Task<IActionResult> Analytics()
    {
        var end = AdminReportService.Today;
        var start = end.AddDays(-29);
        var utc = start.AddHours(-7);
        var endUtc = end.AddDays(1).AddHours(-7);
        var report = await new AdminReportService(db).GetAsync(start, end);
        var refunds = await db.PaymentHistories.AsNoTracking().Where(h => h.CreatedAt >= utc && h.CreatedAt < endUtc &&
            h.NewStatus == PaymentStatus.Refunded).SumAsync(h => (decimal?)h.Amount) ?? 0;
        var vouchers = await db.Vouchers.AsNoTracking()
            .Select(v => new
            {
                v.Code,
                Uses = v.Redemptions.Count(r => r.Order.CreatedAt >= utc && r.Order.CreatedAt < endUtc),
                Discount = v.Redemptions.Where(r => r.Order.CreatedAt >= utc && r.Order.CreatedAt < endUtc)
                    .Sum(r => (decimal?)r.Order.DiscountAmount) ?? 0
            })
            .OrderByDescending(v => v.Uses).ThenBy(v => v.Code).Take(20)
            .Select(v => new VoucherMetric(v.Code, v.Uses, v.Discount)).ToListAsync();
        var variants = await db.OrderItems.AsNoTracking()
            .Where(i => i.Order.CreatedAt >= utc && i.Order.CreatedAt < endUtc && i.Order.Status == OrderStatus.Delivered)
            .GroupBy(i => new { i.ProductVariant.Size, i.ProductVariant.Color })
            .Select(g => new { g.Key.Size, g.Key.Color, Units = g.Sum(i => i.Quantity) })
            .OrderByDescending(m => m.Units).ThenBy(m => m.Size).ThenBy(m => m.Color).Take(20)
            .Select(m => new VariantMetric(m.Size, m.Color, m.Units)).ToListAsync();
        var ranking = await db.OrderItems.AsNoTracking()
            .Where(item => item.Order.Status == OrderStatus.Delivered &&
                item.Order.CreatedAt >= utc && item.Order.CreatedAt < endUtc)
            .GroupBy(item => new { item.ProductVariant.ProductId, item.ProductVariant.Product.Name })
            .Select(group => new
            {
                group.Key.ProductId,
                group.Key.Name,
                Quantity = group.Sum(item => (long)item.Quantity),
                OrderCount = group.Select(item => item.OrderId).Distinct().Count()
            })
            .OrderByDescending(row => row.Quantity)
            .ThenByDescending(row => row.OrderCount)
            .ThenBy(row => row.ProductId)
            .Take(50)
            .Select(row => new BestSellingProduct(row.ProductId, row.Name, row.Quantity, row.OrderCount))
            .ToListAsync();
        return View(new OperationsAnalytics(report, refunds, vouchers, variants, ranking));
    }

    [HttpGet, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Audit() => View(await db.AdminAuditEvents.AsNoTracking()
        .OrderByDescending(e => e.Id).Take(100).ToListAsync());

    private IActionResult Error(string action, string message, int? id = null)
    {
        TempData["Error"] = message;
        return RedirectToAction(action, new { id });
    }

    private IActionResult Success(string action, string message, int? id = null)
    {
        TempData["Success"] = message;
        return RedirectToAction(action, new { id });
    }
}

public record CustomerSummary(string Id, string Name, string? Email, int Orders, decimal PaidAmount, DateTime? LastOrder);

public record VoucherMetric(string Code, int Uses, decimal Discount);
public record VariantMetric(string Size, string Color, int Units);
public record OperationsAnalytics(FashionStore.Models.ViewModels.AdminDashboardViewModel Report,
    decimal Refunds, List<VoucherMetric> Vouchers, List<VariantMetric> Variants, List<BestSellingProduct> BestSellingProducts);

public record BestSellingProduct(int ProductId, string Name, long Quantity, int OrderCount);

public record VoucherOption(int Id, string Label, bool Active);
public record VoucherPage(List<Voucher> Vouchers, List<VoucherOption> Categories, List<VoucherOption> Products);
