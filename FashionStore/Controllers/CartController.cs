using System.Text.Json;
using FashionStore.Data;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

public class CartController : Controller
{
    private const string CartSessionKey = "FashionStore_Cart";

    private readonly ApplicationDbContext _context;

    public CartController(ApplicationDbContext context)
    {
        _context = context;
    }

    private List<CartItemViewModel> GetCart()
    {
        var json = HttpContext.Session.GetString(CartSessionKey);

        if (string.IsNullOrEmpty(json))
            return new List<CartItemViewModel>();

        return JsonSerializer.Deserialize<List<CartItemViewModel>>(json)
               ?? new List<CartItemViewModel>();
    }

    private void SaveCart(List<CartItemViewModel> cart)
    {
        var json = JsonSerializer.Serialize(cart);
        HttpContext.Session.SetString(CartSessionKey, json);
    }

    // GET: /Cart
    public IActionResult Index()
    {
        var cart = GetCart();
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
            return RedirectToAction("Details", "Products",
                new { id = productId });
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

        var cart = GetCart();

        var existingItem = cart.FirstOrDefault(
            x => x.ProductVariantId == variantId);

        int newQuantity = quantity + (existingItem?.Quantity ?? 0);

        if (newQuantity > variant.StockQuantity)
        {
            TempData["CartError"] =
                $"Sản phẩm chỉ còn {variant.StockQuantity} sản phẩm trong kho.";

            return RedirectToAction("Details", "Products",
                new { id = productId });
        }

        if (existingItem != null)
        {
            existingItem.Quantity = newQuantity;
            existingItem.UnitPrice = variant.Price;
        }
        else
        {
            cart.Add(new CartItemViewModel
            {
                ProductVariantId = variant.Id,
                ProductId = variant.ProductId,
                ProductName = variant.Product.Name,
                ImageUrl = ShowroomCatalog.FrontPhoto(variant.Product, variant.Color),
                SKU = variant.SKU,
                Size = variant.Size,
                Color = variant.Color,
                UnitPrice = variant.Price,
                Quantity = quantity
            });
        }

        SaveCart(cart);

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
        var cart = GetCart();
        var existingItem = cart.FirstOrDefault(x => x.ProductVariantId == variant.Id);
        int newQuantity = qty + (existingItem?.Quantity ?? 0);

        if (newQuantity > variant.StockQuantity)
        {
            return BadRequest(new { success = false, message = $"Kho chỉ còn {variant.StockQuantity} sản phẩm cho size này." });
        }

        if (existingItem != null)
        {
            existingItem.Quantity = newQuantity;
            existingItem.UnitPrice = variant.Price;
        }
        else
        {
            cart.Add(new CartItemViewModel
            {
                ProductVariantId = variant.Id,
                ProductId = variant.ProductId,
                ProductName = variant.Product.Name,
                ImageUrl = ShowroomCatalog.FrontPhoto(variant.Product, variant.Color),
                SKU = variant.SKU,
                Size = variant.Size,
                Color = variant.Color,
                UnitPrice = variant.Price,
                Quantity = qty
            });
        }

        SaveCart(cart);

        return Ok(new
        {
            success = true,
            cartCount = cart.Sum(x => x.Quantity),
            items = MiniCartItems(cart),
            message = $"Đã thêm {variant.Product.Name} ({variant.Size}) vào giỏ hàng!"
        });
    }

    // POST: /Cart/Update
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int variantId, int quantity)
    {
        var cart = GetCart();

        var item = cart.FirstOrDefault(
            x => x.ProductVariantId == variantId);

        if (item == null)
            return RedirectToAction(nameof(Index));

        if (quantity <= 0)
        {
            cart.Remove(item);
            SaveCart(cart);
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
            cart.Remove(item);
            SaveCart(cart);

            TempData["CartError"] = "Sản phẩm không còn kinh doanh.";
            return RedirectToAction(nameof(Index));
        }

        if (quantity > variant.StockQuantity)
        {
            TempData["CartError"] =
                $"Sản phẩm chỉ còn {variant.StockQuantity} sản phẩm.";

            return RedirectToAction(nameof(Index));
        }

        item.Quantity = quantity;
        item.UnitPrice = variant.Price;

        SaveCart(cart);

        TempData["CartSuccess"] = "Đã cập nhật giỏ hàng.";

        return RedirectToAction(nameof(Index));
    }

    // POST: /Cart/Remove
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Remove(int variantId)
    {
        var cart = GetCart();

        cart.RemoveAll(x => x.ProductVariantId == variantId);

        SaveCart(cart);

        TempData["CartSuccess"] = "Đã xóa sản phẩm khỏi giỏ hàng.";

        return RedirectToAction(nameof(Index));
    }

    // POST: /Cart/Clear
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Clear()
    {
        HttpContext.Session.Remove(CartSessionKey);

        TempData["CartSuccess"] = "Đã làm trống giỏ hàng.";

        return RedirectToAction(nameof(Index));
    }

    // GET: /Cart/GetMiniCart (JSON for slide-over drawer)
    [HttpGet]
    public IActionResult GetMiniCart()
    {
        var cart = GetCart();
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

        var cart = GetCart();
        var item = cart.FirstOrDefault(x => x.ProductVariantId == req.VariantId);
        if (item == null)
            return NotFound(new { success = false, message = "Không tìm thấy sản phẩm trong giỏ." });

        int targetQuantity = item.Quantity + req.Delta;
        if (targetQuantity <= 0)
        {
            cart.Remove(item);
        }
        else
        {
            var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == req.VariantId);
            if (variant != null && targetQuantity > variant.StockQuantity)
            {
                return BadRequest(new { success = false, message = $"Kho chỉ còn {variant.StockQuantity} sản phẩm." });
            }
            item.Quantity = targetQuantity;
        }

        SaveCart(cart);
        return GetMiniCart();
    }
}
