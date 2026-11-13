using System.Security.Claims;
using FashionStore.Services.Implementations;
﻿using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin,Manager")]
public class AdminProductVariantsController : Controller
{
    private readonly ApplicationDbContext _context;

    public AdminProductVariantsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /AdminProductVariants?productId=1
    public async Task<IActionResult> Index(int productId)
    {
        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            return NotFound();

        var variants = await _context.ProductVariants
            .Where(v => v.ProductId == productId)
            .OrderBy(v => v.Size)
            .ThenBy(v => v.Color)
            .AsNoTracking()
            .ToListAsync();

        ViewBag.Product = product;

        return View(variants);
    }

    // GET: /AdminProductVariants/Create?productId=1
    public async Task<IActionResult> Create(int productId)
    {
        var productExists = await _context.Products
            .AnyAsync(p => p.Id == productId);

        if (!productExists)
            return NotFound();

        var product = await _context.Products
            .AsNoTracking()
            .FirstAsync(p => p.Id == productId);

        return View(new ProductVariantViewModel
        {
            ProductId = productId,
            Price = product.Price,
            IsActive = true
        });
    }

    // POST: /AdminProductVariants/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ProductVariantViewModel model)
    {
        if (await _context.ProductVariants.AnyAsync(
                v => v.SKU == (model.SKU ?? "").Trim()))
        {
            ModelState.AddModelError(nameof(model.SKU), "SKU này đã tồn tại.");
        }

        var productExists = await _context.Products
            .AnyAsync(p => p.Id == model.ProductId);

        if (!productExists)
            return NotFound();

        if (!ModelState.IsValid)
            return View(model);

        var variant = new ProductVariant
        {
            ProductId = model.ProductId,
            SKU = (model.SKU ?? "").Trim(),
            Size = model.Size.Trim(),
            Color = model.Color.Trim(),
            Price = model.Price,
            StockQuantity = model.StockQuantity,
            IsActive = model.IsActive
        };

        _context.StockActorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        _context.StockReason = "Tạo biến thể " + variant.SKU;
        _context.ProductVariants.Add(variant);
        await _context.SaveChangesAsync();

        TempData["Success"] = "Thêm biến thể thành công.";

        return RedirectToAction(nameof(Index),
            new { productId = model.ProductId });
    }

    // GET: /AdminProductVariants/Edit/5
    public async Task<IActionResult> Edit(int id)
    {
        var variant = await _context.ProductVariants
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id);

        if (variant == null)
            return NotFound();

        return View(new ProductVariantViewModel
        {
            Id = variant.Id,
            ProductId = variant.ProductId,
            SKU = variant.SKU,
            Size = variant.Size,
            Color = variant.Color,
            Price = variant.Price,
            StockQuantity = variant.StockQuantity,
            IsActive = variant.IsActive
        });
    }

    // POST: /AdminProductVariants/Edit
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(ProductVariantViewModel model)
    {
        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(v => v.Id == model.Id);

        if (variant == null)
            return NotFound();

        if (await _context.ProductVariants.AnyAsync(v =>
                v.SKU == (model.SKU ?? "").Trim() && v.Id != model.Id))
        {
            ModelState.AddModelError(nameof(model.SKU), "SKU này đã tồn tại.");
        }

        if (!ModelState.IsValid)
            return View(model);

        variant.SKU = (model.SKU ?? "").Trim();
        variant.Size = model.Size.Trim();
        variant.Color = model.Color.Trim();
        if (variant.Price != model.Price)
            SalesRules.Audit(_context, User.FindFirstValue(ClaimTypes.NameIdentifier),
                "VariantPrice", variant.Id.ToString(), $"{variant.Price} → {model.Price}");
        variant.Price = model.Price;
        variant.IsActive = model.IsActive;

        await _context.SaveChangesAsync();

        TempData["Success"] = "Cập nhật biến thể thành công.";

        return RedirectToAction(nameof(Index),
            new { productId = variant.ProductId });
    }

    // POST: /AdminProductVariants/ToggleActive/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(v => v.Id == id);

        if (variant == null)
            return NotFound();

        variant.IsActive = !variant.IsActive;

        await _context.SaveChangesAsync();

        TempData["Success"] = variant.IsActive
            ? "Đã bật biến thể."
            : "Đã ẩn biến thể.";

        return RedirectToAction(nameof(Index),
            new { productId = variant.ProductId });
    }
}