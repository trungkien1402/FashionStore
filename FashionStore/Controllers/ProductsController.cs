
using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

public class ProductsController : Controller
{
    private readonly ApplicationDbContext _db;

    public ProductsController(ApplicationDbContext db)
    {
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
        var activeProducts = _db.Products.AsNoTracking().Where(p => p.IsActive);
        var query = activeProducts;

        // Tìm kiếm theo tên
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var searchKeyword = keyword.Trim().ToUpperInvariant();
            query = query.Where(p => p.Name.ToUpper().Contains(searchKeyword));
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
            "price-asc" => query.OrderBy(p => p.Price).ThenBy(p => p.Id),
            "price-desc" => query.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
            "name-asc" => query.OrderBy(p => p.Name).ThenBy(p => p.Id),
            _ => query.OrderByDescending(p => p.CreatedAt).ThenBy(p => p.Id)
        };

        // Danh mục lấy từ dữ liệu sản phẩm
        var categories = await _db.Categories.AsNoTracking()
            .Where(c => activeProducts.Any(p => p.CategoryId == c.Id))
            .OrderBy(c => c.Name)
            .ToListAsync();

        const int pageSize = 12;
        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        if (totalPages > 0)
        {
            page = Math.Clamp(page, 1, totalPages);
        }
        else
        {
            page = 1;
        }

        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .ToListAsync();

        var model = new ProductListViewModel
        {
            Products = products,
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

    // Compatibility route for existing order/cart links. The standalone detail page was retired.
    [HttpGet]
    public async Task<IActionResult> Details(int id, string? from = null)
    {
        var product = await _db.Products.AsNoTracking().SingleOrDefaultAsync(p => p.Id == id && p.IsActive);
        if (product == null) return NotFound();
        if (product.ShowroomKind == "giay")
            return RedirectToAction(nameof(Sneakers), new { audience = product.ShowroomAudience, productId = product.Id, from = from is "home" or "newDrops" ? from : null });
        if (product.ShowroomKind is "ao" or "quan")
            return RedirectToAction(nameof(Rail), new { audience = product.ShowroomAudience, category = product.ShowroomKind, productId = product.Id, from = from is "home" or "newDrops" ? from : null });
        return RedirectToAction("Index", "Home", new { showroomProductId = id });
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
    [Authorize]
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
            return RedirectToAction("Index", "Home", new { showroomProductId = id });
        }

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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

        return RedirectToAction("Index", "Home", new { showroomProductId = id });
    }

    [HttpGet]
    public async Task<IActionResult> GetProductReviews(int productId, CancellationToken cancellationToken)
    {
        if (productId <= 0)
        {
            return Json(new { success = false, message = "ID sản phẩm không hợp lệ." });
        }

        var purchases = DeliveredPurchases(productId);
        var reviews = _db.ProductReviews.AsNoTracking()
            .Where(review => review.ProductId == productId && review.IsVisible &&
                purchases.Any(item => item.Order.UserId == review.UserId));

        var summary = await reviews.GroupBy(review => review.ProductId)
            .Select(group => new { Count = group.Count(), Average = group.Average(review => (double)review.Rating) })
            .SingleOrDefaultAsync(cancellationToken);

        var latestReviews = await reviews.OrderByDescending(review => review.CreatedAt)
            .ThenByDescending(review => review.Id)
            .Take(15)
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
        var isAuthenticated = User.Identity?.IsAuthenticated == true && !string.IsNullOrEmpty(userId);
        var hasDeliveredPurchase = isAuthenticated &&
            await purchases.AnyAsync(item => item.Order.UserId == userId, cancellationToken);
        var hasReviewed = isAuthenticated &&
            await _db.ProductReviews.AnyAsync(review => review.ProductId == productId && review.UserId == userId, cancellationToken);

        var reviewList = latestReviews.Select(r => new
        {
            id = r.Id,
            reviewerName = reviewerNames.TryGetValue(r.UserId, out var name) ? name : "Khách hàng HNMTSHOP",
            rating = r.Rating,
            comment = r.Comment,
            createdAtFormatted = r.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy"),
            spec = purchasedSpecs.TryGetValue(r.UserId, out var spec) ? spec : "",
            isVerified = true
        }).ToList();

        return Json(new
        {
            success = true,
            productId,
            count = summary?.Count ?? 0,
            average = Math.Round(summary?.Average ?? 5.0, 1),
            hasDeliveredPurchase,
            hasReviewed,
            isAuthenticated,
            reviews = reviewList
        });
    }

