using Microsoft.AspNetCore.DataProtection;
using FashionStore.Services.Implementations;
using System.Security.Claims;
using System.Text.Json;
using FashionStore.Data;
using FashionStore.Services.Interfaces;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize]
public class OrdersController : Controller
{
    private const string CartSessionKey = "FashionStore_Cart";
    private const decimal DefaultShippingFee = 30000m;

    private readonly ApplicationDbContext _context;
    private readonly IPaymentService _payments;

    public OrdersController(ApplicationDbContext context, IPaymentService payments)
    {
        _context = context;
        _payments = payments;
    }

    private List<CartItemViewModel> GetCart()
    {
        var json = HttpContext.Session.GetString(CartSessionKey);

        if (string.IsNullOrWhiteSpace(json))
            return new List<CartItemViewModel>();

        return JsonSerializer.Deserialize<List<CartItemViewModel>>(json)
               ?? new List<CartItemViewModel>();
    }

    // GET: /Orders/Checkout
    [HttpGet]
    public async Task<IActionResult> Checkout([FromServices] IDataProtectionProvider protection)
    {
        var cart = GetCart();

        if (!cart.Any())
        {
            TempData["CartError"] = "Giỏ hàng đang trống.";
            return RedirectToAction("Index", "Cart");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == User.FindFirstValue(ClaimTypes.NameIdentifier));

        if (user == null || !user.IsActive)
            return Forbid();

        var model = new CheckoutViewModel
        {
            ReceiverName = user.FullName,
            Phone = user.PhoneNumber ?? string.Empty,
            ShippingFee = DefaultShippingFee,
            CartItems = cart
        };

        // Tính lại giá từ database, không tin giá lưu trong Session.
        var variantIds = cart.Select(x => x.ProductVariantId).Distinct().ToList();

        var variants = await _context.ProductVariants
            .Include(v => v.Product)
            .Where(v => variantIds.Contains(v.Id))
            .ToListAsync();

        if (variants.Count != variantIds.Count)
        {
            TempData["CartError"] = "Một số sản phẩm trong giỏ hàng không còn tồn tại.";
            return RedirectToAction("Index", "Cart");
        }

        model.CartItems = cart.Select(item =>
        {
            var variant = variants.First(v => v.Id == item.ProductVariantId);

            return new CartItemViewModel
            {
                ProductVariantId = variant.Id,
                ProductId = variant.ProductId,
                ProductName = variant.Product.Name,
                ImageUrl = ShowroomCatalog.FrontPhoto(variant.Product, variant.Color),
                SKU = variant.SKU,
                Size = variant.Size,
                Color = variant.Color,
                UnitPrice = variant.Price,
                Quantity = item.Quantity
            };
        }).ToList();

        model.SubTotal = model.CartItems.Sum(x => x.TotalPrice);

        var rewardToken = HttpContext.Session.GetString("StyleGameReward");
        if (rewardToken != null)
        {
            try
            {
                var reward = JsonSerializer.Deserialize<StyleReward>(StyleGame.RewardProtector(protection).Unprotect(rewardToken));
                if (reward != null && reward.UserId == User.FindFirstValue(ClaimTypes.NameIdentifier))
                    model.VoucherCode = reward.Code;
            }
            catch (System.Security.Cryptography.CryptographicException) { }
        }

        return View(model);
    }

