using System.Security.Claims;
using System.Text.Json;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FashionStore.Controllers;

[Authorize, AutoValidateAntiforgeryToken]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class AccountSettingsController(UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn, VietnamAddresses addresses) : Controller
{
    private const string AddressClaim = "hnmt:shipping-address";
    private sealed record SavedAddress(int ProvinceCode, int WardCode, string Address);

    [HttpGet("/Account/Settings")]
    public async Task<IActionResult> Index()
    {
        var user = await users.GetUserAsync(User);
        if (user is not { IsActive: true }) return Challenge();
        var saved = await ReadAddress(user);
        return View(await Populate(new AccountSettingsViewModel { FullName = user.FullName, PhoneNumber = user.PhoneNumber,
            ProvinceCode = saved?.ProvinceCode, WardCode = saved?.WardCode, Address = saved?.Address }, user));
    }

    [HttpPost("/Account/Settings"), RequestSizeLimit(2300000)]
    public async Task<IActionResult> Index(AccountSettingsViewModel model)
    {
        var user = await users.GetUserAsync(User);
        if (user is not { IsActive: true }) return Challenge();
        model.FullName = model.FullName?.Trim() ?? "";
        model.PhoneNumber = string.IsNullOrWhiteSpace(model.PhoneNumber) ? null : model.PhoneNumber.Trim();
        if (model.FullName.Length == 0) ModelState.AddModelError(nameof(model.FullName), "Vui lòng nhập họ tên.");
        var hasAddress = model.ProvinceCode.HasValue || model.WardCode.HasValue || !string.IsNullOrWhiteSpace(model.Address);
        if (hasAddress)
        {
            if (addresses.Resolve(model.ProvinceCode, model.WardCode) == null)
                ModelState.AddModelError(nameof(model.WardCode), "Chọn tỉnh/thành và xã/phường hợp lệ.");
            if (string.IsNullOrWhiteSpace(model.Address) || model.Address.Trim().Length < 5 || !model.Address.Any(char.IsLetter))
                ModelState.AddModelError(nameof(model.Address), "Nhập số nhà, tên đường hoặc thôn/ấp (ít nhất 5 ký tự).");
        }
        if (!ModelState.IsValid) return View(await Populate(model, user));
        user.FullName = model.FullName;
        if (user.PhoneNumber != model.PhoneNumber) user.PhoneNumberConfirmed = false;
        user.PhoneNumber = model.PhoneNumber;
        var result = await users.UpdateAsync(user);
        if (!result.Succeeded)
        {
            ModelState.AddModelError("", "Chưa lưu được thông tin. Vui lòng thử lại.");
            return View(await Populate(model, user));
        }
        var existing = (await users.GetClaimsAsync(user)).FirstOrDefault(c => c.Type == AddressClaim);
        var value = hasAddress ? JsonSerializer.Serialize(new SavedAddress(model.ProvinceCode!.Value, model.WardCode!.Value, model.Address!.Trim())) : null;
        var addressResult = existing == null
            ? value == null ? IdentityResult.Success : await users.AddClaimAsync(user, new Claim(AddressClaim, value))
            : value == null ? await users.RemoveClaimAsync(user, existing)
            : await users.ReplaceClaimAsync(user, existing, new Claim(AddressClaim, value));
        if (!addressResult.Succeeded)
        {
            ModelState.AddModelError("", "Thông tin đã lưu nhưng chưa lưu được địa chỉ. Vui lòng thử lại.");
            return View(await Populate(model, user));
        }
        await signIn.RefreshSignInAsync(user);
        TempData["SettingsSuccess"] = "Đã cập nhật thông tin tài khoản.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet("/Account/ChangePassword")]
    public IActionResult ChangePassword() => View(new ChangeAccountPasswordViewModel());

    [HttpGet("/Account/Display")]
    public IActionResult Display() => View();

    [HttpPost("/Account/ChangePassword"), EnableRateLimiting("login")]
    public async Task<IActionResult> ChangePassword(ChangeAccountPasswordViewModel model)
    {
        var user = await users.GetUserAsync(User);
        if (user is not { IsActive: true }) return Challenge();
        if (!ModelState.IsValid) return View(model);
        if (model.CurrentPassword == model.NewPassword)
        {
            ModelState.AddModelError(nameof(model.NewPassword), "Mật khẩu mới phải khác mật khẩu hiện tại.");
            return View(model);
        }
        var result = await users.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
        if (!result.Succeeded)
        {
            ModelState.AddModelError("", "Mật khẩu hiện tại chưa đúng hoặc mật khẩu mới không đạt yêu cầu.");
            return View(model);
        }
        await signIn.RefreshSignInAsync(user);
        TempData["SettingsSuccess"] = "Đã đổi mật khẩu. Các phiên khác sẽ được yêu cầu đăng nhập lại.";
        return RedirectToAction(nameof(Index));
    }

    private async Task<AccountSettingsViewModel> Populate(AccountSettingsViewModel model, ApplicationUser user)
    {
        model.Email = user.Email ?? "";
        model.CreatedAt = user.CreatedAt;

        return model;
    }
    [HttpGet("/Account/SavedAddress")]
    public async Task<IActionResult> SavedShippingAddress()
    {
        var user = await users.GetUserAsync(User);
        if (user is not { IsActive: true }) return Unauthorized();
        var saved = await ReadAddress(user);
        var location = saved == null ? null : addresses.Resolve(saved.ProvinceCode, saved.WardCode);
        return Json(location == null ? null : new { receiverName = user.FullName, phone = user.PhoneNumber,
            provinceCode = saved!.ProvinceCode, wardCode = saved.WardCode, address = saved.Address,
            label = $"{saved.Address}, {location.Value.Ward}, {location.Value.Province}" });
    }
    private async Task<SavedAddress?> ReadAddress(ApplicationUser user)
    {
        var raw = (await users.GetClaimsAsync(user)).FirstOrDefault(c => c.Type == AddressClaim)?.Value;
        try { return raw == null ? null : JsonSerializer.Deserialize<SavedAddress>(raw); }
        catch (JsonException) { return null; }
    }
}
