using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FashionStore.Controllers;

public class DisplayPreferencesController(IntroPreference preference) : Controller
{
    [AllowAnonymous, HttpPost("/Account/HideIntro"), ValidateAntiForgeryToken]
    public async Task<IActionResult> HideIntro()
    {
        if (!await preference.SetAsync(true)) return BadRequest("Chưa lưu được lựa chọn. Vui lòng thử lại.");
        return LocalRedirect("/#mainContent");
    }
    [Authorize, HttpPost("/Account/DisplayPreferences"), ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(bool showIntro)
    {
        TempData["SettingsSuccess"] = await preference.SetAsync(!showIntro)
            ? "Đã lưu cài đặt hiển thị phần giới thiệu trang chủ." : "Chưa lưu được lựa chọn. Vui lòng thử lại.";
        return RedirectToAction("Display", "AccountSettings");
    }
}
