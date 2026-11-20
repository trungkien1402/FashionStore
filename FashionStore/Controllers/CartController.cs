using FashionStore.Data;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

public class CartController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly ICartService _cartService;

    public CartController(ApplicationDbContext context, ICartService cartService)
    {
        _context = context;
        _cartService = cartService;
    }

    // GET: /Cart
    public async Task<IActionResult> Index()
    {
        var cart = await _cartService.GetCartAsync();
        return View(cart);
    }

    // POST: /Cart/Add
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Add(
        int productId,
        int variantId,
        int quantity = 1)
    {
        if (quantity < 1)
            quantity = 1;

        if (quantity > 20)
        {
            TempData["CartError"] = "Mỗi lần chỉ được mua tối đa 20 sản phẩm.";
            return RedirectToAction("Details", "Products", new { id = productId });
        }

        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v =>
                v.Id == variantId &&
                v.ProductId == productId &&
                v.IsActive &&
                v.Product.IsActive);

        if (variant == null)
            return NotFound();

        var cart = await _cartService.GetCartAsync();
        var existingItem = cart.FirstOrDefault(x => x.ProductVariantId == variantId);
        int newQuantity = quantity + (existingItem?.Quantity ?? 0);

        if (newQuantity > variant.StockQuantity)
        {
            TempData["CartError"] = $"Sản phẩm chỉ còn {variant.StockQuantity} sản phẩm trong kho.";
            return RedirectToAction("Details", "Products", new { id = productId });
        }

        await _cartService.AddToCartAsync(variant.Id, quantity);

        TempData["CartSuccess"] = "Đã thêm sản phẩm vào giỏ hàng!";
        return RedirectToAction(nameof(Index));
    }

    public class AddAjaxDto
    {
        public int ProductId { get; set; }
        public string? Size { get; set; }
        public int? VariantId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    // POST: /Cart/AddAjax
    [HttpPost]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> AddAjax([FromBody] AddAjaxDto req)
    {
        if (req == null || req.ProductId <= 0)
        {
            return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
        }

        var query = _context.ProductVariants
            .Include(v => v.Product)
            .Where(v => v.ProductId == req.ProductId && v.IsActive && v.Product.IsActive);

        FashionStore.Models.Entities.ProductVariant? variant = null;
        if (req.VariantId.HasValue && req.VariantId.Value > 0)
        {
            variant = await query.FirstOrDefaultAsync(v => v.Id == req.VariantId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(req.Size))
        {
            variant = await query.FirstOrDefaultAsync(v => v.Size.ToLower() == req.Size.ToLower() && v.StockQuantity > 0)
                      ?? await query.FirstOrDefaultAsync(v => v.Size.ToLower() == req.Size.ToLower());
        }
        else
        {
            variant = await query.FirstOrDefaultAsync(v => v.StockQuantity > 0)
                      ?? await query.FirstOrDefaultAsync();
        }

        if (variant == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy phân loại sản phẩm phù hợp." });
        }

        if (variant.StockQuantity <= 0)
        {
            return BadRequest(new { success = false, message = $"Sản phẩm size {variant.Size} hiện đã hết hàng." });
        }

        int qty = req.Quantity < 1 ? 1 : Math.Min(req.Quantity, 20);
        var cart = await _cartService.GetCartAsync();
        var existingItem = cart.FirstOrDefault(x => x.ProductVariantId == variant.Id);
        int newQuantity = qty + (existingItem?.Quantity ?? 0);

        if (newQuantity > variant.StockQuantity)
        {
            return BadRequest(new { success = false, message = $"Kho chỉ còn {variant.StockQuantity} sản phẩm cho size này." });
        }

        await _cartService.AddToCartAsync(variant.Id, qty);
        var updatedCart = await _cartService.GetCartAsync();
        int totalCartCount = await _cartService.GetCartCountAsync();

        return Ok(new
        {
            success = true,
            cartCount = totalCartCount,
            items = MiniCartItems(updatedCart),
            message = $"Đã thêm {variant.Product.Name} ({variant.Size}) vào giỏ hàng!"
        });
    }

    // POST: /Cart/Update
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int variantId, int quantity)
    {
        var cart = await _cartService.GetCartAsync();
        var item = cart.FirstOrDefault(x => x.ProductVariantId == variantId);

        if (item == null)
            return RedirectToAction(nameof(Index));

        if (quantity <= 0)
        {
            await _cartService.RemoveFromCartAsync(variantId);
            return RedirectToAction(nameof(Index));
        }

        if (quantity > 20)
        {
            TempData["CartError"] = "Mỗi sản phẩm chỉ được mua tối đa 20.";
            return RedirectToAction(nameof(Index));
        }

        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(v =>
                v.Id == variantId &&
                v.IsActive &&
                v.Product.IsActive);

        if (variant == null)
        {
            await _cartService.RemoveFromCartAsync(variantId);
            TempData["CartError"] = "Sản phẩm không còn kinh doanh.";
            return RedirectToAction(nameof(Index));
        }

        if (quantity > variant.StockQuantity)
        {
            TempData["CartError"] = $"Sản phẩm chỉ còn {variant.StockQuantity} sản phẩm.";
            return RedirectToAction(nameof(Index));
        }

        await _cartService.UpdateQuantityAsync(variantId, quantity);
        TempData["CartSuccess"] = "Đã cập nhật giỏ hàng.";

        return RedirectToAction(nameof(Index));
    }

    // POST: /Cart/Remove
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Remove(int variantId)
    {
        await _cartService.RemoveFromCartAsync(variantId);
        TempData["CartSuccess"] = "Đã xóa sản phẩm khỏi giỏ hàng.";
        return RedirectToAction(nameof(Index));
    }

    // POST: /Cart/Clear
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Clear()
    {
        await _cartService.ClearCartAsync();
        TempData["CartSuccess"] = "Đã làm trống giỏ hàng.";
        return RedirectToAction(nameof(Index));
    }

    // GET: /Cart/GetMiniCart (JSON for slide-over drawer)
    [HttpGet]
    public async Task<IActionResult> GetMiniCart()
    {
        var cart = await _cartService.GetCartAsync();
        decimal total = cart.Sum(x => x.TotalPrice);
        int totalQty = cart.Sum(x => x.Quantity);
        decimal freeshipThreshold = 500000m;
        decimal neededForFreeship = Math.Max(0, freeshipThreshold - total);
        double freeshipPercent = totalQty == 0 ? 0 : (double)Math.Min(100, Math.Round((total / freeshipThreshold) * 100, 0));

        return Json(new
        {
            success = true,
            items = MiniCartItems(cart),
            totalQuantity = totalQty,
            totalAmount = total,
            totalFormatted = total.ToString("N0") + " ₫",
            freeshipThreshold,
            neededForFreeship,
            neededForFreeshipFormatted = neededForFreeship.ToString("N0") + " ₫",
            freeshipPercent,
            isFreeship = total >= freeshipThreshold
        });
    }

    private static IEnumerable<object> MiniCartItems(IEnumerable<CartItemViewModel> cart) => cart.Select(x => new
    {
        variantId = x.ProductVariantId,
        productId = x.ProductId,
        name = x.ProductName,
        imageUrl = x.ImageUrl,
        size = x.Size,
        color = x.Color,
        unitPrice = x.UnitPrice,
        quantity = x.Quantity,
        lineTotal = x.TotalPrice,
        unitPriceFormatted = x.UnitPrice.ToString("N0") + " ₫",
        lineTotalFormatted = x.TotalPrice.ToString("N0") + " ₫"
    });

    public class UpdateAjaxDto
    {
        public int VariantId { get; set; }
        public int Delta { get; set; }
    }

    // POST: /Cart/UpdateAjax
    [HttpPost]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> UpdateAjax([FromBody] UpdateAjaxDto req)
    {
        if (req == null || req.VariantId <= 0)
            return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

        var cart = await _cartService.GetCartAsync();
        var item = cart.FirstOrDefault(x => x.ProductVariantId == req.VariantId);
        if (item == null)
            return NotFound(new { success = false, message = "Không tìm thấy sản phẩm trong giỏ." });

        int targetQuantity = item.Quantity + req.Delta;
        if (targetQuantity > 0)
        {
            var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == req.VariantId);
            if (variant != null && targetQuantity > variant.StockQuantity)
            {
                return BadRequest(new { success = false, message = $"Kho chỉ còn {variant.StockQuantity} sản phẩm." });
            }
        }

        await _cartService.UpdateDeltaAsync(req.VariantId, req.Delta);
        return await GetMiniCart();
    }
}
