using Microsoft.AspNetCore.RateLimiting;
﻿
using System.Security.Claims;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FashionStore.Controllers;

public class AccountController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ICartService _cartService;
    private readonly IConfiguration _configuration;

    public AccountController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ICartService cartService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _cartService = cartService;
        _configuration = configuration;
    }

    // GET: /Account/Register
    [HttpGet]
    [AllowAnonymous]
    public IActionResult Register()
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToAction("Index", "Home");

        return View();
    }

    // POST: /Account/Register
    [HttpPost]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        var isAjax = Request.Headers["X-Requested-With"] == "XMLHttpRequest" ||
                     Request.Headers["Accept"].ToString().Contains("application/json");

        if (!ModelState.IsValid)
        {
            if (isAjax)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return Json(new { success = false, message = string.Join(" ", errors) });
            }
            return View(model);
        }

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FullName = model.FullName,
            PhoneNumber = model.PhoneNumber,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            // Tài khoản đăng ký mới luôn có quyền Customer
            var roleResult = await _userManager.AddToRoleAsync(user, "Customer");

            if (!roleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);

                if (isAjax)
                {
                    var errors = roleResult.Errors.Select(e => e.Description).ToList();
                    return Json(new { success = false, message = string.Join(" ", errors) });
                }

                foreach (var error in roleResult.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);

                return View(model);
            }

            await _signInManager.SignInAsync(user, isPersistent: false);
            await _cartService.MergeCartOnLoginAsync(user.Id);

            TempData["Success"] = "Đăng ký tài khoản thành công!";

            if (isAjax)
            {
                return Json(new { success = true, redirectUrl = Url.Action("Index", "Home") });
            }

            return RedirectToAction("Index", "Home");
        }

        if (isAjax)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return Json(new { success = false, message = string.Join(" ", errors) });
        }

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(string.Empty, error.Description);
        }

        return View(model);
    }

    // GET: /Account/Login
    [HttpGet]
    [AllowAnonymous]
    public IActionResult Login(string? returnUrl = null)
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToAction("Index", "Home");

        return View(new LoginViewModel
        {
            ReturnUrl = returnUrl
        });
    }

    // POST: /Account/Login
    [HttpPost]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        var isAjax = Request.Headers["X-Requested-With"] == "XMLHttpRequest" ||
                     Request.Headers["Accept"].ToString().Contains("application/json");

        if (!ModelState.IsValid)
        {
            if (isAjax)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return Json(new { success = false, message = string.Join(" ", errors) });
            }
            return View(model);
        }

        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null || !user.IsActive)
        {
            var msg = "Email hoặc mật khẩu không chính xác.";
            if (isAjax)
                return Json(new { success = false, message = msg });

            ModelState.AddModelError(string.Empty, msg);
            return View(model);
        }

        var result = await _signInManager.PasswordSignInAsync(
            user.UserName!,
            model.Password,
            model.RememberMe,
            lockoutOnFailure: true
        );

        if (result.Succeeded)
        {
            await _cartService.MergeCartOnLoginAsync(user.Id);

            TempData["Success"] = "Đăng nhập thành công!";

            if (isAjax)
            {
                var redirectUrl = !string.IsNullOrEmpty(model.ReturnUrl) && Url.IsLocalUrl(model.ReturnUrl)
                    ? model.ReturnUrl
                    : Url.Action("Index", "Home");
                return Json(new { success = true, redirectUrl });
            }

            if (!string.IsNullOrEmpty(model.ReturnUrl) &&
                Url.IsLocalUrl(model.ReturnUrl))
            {
                return Redirect(model.ReturnUrl);
            }

            return RedirectToAction("Index", "Home");
        }

        var failMsg = result.IsLockedOut
            ? "Tài khoản tạm thời bị khóa. Vui lòng thử lại sau."
            : "Email hoặc mật khẩu không chính xác.";

        if (isAjax)
            return Json(new { success = false, message = failMsg });

        ModelState.AddModelError(string.Empty, failMsg);

        return View(model);
    }

    // POST: /Account/Logout
    [HttpPost]
    [Authorize]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout([FromServices] FashionStore.Services.AdminPresenceService presence)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.Identity?.Name;
        presence.Remove(userId);
        _cartService.ClearSessionCart();
        await _signInManager.SignOutAsync();

        TempData["Success"] = "Bạn đã đăng xuất.";
        return RedirectToAction("Index", "Home");
    }

    // GET: /Account/AccessDenied
    [HttpGet]
    public IActionResult AccessDenied()
    {
        return View();
    }

    // POST: /Account/ExternalLogin
    [HttpPost]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    public IActionResult ExternalLogin(string provider, string? returnUrl = null)
    {
        if (string.Equals(provider, "Google", StringComparison.OrdinalIgnoreCase))
        {
            var clientId = _configuration["Authentication:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId) || clientId.StartsWith("YOUR_"))
            {
                TempData["ErrorMessage"] = "Tính năng đăng nhập Google chưa được kích hoạt do chưa cấu hình Google Client ID và Secret trong appsettings.json.";
                return RedirectToAction(nameof(Login), new { returnUrl });
            }
        }
        else if (string.Equals(provider, "Apple", StringComparison.OrdinalIgnoreCase))
        {
            TempData["ErrorMessage"] = "Tính năng đăng nhập với Apple ID đang được cập nhật.";
            return RedirectToAction(nameof(Login), new { returnUrl });
        }

        var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Account", new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        return Challenge(properties, provider);
    }

    // GET: /Account/ExternalLoginCallback
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ExternalLoginCallback(string? returnUrl = null, string? remoteError = null)
    {
        returnUrl = !string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl)
            ? returnUrl
            : Url.Action("Index", "Home");

        if (remoteError != null)
        {
            TempData["ErrorMessage"] = $"Lỗi từ dịch vụ xác thực ngoài: {remoteError}";
            return RedirectToAction(nameof(Login), new { returnUrl });
        }

        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            TempData["ErrorMessage"] = "Không thể lấy thông tin đăng nhập từ dịch vụ ngoài. Vui lòng thử lại.";
            return RedirectToAction(nameof(Login), new { returnUrl });
        }

        // 1. Nếu tài khoản đã từng liên kết provider này trước đó -> Đăng nhập ngay
        var signInResult = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: true,
            bypassTwoFactor: true);

        if (signInResult.Succeeded)
        {
            var existingUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (existingUser != null)
            {
                if (!existingUser.IsActive)
                {
                    await _signInManager.SignOutAsync();
                    TempData["ErrorMessage"] = "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
                    return RedirectToAction(nameof(Login));
                }
                await _cartService.MergeCartOnLoginAsync(existingUser.Id);
            }
            TempData["Success"] = "Đăng nhập với Google thành công!";
            return LocalRedirect(returnUrl ?? "/");
        }

        if (signInResult.IsLockedOut)
        {
            TempData["ErrorMessage"] = "Tài khoản tạm thời bị khóa. Vui lòng thử lại sau.";
            return RedirectToAction(nameof(Login));
        }

        // 2. Lấy Email từ thông tin tài khoản Google
        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
        {
            TempData["ErrorMessage"] = "Tài khoản Google không chia sẻ địa chỉ email hợp lệ.";
            return RedirectToAction(nameof(Login), new { returnUrl });
        }

        // 3. Kiểm tra xem Email đã có tài khoản trong hệ thống chưa
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            // TỰ ĐỘNG ĐĂNG KÝ TÀI KHOẢN MỚI
            var fullName = info.Principal.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrWhiteSpace(fullName))
            {
                fullName = email.Split('@')[0];
            }

            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                TempData["ErrorMessage"] = $"Không thể tự động tạo tài khoản: {errors}";
                return RedirectToAction(nameof(Login), new { returnUrl });
            }

            // Gán role mặc định Customer
            await _userManager.AddToRoleAsync(user, "Customer");
        }
        else
        {
            // Nếu tài khoản đã tồn tại, kiểm tra trạng thái hoạt động
            if (!user.IsActive)
            {
                TempData["ErrorMessage"] = "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
                return RedirectToAction(nameof(Login));
            }
        }

        // 4. Liên kết Provider Google với User
        var addLoginResult = await _userManager.AddLoginAsync(user, info);
        if (!addLoginResult.Succeeded)
        {
            var userLogins = await _userManager.GetLoginsAsync(user);
            var alreadyLinked = userLogins.Any(l => l.LoginProvider == info.LoginProvider && l.ProviderKey == info.ProviderKey);
            if (!alreadyLinked)
            {
                var errors = string.Join("; ", addLoginResult.Errors.Select(e => e.Description));
                TempData["ErrorMessage"] = $"Không thể liên kết tài khoản Google: {errors}";
                return RedirectToAction(nameof(Login), new { returnUrl });
            }
        }

        // 5. Đăng nhập và đồng bộ giỏ hàng
        await _signInManager.SignInAsync(user, isPersistent: true);
        await _cartService.MergeCartOnLoginAsync(user.Id);

        TempData["Success"] = "Đăng nhập với Google thành công!";
        return LocalRedirect(returnUrl ?? "/");
    }
}