    public class ReviewAjaxInputModel
    {
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    [HttpPost]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> SubmitReviewAjax([FromBody] ReviewAjaxInputModel input, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId) || User.Identity?.IsAuthenticated != true)
        {
            return Json(new { success = false, message = "Vui lòng đăng nhập tài khoản mua hàng để đánh giá." });
        }

        if (input.ProductId <= 0 || !await _db.Products.AnyAsync(p => p.Id == input.ProductId && p.IsActive, cancellationToken))
        {
            return Json(new { success = false, message = "Sản phẩm không tồn tại." });
        }

        var hasDelivered = await DeliveredPurchases(input.ProductId).AnyAsync(item => item.Order.UserId == userId, cancellationToken);
        if (!hasDelivered)
        {
            return Json(new { success = false, message = "Chỉ tài khoản đã mua và nhận sản phẩm thành công mới có thể đánh giá." });
        }

        if (await _db.ProductReviews.AnyAsync(r => r.ProductId == input.ProductId && r.UserId == userId, cancellationToken))
        {
            return Json(new { success = false, message = "Bạn đã đánh giá sản phẩm này rồi." });
        }

        if (input.Rating < 1 || input.Rating > 5)
        {
            return Json(new { success = false, message = "Vui lòng chọn số sao từ 1 đến 5." });
        }

        if (string.IsNullOrWhiteSpace(input.Comment))
        {
            return Json(new { success = false, message = "Vui lòng nhập nội dung đánh giá." });
        }

        var review = new ProductReview
        {
            ProductId = input.ProductId,
            UserId = userId,
            Rating = input.Rating,
            Comment = input.Comment.Trim(),
            IsVisible = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.ProductReviews.Add(review);
        try
        {
            await _db.SaveChangesAsync(cancellationToken);
            return Json(new { success = true, message = "Cảm ơn bạn! Đánh giá đã được ghi nhận." });
        }
        catch (DbUpdateException ex) when (ex.GetBaseException() is SqlException { Number: 2601 or 2627 })
        {
            return Json(new { success = false, message = "Bạn đã đánh giá sản phẩm này rồi." });
        }
    }

    private IQueryable<OrderItem> DeliveredPurchases(int productId) =>
        _db.OrderItems.Where(item => item.ProductVariant.ProductId == productId &&
            item.Order.Status == OrderStatus.Delivered);

    // GET: /Products/GetProduct3DData?slug=...
    [HttpGet]
    public async Task<IActionResult> GetProduct3DData(string? slug, int? id)
    {
        var activeProducts = _db.Products.AsNoTracking()
            .Where(p => p.IsActive)
            .Include(p => p.Category).Include(p => p.Variants)
            .OrderBy(p => p.Id);
        var normalizedSlug = slug?.Trim().ToUpperInvariant();
        var product = id > 0
            ? await activeProducts.FirstOrDefaultAsync(p => p.Id == id)
            : !string.IsNullOrEmpty(normalizedSlug)
                ? await activeProducts.FirstOrDefaultAsync(p => p.Slug.ToUpper() == normalizedSlug)
                : await activeProducts.FirstOrDefaultAsync(p => p.Slug.Contains("oversize-streetwear-tee"));
        product ??= await activeProducts.FirstOrDefaultAsync(p => p.Variants.Any());

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

