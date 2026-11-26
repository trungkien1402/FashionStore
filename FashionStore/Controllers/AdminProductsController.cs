using FashionStore.Services;
using System.Security.Claims;
using FashionStore.Services.Implementations;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = AccessRoles.BackOffice)]
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

        var baseRows = _context.Products.AsNoTracking().Select(p => new
        {
            p.Id,
            p.IsActive,
            TotalStock = p.Variants.Where(v => v.IsActive).Sum(v => (long?)v.StockQuantity) ?? 0
        });

        ViewBag.CountAll = await _context.Products.CountAsync();
        ViewBag.CountActive = await _context.Products.CountAsync(p => p.IsActive);
        ViewBag.CountInactive = await _context.Products.CountAsync(p => !p.IsActive);
        ViewBag.CountLowStock = await baseRows.CountAsync(p => p.IsActive && p.TotalStock > 0 && p.TotalStock <= 5);
        ViewBag.CountOutOfStock = await baseRows.CountAsync(p => p.TotalStock == 0);

        return View(new AdminProductList(
            filter, products, count, pageCount, await _context.Products.AnyAsync(),
            await _context.ListedAdminCategories().OrderBy(c => c.Name).ThenBy(c => c.Id).ToListAsync(),
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
            var category = await _context.Categories.FindAsync(model.CategoryId);
            var catSlug = category?.Slug?.ToLower() ?? "";
            var catName = category?.Name?.ToLower() ?? "";
            var isShoe = model.Kind == "giay" || catSlug.Contains("giay") || catName.Contains("giày") || catSlug.Contains("shoe");
            var isPants = model.Kind == "quan" || catSlug.Contains("quan") || catName.Contains("quần") || catSlug.Contains("jeans") || catSlug.Contains("pant");

            var audience = string.IsNullOrWhiteSpace(model.Audience) ? "men" : model.Audience.ToLowerInvariant();
            var kind = isShoe ? "giay" : (isPants ? "quan" : "ao");
            var imageKind = isShoe ? "shoe" : "apparel";

            var hasSingleShoeImage = model.ImageBackFile is { Length: > 0 };
            var primaryImageKind = isShoe && hasSingleShoeImage && model.ImagePairFile == null ? "shoe-pair" : imageKind;
            var imageUrl = await SaveImageAsync(model.ImageFile!, primaryImageKind);
            string? backUrl = model.ImageBackFile != null ? await SaveImageAsync(model.ImageBackFile, imageKind) : null;
            string? sideUrl = model.ImageSideFile != null ? await SaveImageAsync(model.ImageSideFile, imageKind) : null;
            string? pairUrl = model.ImagePairFile != null ? await SaveImageAsync(model.ImagePairFile, isShoe ? "shoe-pair" : imageKind) : null;

            object metaObj;
            var variantRows = model.Variants.Where(v =>
                !string.IsNullOrWhiteSpace(v.Size) || !string.IsNullOrWhiteSpace(v.Color)).ToArray();
            var usesDefaultVariant = model.ProductType == "simple" || variantRows.Length == 0;
            var colors = usesDefaultVariant ? new[] { "Tiêu chuẩn" } : variantRows.Select(v =>
                string.IsNullOrWhiteSpace(v.Color) ? "Tiêu chuẩn" : v.Color.Trim()).Distinct().ToArray();
            var sizes = usesDefaultVariant ? new[] { "FreeSize" } : variantRows.Select(v =>
                string.IsNullOrWhiteSpace(v.Size) ? "FreeSize" : v.Size.Trim()).Distinct().ToArray();

            if (isShoe)
            {
                var colTitle = string.IsNullOrWhiteSpace(model.CollectionTitle) ? "STREET REMIX" : model.CollectionTitle.Trim().ToUpperInvariant();
                var colId = $"{audience}-{CreateSlug(colTitle)}";
                var themeColor = string.IsNullOrWhiteSpace(model.ThemeColor) ? "#5C3A21" : model.ThemeColor.Trim();
                var heroText = string.IsNullOrWhiteSpace(model.HeroModelText) ? model.Name.Trim().ToUpperInvariant() : model.HeroModelText.Trim().ToUpperInvariant();
                var colorway = string.IsNullOrWhiteSpace(model.ColorwayName)
                    ? (model.Variants.FirstOrDefault()?.Color ?? "ORIGINAL")
                    : model.ColorwayName.Trim();
                var styleCode = string.IsNullOrWhiteSpace(model.StyleCode)
                    ? $"{audience.ToUpper()}-{CreateSlug(model.Name).ToUpper()}"
                    : model.StyleCode.Trim().ToUpper();
                var designer = string.IsNullOrWhiteSpace(model.Designer) ? "HNMTSHOP" : model.Designer.Trim();

                // Với giày: Slot 1 là 2 Đôi (Hero/Pair), Slot 2 là Nghiêng 1 Bên (Một chiếc), Slot 3 là Chi tiết
                var singleShoeUrl = backUrl ?? imageUrl;
                var pairShoeUrl = pairUrl ?? (backUrl != null ? imageUrl : null);

                metaObj = new
                {
                    colors = colors.Select(c => new[] { c, ResolveColorHex(c, themeColor) }).ToArray(),
                    photos = new[]
                    {
                        new
                        {
                            front = singleShoeUrl,
                            pair = pairShoeUrl
                        }
                    },
                    sizes,
                    collection = new
                    {
                        id = colId,
                        title = colTitle,
                        order = 1
                    },
                    details = new
                    {
                        model = heroText,
                        colorway = colorway,
                        swatches = new[] { themeColor },
                        themeColor = themeColor,
                        accentColor = themeColor,
                        silhouettes = new[] { "low-top" },
                        styleCode = styleCode,
                        designer = designer
                    }
                };
            }
            else
            {
                metaObj = new
                {
                    colors = colors.Select(c => new[] { c, ResolveColorHex(c) }).ToArray(),
                    photos = new[]
                    {
                        new
                        {
                            front = imageUrl,
                            side = sideUrl ?? imageUrl,
                            back = backUrl ?? imageUrl,
                            pair = (string?)null
                        }
                    },
                    sizes,
                    details = new
                    {
                        lookbookOnly = false,
                        material = model.Description
                    }
                };
            }

            var product = new Product
            {
                Name = model.Name.Trim(),
                Slug = await GenerateUniqueSlugAsync(model.Name),
                Description = model.Description.Trim(),
                Price = model.Price,
                CategoryId = model.CategoryId,
                ImageUrl = isShoe ? (backUrl ?? imageUrl) : imageUrl,
                ShowroomKind = kind,
                ShowroomAudience = audience,
                ShowroomMetadata = System.Text.Json.JsonSerializer.Serialize(metaObj, ShowroomCatalog.JsonOptions),
                IsActive = model.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await using var transaction = await _context.Database.BeginTransactionAsync();
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Khởi tạo tồn kho và biến thể ngay lập tức trên cùng 1 trang
            _context.StockActorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _context.StockReason = "Khởi tạo tồn kho sản phẩm " + product.Name;

            var createdVariantsCount = 0;

            if (usesDefaultVariant)
            {
                // Tạo biến thể đơn giản FreeSize
                var sku = await EnsureUniqueSkuAsync($"{product.Slug}-FREE");
                var variant = new ProductVariant
                {
                    ProductId = product.Id,
                    SKU = sku,
                    Size = "FreeSize",
                    Color = "Tiêu chuẩn",
                    Price = product.Price,
                    StockQuantity = Math.Max(0, model.SimpleStock),
                    IsActive = true
                };
                _context.ProductVariants.Add(variant);
                createdVariantsCount = 1;
            }
            else
            {
                foreach (var v in variantRows)
                {
                    var sizeStr = string.IsNullOrWhiteSpace(v.Size) ? "FreeSize" : v.Size.Trim();
                    var colorStr = string.IsNullOrWhiteSpace(v.Color) ? "Tiêu chuẩn" : v.Color.Trim();

                    var baseSku = string.IsNullOrWhiteSpace(v.SKU)
                        ? $"{product.Slug}-{sizeStr}-{colorStr}"
                        : v.SKU.Trim();

                    var sku = await EnsureUniqueSkuAsync(baseSku);

                    var variant = new ProductVariant
                    {
                        ProductId = product.Id,
                        SKU = sku,
                        Size = sizeStr,
                        Color = colorStr,
                        Price = v.Price > 0 ? v.Price : product.Price,
                        StockQuantity = Math.Max(0, v.StockQuantity),
                        IsActive = v.IsActive
                    };
                    _context.ProductVariants.Add(variant);
                    createdVariantsCount++;
                }
            }
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            ShowroomCatalog.Invalidate();

            TempData["Success"] = $"Thêm sản phẩm \"{product.Name}\" và {createdVariantsCount} phân loại biến thể thành công.";

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

    // POST: /AdminProducts/Delete/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest" || Request.Headers.Accept.ToString().Contains("application/json"))
                return Json(new { success = false, message = "Không tìm thấy sản phẩm." });

            TempData["Error"] = "Không tìm thấy sản phẩm.";
            return RedirectToAction(nameof(Index));
        }

        var variants = await _context.ProductVariants.Where(v => v.ProductId == id).ToListAsync();
        var variantIds = variants.Select(v => v.Id).ToList();

        var hasOrders = await _context.OrderItems.AnyAsync(oi => variantIds.Contains(oi.ProductVariantId));
        if (hasOrders)
        {
            var msg = "Sản phẩm này đã có đơn hàng trong hệ thống, không thể xóa vĩnh viễn để bảo toàn lịch sử giao dịch. Vui lòng tắt hiển thị (Ẩn sản phẩm) thay thế.";
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest" || Request.Headers.Accept.ToString().Contains("application/json"))
                return Json(new { success = false, message = msg });

            TempData["Error"] = msg;
            return RedirectToAction(nameof(Index));
        }

        // Xóa giỏ hàng liên quan
        var cartItems = await _context.CartItems.Where(c => variantIds.Contains(c.ProductVariantId)).ToListAsync();
        _context.CartItems.RemoveRange(cartItems);

        // Xóa biến động kho
        var stockMovements = await _context.StockMovements.Where(sm => variantIds.Contains(sm.ProductVariantId)).ToListAsync();
        _context.StockMovements.RemoveRange(stockMovements);

        // Xóa đánh giá & nổi bật
        var reviews = await _context.ProductReviews.Where(pr => pr.ProductId == id).ToListAsync();
        _context.ProductReviews.RemoveRange(reviews);

        var featured = await _context.FeaturedProducts.Where(fp => fp.ProductId == id).ToListAsync();
        _context.FeaturedProducts.RemoveRange(featured);

        // Gỡ liên kết voucher nếu có
        var vouchers = await _context.Vouchers.Where(v => v.ProductId == id).ToListAsync();
        foreach (var v in vouchers)
        {
            v.ProductId = null;
        }

        // Xóa biến thể
        _context.ProductVariants.RemoveRange(variants);

        // Xóa ảnh sản phẩm nếu là file cục bộ
        DeleteImage(product.ImageUrl);

        // Xóa sản phẩm
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest" || Request.Headers.Accept.ToString().Contains("application/json"))
            return Json(new { success = true, message = $"Đã xóa sản phẩm '{product.Name}' thành công." });

        TempData["Success"] = $"Đã xóa sản phẩm '{product.Name}' thành công.";
        return RedirectToAction(nameof(Index));
    }

    // POST: /AdminProducts/RemoveBackground
    [HttpPost]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> RemoveBackground(IFormFile? file, [FromForm] string? kind)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Vui lòng tải ảnh lên.");

        var tempFolder = Path.Combine(Path.GetTempPath(), "FashionStoreRembg");
        Directory.CreateDirectory(tempFolder);

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";
        var inPath = Path.Combine(tempFolder, $"{Guid.NewGuid():N}{ext}");
        var outPath = Path.Combine(tempFolder, $"{Guid.NewGuid():N}.png");

        try
        {
            await using (var stream = new FileStream(inPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var scriptPath = Path.Combine(_environment.ContentRootPath, "Scripts", "rembg_runner.py");
            if (!System.IO.File.Exists(scriptPath))
            {
                scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "FashionStore", "Scripts", "rembg_runner.py");
            }

            var mode = kind is "shoe-pair" or "lookbook" ? kind :
                string.Equals(kind, "shoe", StringComparison.OrdinalIgnoreCase) || string.Equals(kind, "giay", StringComparison.OrdinalIgnoreCase)
                ? "shoe"
                : (string.Equals(kind, "apparel", StringComparison.OrdinalIgnoreCase) || string.Equals(kind, "ao", StringComparison.OrdinalIgnoreCase) || string.Equals(kind, "quan", StringComparison.OrdinalIgnoreCase)
                    ? "apparel"
                    : "auto");

            var startInfo = new System.Diagnostics.ProcessStartInfo
            {
                FileName = "python",
                Arguments = $"\"{scriptPath}\" \"{inPath}\" \"{outPath}\" \"{mode}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = System.Diagnostics.Process.Start(startInfo);
            if (process != null)
            {
                await process.WaitForExitAsync();
                if (process.ExitCode == 0 && System.IO.File.Exists(outPath))
                {
                    var bytes = await System.IO.File.ReadAllBytesAsync(outPath);
                    return File(bytes, "image/png");
                }
            }

            return StatusCode(500, "Xử lý tách nền AI không thành công.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
        finally
        {
            try { if (System.IO.File.Exists(inPath)) System.IO.File.Delete(inPath); } catch { }
            try { if (System.IO.File.Exists(outPath)) System.IO.File.Delete(outPath); } catch { }
        }
    }

    private async Task LoadCategoriesAsync()
    {
        ViewBag.Categories = await _context.ListedAdminCategories()
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

    private async Task<string> SaveImageAsync(IFormFile file, string? kind = null)
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

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Tự động chuẩn hóa kích thước Studio (1200x750 cho giày, y-top sát móc treo cho quần áo)
        if (extension == ".png" || kind is "shoe" or "shoe-pair" or "apparel")
        {
            try
            {
                var scriptPath = Path.Combine(_environment.ContentRootPath, "Scripts", "rembg_runner.py");
                if (!System.IO.File.Exists(scriptPath))
                {
                    scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "FashionStore", "Scripts", "rembg_runner.py");
                }
                var mode = kind == "shoe-pair" ? "shoe-pair" :
                    string.Equals(kind, "shoe", StringComparison.OrdinalIgnoreCase) || string.Equals(kind, "giay", StringComparison.OrdinalIgnoreCase)
                    ? "shoe"
                    : (string.Equals(kind, "apparel", StringComparison.OrdinalIgnoreCase) || string.Equals(kind, "ao", StringComparison.OrdinalIgnoreCase) || string.Equals(kind, "quan", StringComparison.OrdinalIgnoreCase)
                        ? "apparel"
                        : "auto");

                var psi = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "python",
                    Arguments = $"\"{scriptPath}\" --frame-only \"{filePath}\" \"{filePath}\" \"{mode}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using var p = System.Diagnostics.Process.Start(psi);
                if (p != null) await p.WaitForExitAsync();
            }
            catch { }
        }

        // Đảm bảo đồng bộ ảnh sang thư mục con FashionStore/FashionStore nếu có
        try
        {
            var mirrorFolder = Path.Combine(Directory.GetCurrentDirectory(), "FashionStore", "FashionStore", "wwwroot", "images", "products");
            if (Directory.Exists(mirrorFolder))
            {
                System.IO.File.Copy(filePath, Path.Combine(mirrorFolder, fileName), true);
            }
        }
        catch { }

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

    private async Task<string> EnsureUniqueSkuAsync(string baseSku)
    {
        var slug = CreateSlug(baseSku).ToUpperInvariant().Replace(" ", "-");
        if (string.IsNullOrEmpty(slug)) slug = "SKU";
        var uniqueSku = slug;
        var counter = 1;
        while (await _context.ProductVariants.AnyAsync(v => v.SKU == uniqueSku))
        {
            uniqueSku = $"{slug}-{counter}";
            counter++;
        }
        return uniqueSku;
    }

    private static readonly Dictionary<string, string> ColorHexMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Đen"] = "#18181B",
        ["Black"] = "#18181B",
        ["Trắng"] = "#FFFFFF",
        ["White"] = "#FFFFFF",
        ["Xám"] = "#71717A",
        ["Grey"] = "#71717A",
        ["Gray"] = "#71717A",
        ["Be"] = "#E5D9C5",
        ["Beige"] = "#E5D9C5",
        ["Nâu"] = "#78350F",
        ["Brown"] = "#78350F",
        ["Xanh Navy"] = "#1E3A8A",
        ["Navy"] = "#1E3A8A",
        ["Xanh Rêu"] = "#4D7C0F",
        ["Rêu"] = "#4D7C0F",
        ["Olive"] = "#4D7C0F",
        ["Đỏ Rượu"] = "#881337",
        ["Burgundy"] = "#881337",
        ["Đỏ"] = "#DC2626",
        ["Red"] = "#DC2626",
        ["Vàng"] = "#FBBF24",
        ["Yellow"] = "#FBBF24",
        ["Kem"] = "#FEF3C7",
        ["Cream"] = "#FEF3C7",
        ["Xanh Dương"] = "#2563EB",
        ["Blue"] = "#2563EB",
        ["Hồng"] = "#F472B6",
        ["Pink"] = "#F472B6",
        ["Cam"] = "#F97316",
        ["Orange"] = "#F97316",
        ["Tím"] = "#7C3AED",
        ["Purple"] = "#7C3AED",
        ["Panda"] = "#18181B",
        ["Mocha"] = "#5C3A21",
        ["Nâu Thuốc / Gum"] = "#5C3A21",
        ["Nâu Thuốc"] = "#5C3A21",
        ["Chicago"] = "#991B1B"
    };

    private static string ResolveColorHex(string? colorName, string fallback = "#18181B")
    {
        if (string.IsNullOrWhiteSpace(colorName)) return fallback;
        var trimmed = colorName.Trim();
        if (ColorHexMap.TryGetValue(trimmed, out var hex)) return hex;

        if (trimmed.StartsWith("#") && (trimmed.Length == 7 || trimmed.Length == 4)) return trimmed;

        foreach (var (k, v) in ColorHexMap)
        {
            if (trimmed.Contains(k, StringComparison.OrdinalIgnoreCase) || k.Contains(trimmed, StringComparison.OrdinalIgnoreCase))
                return v;
        }
        return fallback;
    }
}
