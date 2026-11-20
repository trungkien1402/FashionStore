using FashionStore.Models.ViewModels;

namespace FashionStore.Services.Interfaces;

public interface ICartService
{
    Task<List<CartItemViewModel>> GetCartAsync();
    Task<int> GetCartCountAsync();
    Task AddToCartAsync(int variantId, int quantity = 1);
    Task UpdateQuantityAsync(int variantId, int quantity);
    Task UpdateDeltaAsync(int variantId, int delta);
    Task RemoveFromCartAsync(int variantId);
    Task ClearCartAsync();
    Task MergeCartOnLoginAsync(string userId);
    void ClearSessionCart();
}
