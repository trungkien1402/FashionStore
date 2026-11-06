using FashionStore.Models.Entities;
using FashionStore.Repositories.Interfaces;
using FashionStore.Services.Interfaces;

namespace FashionStore.Services.Implementations;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Product>> GetAllProductsAsync()
    {
        return _repository.GetAllAsync();
    }

    public Task<Product?> GetProductByIdAsync(int id)
    {
        return _repository.GetByIdAsync(id);
    }

    public async Task CreateProductAsync(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.Name))
            throw new ArgumentException("Tên sản phẩm không được trống.");

        if (product.Price <= 0)
            throw new ArgumentException("Giá sản phẩm không hợp lệ.");

        if (product.CategoryId <= 0)
            throw new ArgumentException("Danh mục không hợp lệ.");

        product.Slug = product.Name.Trim().ToLowerInvariant()
            .Replace(" ", "-");

        await _repository.AddAsync(product);

        await _repository.SaveChangesAsync();
    }
}