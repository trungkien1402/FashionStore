
using System.Globalization;
using System.Text;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin,Manager")]
public class AdminCategoriesController : Controller
{
    private readonly ApplicationDbContext _context;

    public AdminCategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /AdminCategories
    public async Task<IActionResult> Index(string? keyword, string? status)
    {
        var query = _context.Categories
            .AsNoTracking()
            .AsQueryable();

        // Tìm kiếm theo tên danh mục
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            keyword = keyword.Trim();
            query = query.Where(c => c.Name.Contains(keyword));
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

        // Lấy danh sách danh mục và số lượng sản phẩm
        var categories = await query
            .OrderBy(c => c.Name)
            .Select(c => new AdminCategoryListItemViewModel
            {
                Category = c,
                ProductCount = c.Products.Count()
            })
            .ToListAsync();

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
    public async Task<IActionResult> ToggleActive(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound();
        }

        category.IsActive = !category.IsActive;

        await _context.SaveChangesAsync();

        TempData["Success"] = category.IsActive
            ? "Đã hiển thị danh mục."
            : "Đã ẩn danh mục.";

        return RedirectToAction(nameof(Index));
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
