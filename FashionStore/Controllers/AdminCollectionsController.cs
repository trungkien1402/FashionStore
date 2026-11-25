using System.Text.Json;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using FashionStore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = AccessRoles.BackOffice)]
[AutoValidateAntiforgeryToken]
public class AdminCollectionsController(ApplicationDbContext db, IWebHostEnvironment environment) : Controller
{
    public async Task<IActionResult> Index(bool sale = false) => View(await db.LookbookCollections.AsNoTracking()
        .Where(c => c.IsSale == sale).Include(c => c.Looks).OrderByDescending(c => c.Id).ToListAsync());

    public async Task<IActionResult> Edit(int? id, bool sale = false)
    {
        if (id == null) return View(new LookbookCollectionForm { IsSale = sale });
        var collection = await FindCollection(id.Value);
        return collection == null ? NotFound() : View(ToForm(collection));
    }

    [HttpPost]
    public async Task<IActionResult> Edit(LookbookCollectionForm form)
    {
        var collection = form.Id == 0 ? new LookbookCollection { IsSale = form.IsSale } : await FindCollection(form.Id);
        if (collection == null) return NotFound();
        form.IsSale = collection.IsSale;
        if (form.IsSale && (!form.StartsAt.HasValue || !form.EndsAt.HasValue || form.EndsAt <= form.StartsAt))
            ModelState.AddModelError(nameof(form.EndsAt), "Hãy nhập giờ bắt đầu và giờ kết thúc hợp lệ.");
        if (form.Background == LookbookBackground.Custom && string.IsNullOrEmpty(form.BackgroundColor))
            ModelState.AddModelError(nameof(form.BackgroundColor), "Hãy chọn màu nền.");
        if (form.Cover != null && !await IsImageAsync(form.Cover))
            ModelState.AddModelError(nameof(form.Cover), "Ảnh bìa phải là PNG, JPG hoặc WebP, tối đa 5 MB.");
        if (!ModelState.IsValid)
        {
            form.CoverUrl = collection.CoverUrl;
            form.IsPublished = collection.IsPublished;
            form.Looks = collection.Looks;
            return View(form);
        }

        collection.StartsAt = form.IsSale && form.StartsAt is { } starts ? new DateTimeOffset(DateTime.SpecifyKind(starts, DateTimeKind.Unspecified), TimeSpan.FromHours(7)) : null;
        collection.EndsAt = form.IsSale && form.EndsAt is { } ends ? new DateTimeOffset(DateTime.SpecifyKind(ends, DateTimeKind.Unspecified), TimeSpan.FromHours(7)) : null;
        collection.SaleNotice = form.IsSale ? form.SaleNotice?.Trim() ?? "" : "";
        collection.Name = form.Name.Trim();
        collection.Description = form.Description?.Trim() ?? "";
        collection.Background = form.Background;
        collection.BackgroundColor = form.Background == LookbookBackground.Custom ? form.BackgroundColor : null;
        if (form.Cover != null) collection.CoverUrl = await StoreImageAsync(form.Cover);
        if (collection.Id == 0) db.LookbookCollections.Add(collection);
        await db.SaveChangesAsync();
        return RedirectToAction(nameof(Edit), new { id = collection.Id });
    }

    public async Task<IActionResult> Look(int collectionId, int? id)
    {
        var collection = await FindCollection(collectionId);
        if (collection == null) return NotFound();
        if (id == null) return View(new LookbookLookForm { CollectionId = collectionId, IsSale = collection.IsSale });
        var look = collection.Looks.SingleOrDefault(l => l.Id == id);
        if (look == null) return NotFound();
        return View(new LookbookLookForm
        {
            Id = look.Id, CollectionId = collectionId, Name = look.Name, IsSale = collection.IsSale,
            ImageUrl = look.ImageUrl, OriginalImageUrl = look.OriginalImageUrl,
            Items = LookbookCatalog.ReadItems(look)
        });
    }

