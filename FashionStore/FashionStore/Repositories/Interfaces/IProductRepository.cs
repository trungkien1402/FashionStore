using FashionStore.Models.Entities;

namespace FashionStore.Repositories.Interfaces;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync();

    Task<Product?> GetByIdAsync(int id);

    Task AddAsync(Product product);

    Task SaveChangesAsync();
}