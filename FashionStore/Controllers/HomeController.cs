using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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

        return View(latestProducts);
    }

    [HttpGet("/lookbook")]
    [HttpGet("/collections")]
    public IActionResult Lookbook(string? theme)
    {
        ViewBag.InitialTheme = string.Equals(theme, "sunwash", StringComparison.OrdinalIgnoreCase) ? "sunwash" : "noir";
        return View();
    }

    public IActionResult SizeGuide()
    {
        return View();
    }

    [HttpGet("/contact")]
    public async Task<IActionResult> Contact()
    {
        var model = new ContactViewModel();

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
