using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using FashionStore.Data;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class StyleGameController(ApplicationDbContext db, IDataProtectionProvider protection) : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        ViewBag.Round = StyleGame.RoundProtector(protection).Protect("design", TimeSpan.FromHours(1));
        return View();
    }

    [HttpPost, ValidateAntiForgeryToken, RequestSizeLimit(500_000)]
    public async Task<IActionResult> Score(string? round, string? drawing, CancellationToken ct)
    {
        if (!ModelState.IsValid || round is null or { Length: > 500 } || drawing is null or { Length: > 350_000 })
            return BadRequest("Bản thiết kế quá lớn hoặc chưa hợp lệ.");
        DesignSubmission? design;
        try
        {
            if (StyleGame.RoundProtector(protection).Unprotect(round) != "design")
                return BadRequest("Phiên thiết kế chưa hợp lệ.");
            design = JsonSerializer.Deserialize<DesignSubmission>(drawing, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        }
        catch (CryptographicException)
        {
            return BadRequest("Phiên thiết kế đã hết hạn. Tải lại để bắt đầu.");
        }
        catch (JsonException)
        {
            return BadRequest("Không đọc được bản thiết kế.");
        }

        if (design == null || StyleGame.Evaluate(design) is not { } result)
            return BadRequest("Bản thiết kế chưa hợp lệ. Thử bớt số nét rồi chấm lại.");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var canClaim = User.IsInRole("Customer") && !string.IsNullOrEmpty(userId);
        string? code = null;
        decimal? percent = null;
        if (canClaim && result.Score >= 60)
        {
            var now = DateTime.UtcNow;
            var voucher = await db.Vouchers.AsNoTracking()
                .Where(v => v.IsActive && v.IsPercentage && v.GameMinimumScore != null &&
                    v.GameMinimumScore <= result.Score && v.StartsAt <= now && v.EndsAt > now &&
                    v.Redemptions.Count < v.TotalLimit && !v.Redemptions.Any(r => r.CustomerId == userId))
                .OrderByDescending(v => v.Value).ThenBy(v => v.EndsAt).ThenBy(v => v.Id)
                .FirstOrDefaultAsync(ct);
            if (voucher != null)
            {
                var expires = voucher.EndsAt - now;
                var token = StyleGame.RewardProtector(protection).Protect(
                    JsonSerializer.Serialize(new StyleReward(userId!, voucher.Code, result.Score)),
                    expires < TimeSpan.FromDays(7) ? expires : TimeSpan.FromDays(7));
                HttpContext.Session.SetString("StyleGameReward", token);
                code = voucher.Code;
                percent = voucher.Value;
            }
        }
        return Json(new { score = result.Score, coverage = result.Coverage, palette = result.Palette, detail = result.Detail, canClaim, code, percent });
    }
}