    [HttpPost]
    public async Task<IActionResult> Look(LookbookLookForm form)
    {
        var collection = await FindCollection(form.CollectionId);
        if (collection == null) return NotFound();
        form.IsSale = collection.IsSale;
        if (form.IsSale && form.Items.Any(item => item.DiscountPercent <= 0))
            ModelState.AddModelError(nameof(form.Items), "Hãy nhập mức giảm cho từng món.");
        var look = form.Id == 0
            ? new LookbookLook { SortOrder = collection.Looks.Select(l => l.SortOrder).DefaultIfEmpty(-1).Max() + 1 }
            : collection.Looks.SingleOrDefault(l => l.Id == form.Id);
        if (look == null) return NotFound();
        var ids = form.Items.Select(item => item.ProductId).Distinct().ToArray();
        var candidates = await LookbookCatalog.Products(db).Where(p => ids.Contains(p.Id)).ToListAsync();
        var products = candidates.Where(ShowroomCatalog.HasRailListing).ToDictionary(p => p.Id);
        if (form.Items.Count == 0 || form.Items.Count > 3 || ids.Length != form.Items.Count ||
            products.Values.Select(p => p.ShowroomKind).Distinct().Count() != ids.Length ||
            form.Items.Any(item => !products.TryGetValue(item.ProductId, out var product) ||
                !product.Variants.Any(v => v.Color == item.Color)))
            ModelState.AddModelError(nameof(form.Items), "Chọn ít nhất một món, tối đa một áo, một quần và một đôi giày, đúng màu đang bán.");
        if ((form.Image == null && string.IsNullOrEmpty(look.ImageUrl)) ||
            (form.Image != null && !await IsImageAsync(form.Image)))
            ModelState.AddModelError(nameof(form.Image), "Chọn ảnh người mẫu PNG, JPG hoặc WebP, tối đa 5 MB.");
        if (form.Original != null && !await IsImageAsync(form.Original))
            ModelState.AddModelError(nameof(form.Original), "Ảnh gốc không hợp lệ hoặc vượt quá 5 MB.");
        if (!ModelState.IsValid)
        {
            form.ImageUrl = look.ImageUrl;
            form.OriginalImageUrl = look.OriginalImageUrl;
            return View(form);
        }

        look.Name = form.Name.Trim();
        if (form.Image != null)
        {
            look.ImageUrl = await StoreImageAsync(form.Image);
            look.OriginalImageUrl = form.Original != null ? await StoreImageAsync(form.Original) : look.ImageUrl;
        }
        look.ProductsJson = JsonSerializer.Serialize(form.Items, ShowroomCatalog.JsonOptions);
        if (look.Id == 0) collection.Looks.Add(look);
        await db.SaveChangesAsync();
        return RedirectToAction(nameof(Edit), new { id = collection.Id });
    }

    [HttpGet]
    public async Task<IActionResult> SearchProducts(string? q, int? id, string? kind, string? audience)
    {
        var products = LookbookCatalog.Products(db);
        if (id.HasValue) products = products.Where(p => p.Id == id);
        else if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            products = products.Where(p => p.Name.Contains(term) || p.Slug.Contains(term) ||
                p.Variants.Any(v => v.IsActive && v.SKU.Contains(term)));
        }

