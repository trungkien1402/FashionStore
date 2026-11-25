using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FashionStore.Controllers;

[AllowAnonymous]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class PasswordRecoveryController(UserManager<ApplicationUser> users, PasswordRecoveryOtp otp,
    IPasswordRecoveryEmail emailSender, PasswordRecoveryEmailQueue emailQueue) : Controller
{
    private const string CookieName = "hnmt-password-recovery";
    private string? ChallengeId => Request.Cookies[CookieName];
    private CookieOptions CookieSettings => new() { HttpOnly = true, Secure = Request.IsHttps,
        SameSite = SameSiteMode.Strict, IsEssential = true, Path = "/Account",
        MaxAge = TimeSpan.FromMinutes(PasswordRecoveryOtp.LifetimeMinutes) };

    [HttpGet("/Account/ForgotPassword")]
    public IActionResult ForgotPassword() => View(new ForgotPasswordViewModel());

    [HttpPost("/Account/ForgotPassword"), ValidateAntiForgeryToken, EnableRateLimiting("password-recovery")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
    {
        if (!ModelState.IsValid) return View(model);
        if (!emailSender.IsConfigured)
        {
            ModelState.AddModelError("", "Chức năng gửi email chưa được cấu hình. Vui lòng liên hệ cửa hàng để được hỗ trợ.");
            return View(model);
        }
        var email = model.Email.Trim();
        var user = await users.FindByEmailAsync(email);
        var eligible = user is { IsActive: true } && await users.HasPasswordAsync(user);
        var token = eligible ? await users.GeneratePasswordResetTokenAsync(user!) : null;
        var challenge = otp.Issue(email, eligible ? user!.Id : null, token);
        if (challenge == null)
        {
            ModelState.AddModelError("", "Vui lòng chờ ít nhất 60 giây giữa các lần yêu cầu OTP.");
            return View(model);
        }
        if (!emailQueue.TryEnqueue(challenge.Id, eligible ? user!.Email : null, challenge.Code))
        {
            otp.Revoke(challenge.Id);
            ModelState.AddModelError("", "Hệ thống đang bận. Vui lòng thử lại sau 60 giây.");
            return View(model);
        }
        Response.Cookies.Append(CookieName, challenge.Id, CookieSettings);
        return RedirectToAction(nameof(VerifyOtp));
    }

    [HttpGet("/Account/ForgotPasswordConfirmation")]
    public IActionResult ForgotPasswordConfirmation() => RedirectToAction(nameof(VerifyOtp));

    [HttpGet("/Account/OtpDeliveryStatus")]
    public IActionResult OtpDeliveryStatus() => Json(new { status = otp.DeliveryStatus(ChallengeId) });

    [HttpGet("/Account/VerifyOtp")]
    public IActionResult VerifyOtp()
    {
        if (otp.IsVerified(ChallengeId)) return RedirectToAction(nameof(ResetPassword));
        if (!otp.IsPending(ChallengeId))
        {
            TempData["RecoveryError"] = "Phiên xác nhận đã hết hạn hoặc không còn hiệu lực. Vui lòng yêu cầu OTP mới.";
            return RedirectToAction(nameof(ForgotPassword));
        }
        return View(new VerifyPasswordOtpViewModel());
    }

    [HttpPost("/Account/VerifyOtp"), ValidateAntiForgeryToken, EnableRateLimiting("password-otp")]
    public IActionResult VerifyOtp(VerifyPasswordOtpViewModel model)
    {
        if (!ModelState.IsValid) return View(model);
        if (otp.Verify(ChallengeId, model.Code)) return RedirectToAction(nameof(ResetPassword));
        ModelState.AddModelError("", "Mã OTP không đúng, đã hết hạn hoặc đã vượt quá 5 lần thử. Vui lòng kiểm tra mã mới nhất hoặc yêu cầu mã mới.");
        ModelState.Remove(nameof(model.Code));
        model.Code = "";
        return View(model);
    }

    [HttpGet("/Account/ResetPassword")]
    public IActionResult ResetPassword()
    {
        if (!otp.IsVerified(ChallengeId)) return RedirectToAction(nameof(VerifyOtp));
        return View(new ResetPasswordViewModel());
    }

    [HttpPost("/Account/ResetPassword"), ValidateAntiForgeryToken, EnableRateLimiting("password-otp")]
    public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
    {
        if (!otp.IsVerified(ChallengeId)) return RedirectToAction(nameof(VerifyOtp));
        if (!ModelState.IsValid) return View(model);
        // Atomic consumption prevents concurrent posts from reusing the verified challenge.
        var authorized = otp.TakeVerified(ChallengeId);
        Response.Cookies.Delete(CookieName, CookieSettings);
        if (authorized != null)
        {
            var user = await users.FindByIdAsync(authorized.UserId);
            if (user is { IsActive: true } && string.Equals(user.Email, authorized.Email, StringComparison.OrdinalIgnoreCase))
            {
                var result = await users.ResetPasswordAsync(user, authorized.ResetToken, model.Password);
                if (result.Succeeded) return RedirectToAction(nameof(ResetPasswordConfirmation));
            }
        }
        TempData["RecoveryError"] = "Không thể đổi mật khẩu với phiên này. Vui lòng yêu cầu OTP mới.";
        return RedirectToAction(nameof(ForgotPassword));
    }

    [HttpGet("/Account/ResetPasswordConfirmation")]
    public IActionResult ResetPasswordConfirmation() => View();
}
