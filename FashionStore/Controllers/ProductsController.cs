
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

    // GET: /Products/GetProduct3DData?slug=...
    [HttpGet]
    public async Task<IActionResult> GetProduct3DData(string? slug, int? id)
    {
        var allProducts = await _productService.GetAllProductsAsync();
        var product = (id.HasValue && id > 0)
            ? allProducts.FirstOrDefault(p => p.Id == id.Value && p.IsActive)
            : (!string.IsNullOrWhiteSpace(slug)
                ? allProducts.FirstOrDefault(p => p.Slug.Equals(slug.Trim(), StringComparison.OrdinalIgnoreCase) && p.IsActive)
                : allProducts.FirstOrDefault(p => p.Slug.Contains("oversize-streetwear-tee") && p.IsActive));

        if (product == null)
        {
            product = allProducts.FirstOrDefault(p => p.IsActive && p.Variants != null && p.Variants.Any());
        }

        if (product == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy sản phẩm 3D." });
        }

        var variants = product.Variants
            .Where(v => v.IsActive)
            .Select(v => new
            {
                id = v.Id,
                sku = v.SKU,
                size = v.Size,
                color = v.Color,
                price = v.Price,
                priceFormatted = v.Price.ToString("N0") + " ₫",
                stock = v.StockQuantity
            })
            .ToList();

        var colors = variants
            .GroupBy(v => v.color)
            .Select(g => new
            {
                name = g.Key,
                code = g.Key.ToLower() switch
                {
                    "trắng" or "white" => "#F5F5F0",
                    "đen" or "black" => "#1C1C1E",
                    "xám" or "grey" or "gray" => "#4B4E54",
                    "be" or "beige" or "sand" => "#D9D0BE",
                    _ => "#E0E0E0"
                },
                tint = g.Key.ToLower() switch
                {
                    "trắng" or "white" => new[] { 1.0, 1.0, 1.0 },
                    "đen" or "black" => new[] { 0.18, 0.18, 0.19 },
                    "xám" or "grey" or "gray" => new[] { 0.45, 0.46, 0.48 },
                    "be" or "beige" or "sand" => new[] { 0.88, 0.83, 0.74 },
                    _ => new[] { 1.0, 1.0, 1.0 }
                }
            })
            .ToList();

        var sizes = variants
            .Select(v => v.size)
            .Distinct()
            .ToList();

        return Json(new
        {
            success = true,
            id = product.Id,
            name = product.Name,
            slug = product.Slug,
            price = product.Price,
            priceFormatted = product.Price.ToString("N0") + " ₫",
            description = product.Description,
            categoryName = product.Category?.Name ?? "Áo Thun Streetwear",
            imageUrl = product.ImageUrl,
            modelUrl = "/models/clothes/tshirt-white-3d.glb?v=hanger_v2",
            colors,
            sizes,
            variants
        });
    }

    // GET: /Products/Rail hoặc /Catalog (Sào treo đồ thời trang độc bản 3D từ GitHub)
    [HttpGet]
    [Route("Products/Rail")]
    [Route("Catalog")]
    public IActionResult Rail()
    {
        return View();
    }
}
