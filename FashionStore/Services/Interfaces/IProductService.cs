using FashionStore.Models.Entities;

namespace FashionStore.Services.Interfaces;

public interface IProductService
{
    Task<List<Product>> GetAllProductsAsync();

    Task<Product?> GetProductByIdAsync(int id);

    Task CreateProductAsync(Product product);
}