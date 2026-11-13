using System.Security.Claims;
using FashionStore.Services.Implementations;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin,Manager,Staff")]
public class AdminProductsController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public AdminProductsController(
        ApplicationDbContext context,
        IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // GET: /AdminProducts
    public async Task<IActionResult> Index([FromQuery] AdminProductFilter filter)
    {
        const int pageSize = 24;
        filter.Keyword = filter.Keyword?.Trim();
        filter.Keyword = filter.Keyword?[..Math.Min(filter.Keyword.Length, 100)];
        if (!ModelState.IsValid || filter.MinPrice > filter.MaxPrice)
        {
            ModelState.AddModelError(string.Empty, "Kiểm tra lại các bộ lọc và khoảng giá.");
        }

        var query = _context.Products.AsNoTracking();
        if (!string.IsNullOrEmpty(filter.Keyword))
        {
            var keyword = filter.Keyword;
            query = query.Where(p => p.Name.Contains(keyword) || p.Slug.Contains(keyword) ||
                p.Variants.Any(v => v.SKU.Contains(keyword)));
        }

        if (filter.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == filter.CategoryId);
        if (filter.IsActive.HasValue)
            query = query.Where(p => p.IsActive == filter.IsActive);
        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice);
        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice);
        if (!string.IsNullOrWhiteSpace(filter.Size) || !string.IsNullOrWhiteSpace(filter.Color))
            query = query.Where(p => p.Variants.Any(v => v.IsActive &&
                (filter.Size == null || v.Size == filter.Size) &&
                (filter.Color == null || v.Color == filter.Color)));

        var rows = query.Select(p => new AdminProductRow
        {
            Id = p.Id, Name = p.Name, Slug = p.Slug, ImageUrl = p.ImageUrl,
            CategoryName = p.Category.Name, Price = p.Price, IsActive = p.IsActive,
            CreatedAt = p.CreatedAt, VariantCount = p.Variants.Count,
            TotalStock = p.Variants.Where(v => v.IsActive).Sum(v => (long?)v.StockQuantity) ?? 0
        });
        rows = filter.Stock switch
        {
            "out" => rows.Where(p => p.TotalStock == 0),
            "low" => rows.Where(p => p.TotalStock > 0 && p.TotalStock <= 5),
            "available" => rows.Where(p => p.TotalStock > 5),
            _ => rows
        };

        if (!ModelState.IsValid)
            rows = rows.Where(p => false);

        var count = await rows.CountAsync();
        var pageCount = Math.Max(1, (int)Math.Ceiling(count / (double)pageSize));
        filter.Page = Math.Clamp(filter.Page, 1, pageCount);
        var ordered = filter.Sort switch
        {
            "price-asc" => rows.OrderBy(p => p.Price),
            "price-desc" => rows.OrderByDescending(p => p.Price),
            "name" => rows.OrderBy(p => p.Name),
            "stock" => rows.OrderBy(p => p.TotalStock),
            _ => rows.OrderByDescending(p => p.CreatedAt)
        };

        var products = await ordered.ThenBy(p => p.Id)
            .Skip((filter.Page - 1) * pageSize).Take(pageSize).ToListAsync();
        var variants = _context.ProductVariants.AsNoTracking().Where(v => v.IsActive);
        return View(new AdminProductList(
            filter, products, count, pageCount, await _context.Products.AnyAsync(),
            await _context.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync(),
            await variants.Select(v => v.Size).Where(s => s != "").Distinct().OrderBy(s => s).ToListAsync(),
            await variants.Select(v => v.Color).Where(c => c != "").Distinct().OrderBy(c => c).ToListAsync()));
    }

    // GET: /AdminProducts/Create
    public async Task<IActionResult> Create()
    {
        await LoadCategoriesAsync();

        return View(new AdminProductViewModel());
    }

    // POST: /AdminProducts/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(AdminProductViewModel model)
    {
        if (model.ImageFile == null || model.ImageFile.Length == 0)
        {
            ModelState.AddModelError(
                nameof(model.ImageFile),
                "Vui lòng chọn ảnh sản phẩm.");
        }

        if (!await _context.Categories.AnyAsync(
                c => c.Id == model.CategoryId && c.IsActive))
        {
            ModelState.AddModelError(
                nameof(model.CategoryId),
                "Danh mục không tồn tại hoặc đã bị ẩn.");
        }

        if (!ModelState.IsValid)
        {
            await LoadCategoriesAsync();
            return View(model);
        }

        try
        {
            var imageUrl = await SaveImageAsync(model.ImageFile!);

            var product = new Product
            {
                Name = model.Name.Trim(),
                Slug = await GenerateUniqueSlugAsync(model.Name),
                Description = model.Description.Trim(),
                Price = model.Price,
                CategoryId = model.CategoryId,
                ImageUrl = imageUrl,
                IsActive = model.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            TempData["Success"] = "Thêm sản phẩm thành công.";

            return RedirectToAction(nameof(Index));
        }
        catch (Exception)
        {
            TempData["Error"] = "Không thể thêm sản phẩm. Vui lòng thử lại.";
            await LoadCategoriesAsync();
            return View(model);
        }
    }

    // GET: /AdminProducts/Edit/5
    public async Task<IActionResult> Edit(int id)
    {
        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        var model = new AdminProductViewModel
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            CategoryId = product.CategoryId,
            CurrentImageUrl = product.ImageUrl,
            IsActive = product.IsActive
        };

        await LoadCategoriesAsync();

        return View(model);
    }

    // POST: /AdminProducts/Edit
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(AdminProductViewModel model)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == model.Id);

        if (product == null)
            return NotFound();

        if (!await _context.Categories.AnyAsync(
                c => c.Id == model.CategoryId && c.IsActive))
        {
            ModelState.AddModelError(
                nameof(model.CategoryId),
                "Danh mục không tồn tại hoặc đã bị ẩn.");
        }

        if (!ModelState.IsValid)
        {
            model.CurrentImageUrl = product.ImageUrl;
            await LoadCategoriesAsync();
            return View(model);
        }

        try
        {
            product.Name = model.Name.Trim();
            product.Slug = await GenerateUniqueSlugAsync(model.Name, product.Id);
            product.Description = model.Description.Trim();
            if (product.Price != model.Price)
            SalesRules.Audit(_context, User.FindFirstValue(ClaimTypes.NameIdentifier),
                "ProductPrice", product.Id.ToString(), $"{product.Price} → {model.Price}");
        product.Price = model.Price;
            product.CategoryId = model.CategoryId;
            product.IsActive = model.IsActive;

            if (model.ImageFile != null && model.ImageFile.Length > 0)
            {
                var oldImage = product.ImageUrl;
                product.ImageUrl = await SaveImageAsync(model.ImageFile);

                DeleteImage(oldImage);
            }

            await _context.SaveChangesAsync();

            TempData["Success"] = "Cập nhật sản phẩm thành công.";

            return RedirectToAction(nameof(Index));
        }
        catch (Exception)
        {
            model.CurrentImageUrl = product.ImageUrl;
            await LoadCategoriesAsync();

            TempData["Error"] = "Không thể cập nhật sản phẩm. Vui lòng thử lại.";

            return View(model);
        }
    }

    // POST: /AdminProducts/ToggleActive/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        product.IsActive = !product.IsActive;

        await _context.SaveChangesAsync();

        TempData["Success"] = product.IsActive
            ? "Đã hiển thị sản phẩm."
            : "Đã ẩn sản phẩm.";

        return RedirectToAction(nameof(Index));
    }

    private async Task LoadCategoriesAsync()
    {
        ViewBag.Categories = await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .AsNoTracking()
            .ToListAsync();
    }

    private async Task<string> GenerateUniqueSlugAsync(
        string name,
        int? currentProductId = null)
    {
        var baseSlug = CreateSlug(name);
        var slug = baseSlug;
        var counter = 1;

        while (await _context.Products.AnyAsync(p =>
                   p.Slug == slug &&
                   (!currentProductId.HasValue || p.Id != currentProductId.Value)))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private static string CreateSlug(string value)
    {
        var normalized = value.Trim().ToLowerInvariant().Normalize(
            System.Text.NormalizationForm.FormD);

        var builder = new System.Text.StringBuilder();

        foreach (var character in normalized)
        {
            var category = System.Globalization.CharUnicodeInfo
                .GetUnicodeCategory(character);

            if (category == System.Globalization.UnicodeCategory.NonSpacingMark)
                continue;

            if (char.IsLetterOrDigit(character))
                builder.Append(character);
            else if (builder.Length > 0 && builder[^1] != '-')
                builder.Append('-');
        }

        return builder.ToString().Trim('-').Normalize(
            System.Text.NormalizationForm.FormC);
    }

    private async Task<string> SaveImageAsync(IFormFile file)
    {
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            throw new InvalidOperationException("Định dạng ảnh không được hỗ trợ.");

        if (file.Length > 5 * 1024 * 1024)
            throw new InvalidOperationException("Ảnh không được vượt quá 5 MB.");

        var folder = Path.Combine(
            _environment.WebRootPath,
            "images",
            "products");

        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(folder, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/images/products/{fileName}";
    }

    private void DeleteImage(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return;

        // Chỉ xóa file nằm trong thư mục ảnh sản phẩm do ứng dụng quản lý.
        var fileName = Path.GetFileName(imageUrl);

        if (string.IsNullOrWhiteSpace(fileName))
            return;

        var folder = Path.GetFullPath(Path.Combine(
            _environment.WebRootPath, "images", "products"));

        var filePath = Path.GetFullPath(Path.Combine(folder, fileName));

        if (filePath.StartsWith(folder + Path.DirectorySeparatorChar,
                StringComparison.OrdinalIgnoreCase) &&
            System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }
    }
}