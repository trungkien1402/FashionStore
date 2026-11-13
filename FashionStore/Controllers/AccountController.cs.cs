
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FashionStore.Controllers;

public class AccountController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AccountController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
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
    public async Task<IActionResult> Logout()
    {
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
}
