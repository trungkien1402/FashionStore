using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

public class HomeController : Controller
{
    private readonly IProductService _productService;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public HomeController(
        IProductService productService,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _productService = productService;
        _context = context;
        _userManager = userManager;
    }

    public async Task<IActionResult> Index()
    {
        var products = await _productService.GetAllProductsAsync();

        // Chỉ hiển thị sản phẩm đang kinh doanh
        var latestProducts = products
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Take(8)
            .ToList();

        ViewBag.PublishedCollections = await _context.LookbookCollections.AsNoTracking()
            .Where(c => c.IsPublished && !c.IsSale).OrderByDescending(c => c.Id).ToListAsync();
        ViewBag.ImportedLookbookKeys = await _context.LookbookCollections.AsNoTracking()
            .Where(c => !c.IsSale && c.SourceKey != null).Select(c => c.SourceKey).ToListAsync();
        var campaign = await SalePricing.ActiveCampaignAsync(_context);
        if (campaign != null) ViewBag.SaleCampaign = await LookbookCatalog.BuildAsync(_context, campaign);

        var rawReviews = await _context.ProductReviews.AsNoTracking()
            .Where(r => r.IsVisible && !r.IsReported && r.Product.IsActive && !string.IsNullOrWhiteSpace(r.Comment))
            .OrderByDescending(r => r.CreatedAt)
            .ThenByDescending(r => r.Id)
            .Take(3)
            .Select(r => new
            {
                r.Id,
                r.ProductId,
                ProductName = r.Product.Name,
                r.UserId,
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        var reviewerIds = rawReviews.Select(r => r.UserId).Distinct().ToList();
        var userLookup = reviewerIds.Count > 0
            ? await _context.Users.AsNoTracking()
                .Where(u => reviewerIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FullName, u.Email })
                .ToDictionaryAsync(u => u.Id)
            : [];

        ViewBag.CustomerReviews = rawReviews.Select(r =>
        {
            var customerName = "Khách hàng HNMTSHOP";
            if (userLookup.TryGetValue(r.UserId, out var u))
            {
                customerName = !string.IsNullOrWhiteSpace(u.FullName)
                    ? u.FullName.Trim()
                    : MaskEmail(u.Email);
            }

            return new HomeReviewViewModel
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.ProductName,
                CustomerName = customerName,
                Initials = GetInitials(customerName),
                Rating = Math.Clamp(r.Rating, 1, 5),
                Comment = r.Comment.Trim(),
                CreatedAt = r.CreatedAt
            };
        }).ToList();

        return View(latestProducts);
    }

    private static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return "Khách hàng HNMTSHOP";
        var atIndex = email.IndexOf('@');
        if (atIndex <= 1) return "Khách hàng HNMTSHOP";
        var local = email[..atIndex];
        return local.Length <= 3 ? local[0] + "***" : local[..3] + "***";
    }

    private static string GetInitials(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "KH";
        if (parts.Length == 1) return parts[0][..1].ToUpperInvariant();
        return string.Concat(parts[0][0], parts[^1][0]).ToUpperInvariant();
    }

    [HttpGet("/lookbook")]
    [HttpGet("/collections")]
    public async Task<IActionResult> Lookbook(string? theme)
    {
        var key = string.Equals(theme, "sunwash", StringComparison.OrdinalIgnoreCase) ? "sunwash" : "noir";
        var collection = await _context.LookbookCollections.AsNoTracking()
            .Where(c => !c.IsSale && c.SourceKey == key)
            .Select(c => new { c.Id, c.IsPublished }).FirstOrDefaultAsync();
        if (collection != null)
            return collection.IsPublished ? RedirectToAction(nameof(ManagedLookbook), new { id = collection.Id }) : NotFound();
        ViewBag.InitialTheme = key;
        return View();
    }

    public IActionResult SizeGuide()
    {
        return View();
    }

    [HttpGet("/collections/{id:int}")]
    public async Task<IActionResult> ManagedLookbook(int id)
    {
        var collection = await _context.LookbookCollections.AsNoTracking().Include(c => c.Looks)
            .SingleOrDefaultAsync(c => c.Id == id && c.IsPublished && !c.IsSale);
        return collection == null ? NotFound() : View(await LookbookCatalog.BuildAsync(_context, collection));
    }

    [HttpGet("/contact")]
    public async Task<IActionResult> Contact([FromQuery] string? subject = null, [FromQuery] string? message = null)
    {
        var model = new ContactViewModel();

        if (!string.IsNullOrWhiteSpace(subject))
        {
            model.Subject = subject;
        }

        if (!string.IsNullOrWhiteSpace(message))
        {
            model.Message = message;
        }

        if (User.Identity?.IsAuthenticated == true)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user != null)
            {
                model.FullName = user.FullName ?? string.Empty;
                model.Email = user.Email ?? string.Empty;
                model.PhoneNumber = user.PhoneNumber ?? string.Empty;
            }
        }

        return View(model);
    }

    [HttpPost("/contact")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Contact(ContactViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var request = new SupportRequest
        {
            FullName = model.FullName.Trim(),
            Email = model.Email.Trim(),
            PhoneNumber = model.PhoneNumber.Trim(),
            Subject = model.Subject.Trim(),
            OrderCode = string.IsNullOrWhiteSpace(model.OrderCode)
                ? null
                : model.OrderCode.Trim().ToUpper(),
            Message = model.Message.Trim(),
            Status = SupportRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _context.SupportRequests.Add(request);
        await _context.SaveChangesAsync();

        TempData["SuccessMessage"] =
            "Cảm ơn bạn! Yêu cầu của bạn đã được gửi thành công. Đội ngũ CSKH FashionStore sẽ phản hồi sớm nhất qua email hoặc số điện thoại.";

        return RedirectToAction(nameof(Contact));
    }
}
