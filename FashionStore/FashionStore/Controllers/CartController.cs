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
                ImageUrl = variant.Product.ImageUrl,
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
}