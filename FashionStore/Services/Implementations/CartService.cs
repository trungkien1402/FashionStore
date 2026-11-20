using System.Security.Claims;
using System.Text.Json;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Services.Implementations;

public class CartService : ICartService
{
    private const string CartSessionKey = "FashionStore_Cart";
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CartService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    private HttpContext? HttpContext => _httpContextAccessor.HttpContext;

    private string? GetCurrentUserId()
    {
        var user = HttpContext?.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            return user.FindFirstValue(ClaimTypes.NameIdentifier);
        }
        return null;
    }

    private List<CartItemViewModel> GetSessionCart()
    {
        var session = HttpContext?.Session;
        if (session == null)
            return new List<CartItemViewModel>();

        var json = session.GetString(CartSessionKey);
        if (string.IsNullOrEmpty(json))
            return new List<CartItemViewModel>();

        try
        {
            return JsonSerializer.Deserialize<List<CartItemViewModel>>(json) ?? new List<CartItemViewModel>();
        }
        catch
        {
            return new List<CartItemViewModel>();
        }
    }

    private void SaveSessionCart(List<CartItemViewModel> cart)
    {
        var session = HttpContext?.Session;
        if (session == null) return;

        var json = JsonSerializer.Serialize(cart);
        session.SetString(CartSessionKey, json);
    }

    private async Task<Cart> GetOrCreateDbCartAsync(string userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    public async Task<List<CartItemViewModel>> GetCartAsync()
    {
        var userId = GetCurrentUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            var cart = await _context.Carts
                .AsNoTracking()
                .Include(c => c.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.Items.Any())
                return new List<CartItemViewModel>();

            return cart.Items
                .Where(i => i.ProductVariant != null && i.ProductVariant.Product != null && i.ProductVariant.IsActive && i.ProductVariant.Product.IsActive)
                .Select(i => new CartItemViewModel
                {
                    ProductVariantId = i.ProductVariantId,
                    ProductId = i.ProductVariant.ProductId,
                    ProductName = i.ProductVariant.Product.Name,
                    ImageUrl = ShowroomCatalog.FrontPhoto(i.ProductVariant.Product, i.ProductVariant.Color),
                    SKU = i.ProductVariant.SKU,
                    Size = i.ProductVariant.Size,
                    Color = i.ProductVariant.Color,
                    UnitPrice = i.ProductVariant.Price,
                    Quantity = i.Quantity
                })
                .ToList();
        }

        return GetSessionCart();
    }

    public async Task<int> GetCartCountAsync()
    {
        var userId = GetCurrentUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            return await _context.CartItems
                .Where(ci => ci.Cart.UserId == userId && ci.ProductVariant.IsActive && ci.ProductVariant.Product.IsActive)
                .SumAsync(ci => (int?)ci.Quantity) ?? 0;
        }

        return GetSessionCart().Sum(x => x.Quantity);
    }

    public async Task AddToCartAsync(int variantId, int quantity = 1)
    {
        if (quantity < 1) quantity = 1;

        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId && v.IsActive && v.Product.IsActive);

        if (variant == null)
            return;

        var userId = GetCurrentUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            var cart = await GetOrCreateDbCartAsync(userId);
            var item = cart.Items.FirstOrDefault(x => x.ProductVariantId == variantId);

            int targetQuantity = quantity + (item?.Quantity ?? 0);
            if (targetQuantity > variant.StockQuantity)
            {
                targetQuantity = variant.StockQuantity;
            }

            if (item != null)
            {
                item.Quantity = Math.Min(targetQuantity, 20);
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    CartId = cart.Id,
                    ProductVariantId = variantId,
                    Quantity = Math.Min(targetQuantity, 20),
                    CreatedAt = DateTime.UtcNow
                });
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else
        {
            var cart = GetSessionCart();
            var existingItem = cart.FirstOrDefault(x => x.ProductVariantId == variantId);

            int targetQuantity = quantity + (existingItem?.Quantity ?? 0);
            if (targetQuantity > variant.StockQuantity)
            {
                targetQuantity = variant.StockQuantity;
            }

            if (existingItem != null)
            {
                existingItem.Quantity = Math.Min(targetQuantity, 20);
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
                    Quantity = Math.Min(targetQuantity, 20)
                });
            }

            SaveSessionCart(cart);
        }
    }

    public async Task UpdateQuantityAsync(int variantId, int quantity)
    {
        var userId = GetCurrentUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            var cart = await GetOrCreateDbCartAsync(userId);
            var item = cart.Items.FirstOrDefault(x => x.ProductVariantId == variantId);

            if (item == null) return;

            if (quantity <= 0)
            {
                _context.CartItems.Remove(item);
            }
            else
            {
                var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId);
                int stock = variant?.StockQuantity ?? 0;
                item.Quantity = Math.Min(Math.Min(quantity, 20), stock);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else
        {
            var cart = GetSessionCart();
            var item = cart.FirstOrDefault(x => x.ProductVariantId == variantId);

            if (item == null) return;

            if (quantity <= 0)
            {
                cart.Remove(item);
            }
            else
            {
                var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId);
                int stock = variant?.StockQuantity ?? 0;
                item.Quantity = Math.Min(Math.Min(quantity, 20), stock);
                if (variant != null) item.UnitPrice = variant.Price;
            }

            SaveSessionCart(cart);
        }
    }

    public async Task UpdateDeltaAsync(int variantId, int delta)
    {
        var userId = GetCurrentUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            var cart = await GetOrCreateDbCartAsync(userId);
            var item = cart.Items.FirstOrDefault(x => x.ProductVariantId == variantId);

            if (item == null) return;

            int targetQuantity = item.Quantity + delta;
            if (targetQuantity <= 0)
            {
                _context.CartItems.Remove(item);
            }
            else
            {
                var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId);
                int stock = variant?.StockQuantity ?? 0;
                item.Quantity = Math.Min(Math.Min(targetQuantity, 20), stock);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        else
        {
            var cart = GetSessionCart();
            var item = cart.FirstOrDefault(x => x.ProductVariantId == variantId);

            if (item == null) return;

            int targetQuantity = item.Quantity + delta;
            if (targetQuantity <= 0)
            {
                cart.Remove(item);
            }
            else
            {
                var variant = await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId);
                int stock = variant?.StockQuantity ?? 0;
                item.Quantity = Math.Min(Math.Min(targetQuantity, 20), stock);
                if (variant != null) item.UnitPrice = variant.Price;
            }

            SaveSessionCart(cart);
        }
    }

    public async Task RemoveFromCartAsync(int variantId)
    {
        var userId = GetCurrentUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart != null)
            {
                var item = cart.Items.FirstOrDefault(x => x.ProductVariantId == variantId);
                if (item != null)
                {
                    _context.CartItems.Remove(item);
                    cart.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
        }
        else
        {
            var cart = GetSessionCart();
            cart.RemoveAll(x => x.ProductVariantId == variantId);
            SaveSessionCart(cart);
        }
    }

    public async Task ClearCartAsync()
    {
        var userId = GetCurrentUserId();

        if (!string.IsNullOrEmpty(userId))
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart != null && cart.Items.Any())
            {
                _context.CartItems.RemoveRange(cart.Items);
                cart.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        ClearSessionCart();
    }

    public void ClearSessionCart()
    {
        var session = HttpContext?.Session;
        if (session != null)
        {
            session.Remove(CartSessionKey);
        }
    }

    public async Task MergeCartOnLoginAsync(string userId)
    {
        var sessionCart = GetSessionCart();
        if (!sessionCart.Any()) return;

        var dbCart = await GetOrCreateDbCartAsync(userId);

        foreach (var item in sessionCart)
        {
            var variant = await _context.ProductVariants
                .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId && v.IsActive);

            if (variant == null) continue;

            var existingItem = dbCart.Items.FirstOrDefault(x => x.ProductVariantId == item.ProductVariantId);
            int combinedQty = item.Quantity + (existingItem?.Quantity ?? 0);
            combinedQty = Math.Min(Math.Min(combinedQty, 20), variant.StockQuantity);

            if (combinedQty <= 0) continue;

            if (existingItem != null)
            {
                existingItem.Quantity = combinedQty;
            }
            else
            {
                dbCart.Items.Add(new CartItem
                {
                    CartId = dbCart.Id,
                    ProductVariantId = item.ProductVariantId,
                    Quantity = combinedQty,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        dbCart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Xóa Session cart sau khi đã gộp vào Database
        ClearSessionCart();
    }
}
