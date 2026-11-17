
using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

public class ProductsController : Controller
{
    private readonly IProductService _productService;
    private readonly ApplicationDbContext _db;

    public ProductsController(IProductService productService, ApplicationDbContext db)
    {
        _productService = productService;
        _db = db;
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
    [HttpGet]
    public Task<IActionResult> Details(int id, CancellationToken cancellationToken) =>
        RenderDetailsAsync(id, input: null, cancellationToken);

    private async Task<IActionResult> RenderDetailsAsync(int id, ProductReviewInput? input, CancellationToken cancellationToken)
    {
        var product = await _productService.GetProductByIdAsync(id);

        if (product == null || !product.IsActive)
        {
            return NotFound();
        }

        var purchases = DeliveredPurchases(id);
        var reviews = _db.ProductReviews.AsNoTracking()
            .Where(review => review.ProductId == id && review.IsVisible &&
                purchases.Any(item => item.Order.UserId == review.UserId));
        var summary = await reviews.GroupBy(review => review.ProductId)
            .Select(group => new { Count = group.Count(), Average = group.Average(review => (double)review.Rating) })
            .SingleOrDefaultAsync(cancellationToken);
        var breakdownRows = await reviews.GroupBy(review => review.Rating)
            .Select(group => new { Rating = group.Key, Count = group.Count() })
            .ToListAsync(cancellationToken);
        var ratingBreakdown = Enumerable.Range(1, 5)
            .ToDictionary(star => star, star => breakdownRows.FirstOrDefault(x => x.Rating == star)?.Count ?? 0);

        var latestReviews = await reviews.OrderByDescending(review => review.CreatedAt)
            .ThenByDescending(review => review.Id)
            .Take(20)
            .ToListAsync(cancellationToken);

        var reviewerIds = latestReviews.Select(r => r.UserId).Distinct().ToList();
        var reviewerNames = new Dictionary<string, string>();
        var purchasedSpecs = new Dictionary<string, string>();

        if (reviewerIds.Count > 0)
        {
            var users = await _db.Users.AsNoTracking()
                .Where(u => reviewerIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FullName, u.Email })
                .ToListAsync(cancellationToken);

            foreach (var u in users)
            {
                var display = !string.IsNullOrWhiteSpace(u.FullName)
                    ? u.FullName.Trim()
                    : MaskEmail(u.Email);
                reviewerNames[u.Id] = display;
            }

            var specs = await purchases.AsNoTracking()
                .Where(item => reviewerIds.Contains(item.Order.UserId))
                .OrderByDescending(item => item.Order.CreatedAt)
                .Select(item => new { item.Order.UserId, item.Size, item.Color })
                .ToListAsync(cancellationToken);

            foreach (var s in specs)
            {
                if (!purchasedSpecs.ContainsKey(s.UserId))
                {
                    var parts = new List<string>();
                    if (!string.IsNullOrWhiteSpace(s.Size)) parts.Add($"Size {s.Size}");
                    if (!string.IsNullOrWhiteSpace(s.Color)) parts.Add(s.Color);
                    if (parts.Count > 0) purchasedSpecs[s.UserId] = string.Join(" · ", parts);
                }
            }
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isCustomer = User.IsInRole("Customer") && userId is not null;
        var hasDeliveredPurchase = isCustomer &&
            await purchases.AnyAsync(item => item.Order.UserId == userId, cancellationToken);
        var hasReviewed = isCustomer &&
            await _db.ProductReviews.AnyAsync(review => review.ProductId == id && review.UserId == userId, cancellationToken);

        var viewModel = new ProductDetailsViewModel(
            product, latestReviews, summary?.Count ?? 0, summary?.Average ?? 0, hasDeliveredPurchase, hasReviewed)
        {
            Input = input ?? new ProductReviewInput { Rating = 5 },
            RatingBreakdown = ratingBreakdown,
            ReviewerNames = reviewerNames,
            PurchasedSpecs = purchasedSpecs
        };

        return View(nameof(Details), viewModel);
    }

    private static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return "Khách hàng HNMTSHOP";
        var atIndex = email.IndexOf('@');
        if (atIndex <= 1) return "Khách hàng HNMTSHOP";
        var local = email[..atIndex];
        return local.Length <= 3 ? local[0] + "***" : local[..3] + "***";
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SubmitReview(int id, [Bind(Prefix = "Input")] ProductReviewInput input,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Challenge();

        if (!await _db.Products.AnyAsync(product => product.Id == id && product.IsActive, cancellationToken))
            return NotFound();

        if (!await DeliveredPurchases(id).AnyAsync(item => item.Order.UserId == userId, cancellationToken))
            return Forbid();

        if (await _db.ProductReviews.AnyAsync(review => review.ProductId == id && review.UserId == userId, cancellationToken))
        {
            TempData["ReviewNotice"] = "Bạn đã đánh giá sản phẩm này.";
            return RedirectToAction(nameof(Details), controllerName: null, new { id }, fragment: "product-reviews");
        }

        if (!ModelState.IsValid)
            return await RenderDetailsAsync(id, input, cancellationToken);

        _db.ProductReviews.Add(new ProductReview
        {
            ProductId = id,
            UserId = userId,
            Rating = input.Rating,
            Comment = input.Comment.Trim(),
            IsVisible = true
        });

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
            TempData["ReviewNotice"] = "Đánh giá của bạn đã được đăng.";
        }
        catch (DbUpdateException ex) when (ex.GetBaseException() is SqlException { Number: 2601 or 2627 })
        {
            TempData["ReviewNotice"] = "Bạn đã đánh giá sản phẩm này.";
        }

        return RedirectToAction(nameof(Details), controllerName: null, new { id }, fragment: "product-reviews");
    }

    private IQueryable<OrderItem> DeliveredPurchases(int productId) =>
        _db.OrderItems.Where(item => item.ProductVariant.ProductId == productId &&
            item.Order.Status == OrderStatus.Delivered);

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


    [HttpGet]
    [Route("Products/Sneakers")]
    [Route("Sneakers")]
    public IActionResult Sneakers()
    {
        return View();
    }
}

