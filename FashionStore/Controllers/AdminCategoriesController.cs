using FashionStore.Services;

using System.Globalization;
using System.Text;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = AccessRoles.Management)]
public class AdminCategoriesController : Controller
{
    private readonly ApplicationDbContext _context;

    public AdminCategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /AdminCategories
    public async Task<IActionResult> Index(string? keyword, string? status, string? sort = null, int page = 1)
    {
        var query = _context.Categories
            .AsNoTracking()
            .AsQueryable();

        // Tìm kiếm theo tên danh mục
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            keyword = keyword.Trim();
            keyword = keyword[..Math.Min(keyword.Length, 100)];
            query = query.Where(c => c.Name.Contains(keyword) || c.Slug.Contains(keyword));
        }

        // Lọc theo trạng thái
        if (status == "active")
        {
            query = query.Where(c => c.IsActive);
        }
        else if (status == "inactive")
        {
            query = query.Where(c => !c.IsActive);
        }

        const int pageSize = 24;
        var count = await query.CountAsync();
        var pageCount = Math.Max(1, (int)Math.Ceiling(count / (double)pageSize));
        page = Math.Clamp(page, 1, pageCount);
        var ordered = sort switch
        {
            "name-desc" => query.OrderByDescending(c => c.Name),
            "products" => query.OrderByDescending(c => c.Products.Count()).ThenBy(c => c.Name),
            _ => query.OrderBy(c => c.Name)
        };

        var categories = await ordered.ThenBy(c => c.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(c => new AdminCategoryListItemViewModel
            {
                Category = c,
                ProductCount = c.Products.Count(),
                ActiveProductCount = c.Products.Count(p => p.IsActive),
                RepresentativeImageUrl = c.Products
                    .Where(p => !string.IsNullOrEmpty(p.ImageUrl))
                    .OrderByDescending(p => p.IsActive)
                    .ThenByDescending(p => p.CreatedAt)
                    .ThenByDescending(p => p.Id)
                    .Select(p => p.ImageUrl)
                    .FirstOrDefault()
            })
            .ToListAsync();

        var totals = await _context.Categories.AsNoTracking()
            .GroupBy(c => c.IsActive)
            .Select(group => new { IsActive = group.Key, Count = group.Count() })
            .ToListAsync();
        ViewBag.TotalCategories = totals.Sum(group => group.Count);
        ViewBag.ActiveCategories = totals.Where(group => group.IsActive).Sum(group => group.Count);
        ViewBag.InactiveCategories = totals.Where(group => !group.IsActive).Sum(group => group.Count);
        ViewBag.ResultCount = count;
        ViewBag.Page = page;
        ViewBag.PageCount = pageCount;
        ViewBag.Sort = sort;
        ViewBag.Keyword = keyword;
        ViewBag.Status = status;

        return View(categories);
    }

    // GET: /AdminCategories/Create
    [HttpGet]
    public IActionResult Create()
    {
        return View(new AdminCategoryViewModel());
    }

    // POST: /AdminCategories/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(AdminCategoryViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        // Nếu không nhập slug thì tự tạo từ tên danh mục
        var slugSource = string.IsNullOrWhiteSpace(model.Slug)
            ? model.Name
            : model.Slug;

        var slug = GenerateSlug(slugSource);

        if (string.IsNullOrWhiteSpace(slug))
        {
            ModelState.AddModelError(
                nameof(model.Slug),
                "Slug không hợp lệ."
            );

            return View(model);
        }

        // Kiểm tra slug đã tồn tại chưa
        var slugExists = await _context.Categories
            .AnyAsync(c => c.Slug == slug);

        if (slugExists)
        {
            ModelState.AddModelError(
                nameof(model.Slug),
                "Slug này đã tồn tại."
            );

            return View(model);
        }

        var category = new Category
        {
            Name = model.Name.Trim(),
            Slug = slug,
            IsActive = model.IsActive
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync();

        TempData["Success"] = "Thêm danh mục thành công.";

        return RedirectToAction(nameof(Index));
    }

    // GET: /AdminCategories/Edit/5
    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound();
        }

        var model = new AdminCategoryViewModel
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            IsActive = category.IsActive
        };

        return View(model);
    }

    // POST: /AdminCategories/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(
        int id,
        AdminCategoryViewModel model)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound();
        }

        var slugSource = string.IsNullOrWhiteSpace(model.Slug)
            ? model.Name
            : model.Slug;

        var slug = GenerateSlug(slugSource);

        if (string.IsNullOrWhiteSpace(slug))
        {
            ModelState.AddModelError(
                nameof(model.Slug),
                "Slug không hợp lệ."
            );

            return View(model);
        }

        // Kiểm tra slug trùng với danh mục khác
        var slugExists = await _context.Categories
            .AnyAsync(c => c.Id != id && c.Slug == slug);

        if (slugExists)
        {
            ModelState.AddModelError(
                nameof(model.Slug),
                "Slug này đã được sử dụng."
            );

            return View(model);
        }

        category.Name = model.Name.Trim();
        category.Slug = slug;
        category.IsActive = model.IsActive;

        await _context.SaveChangesAsync();

        TempData["Success"] = "Cập nhật danh mục thành công.";

        return RedirectToAction(nameof(Index));
    }

    // POST: /AdminCategories/ToggleActive/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleActive(int id, bool isActive, string? keyword, string? status, string? sort, int page = 1)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound();
        }

        category.IsActive = isActive;

        await _context.SaveChangesAsync();

        TempData["Success"] = category.IsActive
            ? "Đã bật danh mục."
            : "Đã tắt danh mục.";

        return RedirectToAction(nameof(Index), new { keyword, status, sort, page });
    }

    // Chuyển tên tiếng Việt thành slug không dấu
    private static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        text = text.Trim().ToLowerInvariant();

        // Chuẩn hóa Unicode để loại bỏ dấu tiếng Việt
        text = text.Normalize(NormalizationForm.FormD);

        var builder = new StringBuilder();

        foreach (var character in text)
        {
            var unicodeCategory =
                CharUnicodeInfo.GetUnicodeCategory(character);

            if (unicodeCategory == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(character))
            {
                builder.Append(character);
            }
            else if (char.IsWhiteSpace(character) || character == '-')
            {
                builder.Append('-');
            }
        }

        var slug = builder.ToString()
            .Normalize(NormalizationForm.FormC);

        // Xóa dấu gạch ngang liên tiếp
        while (slug.Contains("--"))
        {
            slug = slug.Replace("--", "-");
        }

        return slug.Trim('-');
    }
}