        if (kind is "ao" or "quan" or "giay") products = products.Where(p => p.ShowroomKind == kind);
        if (audience is "women" or "men" or "girls" or "boy") products = products.Where(p => p.ShowroomAudience == audience);
        var results = new List<Product>();
        await foreach (var product in products.OrderBy(p => p.Name).AsAsyncEnumerable())
        {
            if (!ShowroomCatalog.HasRailListing(product) || product.Variants.Count == 0) continue;
            results.Add(product);
            if (results.Count == 15) break;
        }
        return Json(results.Select(p => new
        {
            p.Id, p.Name, p.ImageUrl, kind = p.ShowroomKind,
            colors = p.Variants.Select(v => v.Color).Distinct().Order().ToArray(),
            prices = p.Variants.GroupBy(v => v.Color).ToDictionary(g => g.Key, g => g.Min(v => v.Price))
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Move(int collectionId, int lookId, int direction)
    {
        var collection = await FindCollection(collectionId);
        if (collection == null) return NotFound();
        var looks = collection.Looks.OrderBy(l => l.SortOrder).ThenBy(l => l.Id).ToList();
        var index = looks.FindIndex(l => l.Id == lookId);
        if (index < 0) return NotFound();
        var destination = index + Math.Sign(direction);
        if (destination >= 0 && destination < looks.Count)
        {
            (looks[index], looks[destination]) = (looks[destination], looks[index]);
            for (var i = 0; i < looks.Count; i++) looks[i].SortOrder = i;
            await db.SaveChangesAsync();
        }
        return RedirectToAction(nameof(Edit), new { id = collectionId });
    }

    [HttpPost]
    public async Task<IActionResult> Publish(int id, bool published)
    {
        var collection = await FindCollection(id);
        if (collection == null) return NotFound();
        if (published)
        {
            var display = await LookbookCatalog.BuildAsync(db, collection);
            if ((!collection.IsSale && string.IsNullOrEmpty(collection.CoverUrl)) ||
                (collection.IsSale && (!collection.StartsAt.HasValue || !collection.EndsAt.HasValue || collection.EndsAt <= collection.StartsAt)) || collection.Looks.Count == 0 ||
                collection.Looks.Any(l => string.IsNullOrEmpty(l.ImageUrl) || display.Selections[l.Id].Count == 0 ||
                    display.Selections[l.Id].Any(item => (collection.IsSale && item.DiscountPercent <= 0) ||
                        !display.Products.TryGetValue(item.ProductId, out var product) ||
                        !product.Variants.Any(variant => variant.Color == item.Color))))
            {
                TempData["Error"] = collection.IsSale
                    ? "Cần có lịch chạy hợp lệ, ít nhất một look có ảnh, và mức giảm cho từng sản phẩm."
                    : "Cần có ảnh bìa, ít nhất một look và sản phẩm còn hoạt động đúng màu trước khi đăng.";
                return RedirectToAction(nameof(Edit), new { id });
            }
        }
        collection.IsPublished = published;
        await db.SaveChangesAsync();
        return RedirectToAction(nameof(Edit), new { id });
    }

    public async Task<IActionResult> Preview(int id)
    {
        var collection = await FindCollection(id);
        if (collection == null) return NotFound();
        ViewBag.IsPreview = true;
        var display = await LookbookCatalog.BuildAsync(db, collection);
        return View(collection.IsSale ? "~/Views/Home/SalePreview.cshtml" : "~/Views/Home/ManagedLookbook.cshtml", display);
    }

    private Task<LookbookCollection?> FindCollection(int id) =>
        db.LookbookCollections.Include(c => c.Looks).SingleOrDefaultAsync(c => c.Id == id);

    private static LookbookCollectionForm ToForm(LookbookCollection collection) => new()
    {
        Id = collection.Id, Name = collection.Name, Description = collection.Description,
        IsSale = collection.IsSale, StartsAt = collection.StartsAt?.ToOffset(TimeSpan.FromHours(7)).DateTime, EndsAt = collection.EndsAt?.ToOffset(TimeSpan.FromHours(7)).DateTime, SaleNotice = collection.SaleNotice,
        Background = collection.Background,
        BackgroundColor = collection.BackgroundColor,
        CoverUrl = collection.CoverUrl, IsPublished = collection.IsPublished, Looks = collection.Looks
    };

    private static async Task<bool> IsImageAsync(IFormFile file)
    {
        if (file.Length is < 12 or > 5 * 1024 * 1024) return false;
        var header = new byte[12];
        await using var stream = file.OpenReadStream();
        await stream.ReadExactlyAsync(header);
        return Path.GetExtension(file.FileName).ToLowerInvariant() switch
        {
            ".png" => header.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }),
            ".jpg" or ".jpeg" => header[0] == 255 && header[1] == 216 && header[2] == 255,
            ".webp" => header.AsSpan(0, 4).SequenceEqual("RIFF"u8) && header.AsSpan(8, 4).SequenceEqual("WEBP"u8),
            _ => false
        };
    }

    private async Task<string> StoreImageAsync(IFormFile image)
    {
        var directory = Path.Combine(environment.WebRootPath, "images", "collections");
        Directory.CreateDirectory(directory);
        var name = $"{Guid.NewGuid():N}{Path.GetExtension(image.FileName).ToLowerInvariant()}";
        await using var stream = System.IO.File.Create(Path.Combine(directory, name));
        await image.CopyToAsync(stream);
        return $"/images/collections/{name}";
    }
}
