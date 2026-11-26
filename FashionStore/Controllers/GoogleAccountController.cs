using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FashionStore.Controllers;

[AutoValidateAntiforgeryToken]
public class GoogleAccountController(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    ICartService cart,
    ApplicationDbContext db,
    IAuthenticationSchemeProvider schemes) : Controller
{
    private const string Provider = GoogleDefaults.AuthenticationScheme;

    [AllowAnonymous, HttpPost]
    public async Task<IActionResult> Login(string? returnUrl)
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToAction("Index", "Home");
        if (await schemes.GetSchemeAsync(Provider) is null)
            return LoginError("Đăng nhập Google chưa được cấu hình.");

        var callback = Url.Action(nameof(Callback), new { returnUrl = Url.IsLocalUrl(returnUrl) ? returnUrl : null });
        return Challenge(signIn.ConfigureExternalAuthenticationProperties(Provider, callback), Provider);
    }

    [AllowAnonymous, HttpGet]
    public async Task<IActionResult> Callback(string? returnUrl)
    {
        var info = await signIn.GetExternalLoginInfoAsync();
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToAction("Index", "Home");
        if (info is null || info.LoginProvider != Provider)
            return LoginError("Phiên đăng nhập Google đã hết hạn. Vui lòng thử lại.", returnUrl);

        var user = await users.FindByLoginAsync(Provider, info.ProviderKey);
        if (user is null)
        {
            var email = VerifiedEmail(info);
            if (email is null)
                return LoginError("Google chưa xác minh địa chỉ email của bạn.", returnUrl);
            user = await users.FindByEmailAsync(email);
            if (user is not null)
            {
                var googleManagesEmail = email.EndsWith("@gmail.com", StringComparison.OrdinalIgnoreCase) ||
                    !string.IsNullOrWhiteSpace(info.Principal.FindFirstValue("google_hosted_domain"));
                var roles = await users.GetRolesAsync(user);
                if (!googleManagesEmail || !user.EmailConfirmed || !user.IsActive ||
                    await users.IsLockedOutAsync(user) || roles.Count != 1 || roles[0] != "Customer")
                {
                    return LoginError("Email này đã có tài khoản. Hãy đăng nhập rồi liên kết Google trong Cài đặt tài khoản.", returnUrl);
                }

                if ((await users.GetLoginsAsync(user)).Any(login => login.LoginProvider == Provider) ||
                    !(await users.AddLoginAsync(user, info)).Succeeded)
                {
                    return LoginError("Không thể tự động liên kết Google với tài khoản này.", returnUrl);
                }
            }
            else
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    FullName = info.Principal.FindFirstValue(ClaimTypes.Name) ?? email,
                    IsActive = true
                };

                await using var transaction = await db.Database.BeginTransactionAsync();
                if (!(await users.CreateAsync(user)).Succeeded ||
                    !(await users.AddToRoleAsync(user, "Customer")).Succeeded ||
                    !(await users.AddLoginAsync(user, info)).Succeeded)
                {
                    return LoginError("Chưa thể tạo tài khoản Google. Vui lòng thử lại.", returnUrl);
                }
                await transaction.CommitAsync();
            }
        }

        if (!user.IsActive || !(await signIn.ExternalLoginSignInAsync(Provider, info.ProviderKey, isPersistent: false)).Succeeded)
            return LoginError("Không thể đăng nhập tài khoản này bằng Google.", returnUrl);

        await cart.MergeCartOnLoginAsync(user.Id);
        TempData["Success"] = "Đăng nhập thành công!";
        return Url.IsLocalUrl(returnUrl) ? LocalRedirect(returnUrl!) : RedirectToAction("Index", "Home");
    }

    [Authorize, HttpPost]
    public async Task<IActionResult> Link()
    {
        var user = await users.GetUserAsync(User);
        if (user is not { IsActive: true } || await schemes.GetSchemeAsync(Provider) is null)
            return LinkResult(false, "Không thể bắt đầu liên kết Google.");

        var callback = Url.Action(nameof(LinkCallback));
        return Challenge(signIn.ConfigureExternalAuthenticationProperties(Provider, callback, user.Id), Provider);
    }

    [Authorize, HttpGet]
    public async Task<IActionResult> LinkCallback()
    {
        var user = await users.GetUserAsync(User);
        var info = user is null ? null : await signIn.GetExternalLoginInfoAsync(user.Id);
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        if (user is not { IsActive: true } || info is null || info.LoginProvider != Provider)
            return LinkResult(false, "Phiên liên kết Google đã hết hạn. Vui lòng thử lại.");

        var email = VerifiedEmail(info);
        if (email is null || !string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase))
            return LinkResult(false, "Hãy chọn tài khoản Google có cùng email đã xác minh.");

        var linkedUser = await users.FindByLoginAsync(Provider, info.ProviderKey);
        if (linkedUser?.Id == user.Id)
            return LinkResult(true, "Tài khoản Google đã được liên kết.");
        if (linkedUser is not null || (await users.GetLoginsAsync(user)).Any(login => login.LoginProvider == Provider))
            return LinkResult(false, "Tài khoản Google hoặc FashionStore đã có liên kết.");

        var result = await users.AddLoginAsync(user, info);
        return result.Succeeded
            ? LinkResult(true, "Đã liên kết tài khoản Google.")
            : LinkResult(false, "Không thể liên kết tài khoản Google. Vui lòng thử lại.");
    }

    [AllowAnonymous, HttpGet]
    public IActionResult Failed() => User.Identity?.IsAuthenticated == true
        ? LinkResult(false, "Kết nối Google đã bị hủy hoặc không thành công.")
        : LoginError("Kết nối Google đã bị hủy hoặc không thành công.");

    private static string? VerifiedEmail(ExternalLoginInfo info) =>
        bool.TryParse(info.Principal.FindFirstValue("google_email_verified"), out var verified) && verified
            ? info.Principal.FindFirstValue(ClaimTypes.Email)
            : null;

    private IActionResult LoginError(string message, string? returnUrl = null)
    {
        TempData["GoogleLoginError"] = message;
        return RedirectToAction("Login", "Account", new { returnUrl = Url.IsLocalUrl(returnUrl) ? returnUrl : null });
    }

    private IActionResult LinkResult(bool success, string message)
    {
        TempData[success ? "SettingsSuccess" : "GoogleLinkError"] = message;
        return RedirectToAction("Index", "AccountSettings");
    }
}