    // POST: /Orders/Checkout
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Checkout(CheckoutViewModel model, [FromServices] IDataProtectionProvider protection)
    {
        var cart = GetCart();

        if (!cart.Any())
        {
            TempData["CartError"] = "Giỏ hàng đang trống.";
            return RedirectToAction("Index", "Cart");
        }

        if (model.PaymentMethod != "COD" && model.PaymentMethod != "VietQR")
        {
            ModelState.AddModelError(
                nameof(model.PaymentMethod),
                "Phương thức thanh toán hiện chưa được hỗ trợ.");
        }

        if (model.PaymentMethod == "VietQR" && !_payments.IsVietQrReady)
            ModelState.AddModelError(nameof(model.PaymentMethod), "Chưa cấu hình tài khoản nhận VietQR.");

        if (!ModelState.IsValid)
        {
            await PopulateCheckoutItemsAsync(model, cart);
            return View(model);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Challenge();

        if (!await _context.Users.AnyAsync(u => u.Id == userId && u.IsActive))
            return Forbid();

        await using var transaction =
            await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        try
        {
            var variantIds = cart.Select(x => x.ProductVariantId)
                .Distinct()
                .ToList();

            var variants = await _context.ProductVariants
                .Include(v => v.Product)
                .Where(v => variantIds.Contains(v.Id))
                .ToListAsync();

            if (variants.Count != variantIds.Count)
            {
                await transaction.RollbackAsync();
                ModelState.AddModelError("", "Một số sản phẩm không còn tồn tại.");
                await PopulateCheckoutItemsAsync(model, cart);
                return View(model);
            }

            // Kiểm tra tồn kho và trạng thái sản phẩm.
            foreach (var item in cart)
            {
                var variant = variants.First(v => v.Id == item.ProductVariantId);

                if (!variant.IsActive || !variant.Product.IsActive)
                {
                    await transaction.RollbackAsync();
                    ModelState.AddModelError("", $"Sản phẩm {variant.Product.Name} hiện không kinh doanh.");
                    await PopulateCheckoutItemsAsync(model, cart);
                    return View(model);
                }

                if (item.Quantity <= 0 || item.Quantity > variant.StockQuantity)
                {
                    await transaction.RollbackAsync();
                    ModelState.AddModelError(
                        "",
                        $"Sản phẩm {variant.Product.Name} - size {variant.Size} chỉ còn {variant.StockQuantity} sản phẩm.");

                    await PopulateCheckoutItemsAsync(model, cart);
                    return View(model);
                }
            }

            decimal subTotal = 0;

            foreach (var item in cart)
            {
                var variant = variants.First(v => v.Id == item.ProductVariantId);
                subTotal += variant.Price * item.Quantity;
            }

            var shippingFee = DefaultShippingFee;

            Voucher? voucher = null;
            decimal discount = 0;
            var code = model.VoucherCode?.Trim().ToUpperInvariant();
            if (!string.IsNullOrEmpty(code))
            {
                int? score = null;
                var token = HttpContext.Session.GetString("StyleGameReward");
                if (token != null)
                {
                    try
                    {
                        var reward = JsonSerializer.Deserialize<StyleReward>(StyleGame.RewardProtector(protection).Unprotect(token));
                        if (reward?.UserId == userId && reward.Code == code)
                            score = reward.Score;
                    }
                    catch (System.Security.Cryptography.CryptographicException) { }
                }
                var quantities = cart.GroupBy(item => item.ProductVariantId)
                    .ToDictionary(group => group.Key, group => group.Sum(item => item.Quantity));
                (voucher, discount) = await SalesRules.ApplyVoucherAsync(_context, code, userId, subTotal, quantities, variants, score);
                if (voucher == null)
                {
                    await transaction.RollbackAsync();
                    ModelState.AddModelError(nameof(model.VoucherCode), "Mã chưa đủ điều kiện cho giỏ hàng hoặc đã hết hiệu lực.");
                    await PopulateCheckoutItemsAsync(model, cart);
                    return View(model);
                }
            }

            var total = subTotal + shippingFee - discount;
            if (model.PaymentMethod == "VietQR" && (total <= 0 ||
                total > 9999999999999m || decimal.Truncate(total) != total))
            {
                await transaction.RollbackAsync();
                ModelState.AddModelError("", "Số tiền thanh toán phải là số nguyên VND hợp lệ.");
                await PopulateCheckoutItemsAsync(model, cart);
                return View(model);
            }

            var order = new Order
            {
                OrderCode = $"FS{DateTime.UtcNow:yyyyMMddHHmmss}{Guid.NewGuid().ToString("N")[..4].ToUpper()}",
                UserId = userId,
                ReceiverName = model.ReceiverName.Trim(),
                Phone = model.Phone.Trim(),
                Address = model.Address.Trim(),
                SubTotal = subTotal,
                ShippingFee = shippingFee,
                DiscountAmount = discount,
                TotalAmount = total,
                Status = OrderStatus.PendingConfirmation,
                PaymentMethod = model.PaymentMethod == "VietQR" ? PaymentMethod.VietQR : PaymentMethod.COD,
                PaymentStatus = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var item in cart)
            {
                var variant = variants.First(v => v.Id == item.ProductVariantId);

                order.Items.Add(new OrderItem
                {
                    ProductVariantId = variant.Id,
                    ProductName = variant.Product.Name,
                    SKU = variant.SKU,
                    Size = variant.Size,
                    Color = variant.Color,
                    UnitPrice = variant.Price,
                    Quantity = item.Quantity
                });

                variant.StockQuantity -= item.Quantity;
            }

            if (voucher != null)
                _context.VoucherRedemptions.Add(new VoucherRedemption
                {
                    VoucherId = voucher.Id, Order = order, CustomerId = userId
                });

            _context.Orders.Add(order);

            _context.PaymentHistories.Add(new PaymentHistory
            {
                Order = order, Event = "Created", OldStatus = PaymentStatus.Pending,
                NewStatus = PaymentStatus.Pending, Amount = order.TotalAmount, ActorUserId = userId
            });

            // Lưu lịch sử đầu tiên khi khách đặt hàng
            _context.OrderStatusHistories.Add(new OrderStatusHistory
            {
                Order = order,
                OldStatus = null,
                NewStatus = OrderStatus.PendingConfirmation,
                ChangedByUserId = userId,
                Note = "Khách hàng đã đặt hàng thành công.",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            HttpContext.Session.Remove(CartSessionKey);
            if (voucher?.GameMinimumScore != null) HttpContext.Session.Remove("StyleGameReward");

            return RedirectToAction(order.PaymentMethod == PaymentMethod.VietQR
                ? nameof(PaymentQR) : nameof(Success), new { id = order.Id });
        }
        catch
        {
            await transaction.RollbackAsync();
            _context.ChangeTracker.Clear();
            ModelState.AddModelError(
                "",
                "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.");

            await PopulateCheckoutItemsAsync(model, cart);
            return View(model);
        }
    }

    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> PaymentQR(int id)
    {
        var order = await OwnOrderAsync(id);
        if (order == null) return NotFound();
        if (order.PaymentMethod != PaymentMethod.VietQR) return BadRequest();
        if (order.PaymentStatus != PaymentStatus.Pending ||
            order.Status is OrderStatus.Cancelled or OrderStatus.Returned or OrderStatus.DeliveryFailed)
            return RedirectToAction(nameof(Details), new { id });
        if (order.TransferReportedAt.HasValue)
            return RedirectToAction(nameof(Success), new { id });
        try
        {
            var info = _payments.GetPaymentInfo(order);
            ViewBag.BankId = info.BankId;
            ViewBag.BankName = info.BankName;
            ViewBag.AccountNo = info.AccountNo;
            ViewBag.AccountName = info.AccountName;
            ViewBag.PaymentInfo = info;
            return View(order);
        }
        catch (InvalidOperationException ex) { return Problem(ex.Message, statusCode: 503); }
    }

    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> PaymentInfo(int orderId)
    {
        var order = await OwnOrderAsync(orderId);
        if (order == null) return NotFound();
        if (order.PaymentMethod != PaymentMethod.VietQR) return BadRequest();
        try { return Json(_payments.GetPaymentInfo(order)); }
        catch (InvalidOperationException ex) { return Problem(ex.Message, statusCode: 503); }
    }

    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> CheckPaymentStatus(int orderId)
    {
        var order = await OwnOrderAsync(orderId);
        if (order == null) return NotFound();
        return Json(new
        {
            orderId = order.Id, paymentStatus = order.PaymentStatus.ToString(),
            isPaid = order.PaymentStatus == PaymentStatus.Paid,
            transferReported = order.TransferReportedAt.HasValue,
            orderStatus = order.Status.ToString(), confirmationMode = "Manual"
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ReportTransfer(int orderId)
    {
        if (await OwnOrderAsync(orderId) == null) return NotFound();
        var result = await _payments.ReportTransferAsync(orderId,
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return result.Success ? Json(result) : Conflict(result);
    }

    private Task<Order?> OwnOrderAsync(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return _context.Orders.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
    }

    private async Task PopulateCheckoutItemsAsync(
        CheckoutViewModel model,
        List<CartItemViewModel> cart)
    {
        var ids = cart.Select(x => x.ProductVariantId).Distinct().ToList();

        var variants = await _context.ProductVariants
            .Include(v => v.Product)
            .Where(v => ids.Contains(v.Id))
            .ToListAsync();

        model.CartItems = cart
            .Where(item => variants.Any(v => v.Id == item.ProductVariantId))
            .Select(item =>
            {
                var variant = variants.First(v => v.Id == item.ProductVariantId);

                return new CartItemViewModel
                {
                    ProductVariantId = variant.Id,
                    ProductId = variant.ProductId,
                    ProductName = variant.Product.Name,
                    ImageUrl = ShowroomCatalog.FrontPhoto(variant.Product, variant.Color),
                    SKU = variant.SKU,
                    Size = variant.Size,
                    Color = variant.Color,
                    UnitPrice = variant.Price,
                    Quantity = item.Quantity
                };
            }).ToList();

        model.SubTotal = model.CartItems.Sum(x => x.TotalPrice);
        model.ShippingFee = DefaultShippingFee;
    }

    // GET: /Orders/Success/5
    [HttpGet]
    public async Task<IActionResult> Success(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound();

        return View(order);
    }

    // GET: /Orders
    // Danh sách đơn hàng của khách hàng đang đăng nhập
    public async Task<IActionResult> Index()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Challenge();

        var orders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return View(orders);
    }

    // GET: /Orders/Details/5
    // Chi tiết đơn hàng và tiến trình xử lý
    // Chỉ chủ đơn hàng mới được xem
    public async Task<IActionResult> Details(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Challenge();

        // Chỉ lấy đơn hàng thuộc khách hàng đang đăng nhập
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .Include(o => o.Shipments)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound();

        // Lấy lịch sử trạng thái của đơn hàng
        var histories = await _context.OrderStatusHistories
            .Where(h => h.OrderId == id)
            .OrderBy(h => h.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        ViewBag.HasReturnRequest = User.IsInRole("Customer") &&
            await _context.MerchandiseReturns.AnyAsync(r => r.OrderId == id);
        ViewBag.StatusHistories = histories;

        return View(order);
    }

    [HttpGet]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> TrackingLocation(int id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Challenge();

        var shipment = await _context.Shipments.AsNoTracking()
            .Where(s => s.OrderId == id && s.Order.UserId == userId)
            .OrderByDescending(s => s.CreatedAt).ThenByDescending(s => s.Id)
            .Select(s => new { s.Id, s.Status, OrderStatus = s.Order.Status })
            .FirstOrDefaultAsync(cancellationToken);
        if (shipment == null)
            return NotFound();

        var isTracking = shipment.Status == ShipmentStatus.InTransit && shipment.OrderStatus == OrderStatus.Shipping;
        var location = isTracking
            ? await _context.ShipmentLocations.AsNoTracking()
                .Where(l => l.ShipmentId == shipment.Id &&
                    l.Shipment.Status == ShipmentStatus.InTransit &&
                    l.Shipment.Order.Status == OrderStatus.Shipping)
                .OrderByDescending(l => l.RecordedAt).ThenByDescending(l => l.Id)
                .Select(l => new
                {
                    l.Latitude, l.Longitude, l.Accuracy,
                    RecordedAt = DateTime.SpecifyKind(l.RecordedAt, DateTimeKind.Utc)
                })
                .FirstOrDefaultAsync(cancellationToken)
            : null;

        return Json(new { status = shipment.Status.ToString(), isTracking, location });
    }

    [HttpGet]
    [Authorize(Roles = "Customer")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> ReturnRequest(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Challenge();
        var order = await _context.Orders.AsNoTracking().Include(o => o.Items)
            .SingleOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (order == null) return NotFound();
        var request = await _context.MerchandiseReturns.AsNoTracking()
            .SingleOrDefaultAsync(r => r.OrderId == id);
        var eligibility = await ReturnRequests.GetEligibilityAsync(_context, order);
        return View(new CustomerReturnViewModel(order, request, eligibility.Deadline,
            eligibility.Policy, eligibility.IneligibleReason));
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SubmitReturn(int id, string? reason, string? evidence)
    {
        if (!ModelState.IsValid) return BadRequest();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Challenge();
        var order = await _context.Orders.AsNoTracking()
            .SingleOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (order == null) return NotFound();
        var error = await ReturnRequests.SubmitAsync(_context, order, userId, reason, evidence);
        TempData[error == null ? "Success" : "Error"] = error ?? "Đã gửi yêu cầu trả hàng.";
        return RedirectToAction(nameof(ReturnRequest), new { id });
    }

    // POST: /Orders/CancelOrder
    // Khách hàng tự hủy đơn khi đơn còn ở trạng thái Chờ xác nhận
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Challenge();

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
                return NotFound();

            if (order.Status != OrderStatus.PendingConfirmation)
            {
                TempData["Error"] = "Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ xác nhận.";
                return RedirectToAction(nameof(Details), new { id });
            }

            if (!order.InventoryRestored)
            {
                // Hoàn lại số lượng tồn kho
                foreach (var item in order.Items)
                {
                    var variant = await _context.ProductVariants
                        .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId);

                    if (variant != null)
                        variant.StockQuantity += item.Quantity;
                }

                order.InventoryRestored = true;
            }

            var oldStatus = order.Status;
            order.Status = OrderStatus.Cancelled;

            _context.OrderStatusHistories.Add(new OrderStatusHistory
            {
                OrderId = order.Id,
                OldStatus = oldStatus,
                NewStatus = OrderStatus.Cancelled,
                ChangedByUserId = userId,
                Note = "Khách hàng tự hủy đơn hàng.",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            TempData["Success"] = "Đơn hàng đã được hủy thành công.";
            return RedirectToAction(nameof(Details), new { id });
        }
        catch
        {
            try { await transaction.RollbackAsync(); } catch { }
            TempData["Error"] = "Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.";
            return RedirectToAction(nameof(Details), new { id });
        }
    }

    // GET: /Orders/Track?orderCode=...
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Track(string? orderCode)
    {
        if (string.IsNullOrWhiteSpace(orderCode))
        {
            TempData["Error"] = "Vui lòng nhập mã đơn hàng cần tra cứu.";
            return RedirectToAction("Index", "Home");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Challenge();

        var code = orderCode.Trim().TrimStart('#');
        var numericCode = code.StartsWith("FS", StringComparison.OrdinalIgnoreCase) ? code[2..] : code;
        var hasId = int.TryParse(numericCode, out var orderId);
        var id = await _context.Orders.AsNoTracking()
            .Where(o => o.UserId == userId && (o.OrderCode == code || (hasId && o.Id == orderId)))
            .OrderByDescending(o => o.OrderCode == code)
            .Select(o => (int?)o.Id)
            .FirstOrDefaultAsync();
        if (id.HasValue)
            return RedirectToAction(nameof(Details), new { id });

        TempData["Error"] = $"Không tìm thấy đơn hàng với mã '{orderCode}'.";
        return RedirectToAction("Index", "Home");
    }
}
