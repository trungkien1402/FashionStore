
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FashionStore.Controllers;

public class ProductsController : Controller
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    // GET: /Products
    public async Task<IActionResult> Index(
        string? keyword,
        int? categoryId,
        decimal? minPrice,
        decimal? maxPrice,
        string sortOrder = "newest",
        int page = 1)
    {
        // Lấy sản phẩm từ database thông qua Service
        var allProducts = await _productService.GetAllProductsAsync();

        // Chỉ lấy sản phẩm đang kinh doanh
        var query = allProducts
            .Where(p => p.IsActive)
            .AsEnumerable();

        // Tìm kiếm theo tên
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var searchKeyword = keyword.Trim();

            query = query.Where(p =>
                p.Name.Contains(
                    searchKeyword,
                    StringComparison.OrdinalIgnoreCase));
        }

        // Lọc danh mục
        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        // Lọc giá tối thiểu
        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        // Lọc giá tối đa
        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        // Sắp xếp
        query = sortOrder switch
        {
            "price-asc" => query.OrderBy(p => p.Price),
            "price-desc" => query.OrderByDescending(p => p.Price),
            "name-asc" => query.OrderBy(p => p.Name),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        // Danh mục lấy từ dữ liệu sản phẩm
        var categories = allProducts
            .Where(p => p.IsActive && p.Category != null)
            .Select(p => p.Category!)
            .GroupBy(c => c.Id)
            .Select(g => g.First())
            .OrderBy(c => c.Name)
            .ToList();

        // Phân trang
        const int pageSize = 12;

        var filteredProducts = query.ToList();

        var totalItems = filteredProducts.Count;
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        if (totalPages > 0)
        {
            page = Math.Clamp(page, 1, totalPages);
        }
        else
        {
            page = 1;
        }

        var products = filteredProducts
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var model = new ProductListViewModel
        {
            Products = products,
            AllCatalogProducts = allProducts.Where(p => p.IsActive).ToList(),
            Categories = categories,
            Keyword = keyword,
            CategoryId = categoryId,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            SortOrder = sortOrder,
            CurrentPage = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };

        return View(model);
    }

    // GET: /Products/Details/5
    public async Task<IActionResult> Details(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);

        if (product == null || !product.IsActive)
        {
            return NotFound();
        }

        return View(product);
    }
}
