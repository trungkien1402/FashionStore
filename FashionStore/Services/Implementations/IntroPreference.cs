using System.Security.Claims;
using FashionStore.Models.Entities;
using Microsoft.AspNetCore.Identity;

namespace FashionStore.Services.Implementations;

public sealed class IntroPreference(UserManager<ApplicationUser> users, IHttpContextAccessor accessor)
{
    private const string ClaimType = "hnmt:hide-intro";
    private const string CookieName = "hnmt-hide-intro";
    public async Task<bool> IsHiddenAsync()
    {
        var context = accessor.HttpContext!;
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var user = await users.GetUserAsync(context.User);
            return user != null && (await users.GetClaimsAsync(user)).Any(c => c.Type == ClaimType && c.Value == "1");
        }
        return context.Request.Cookies[CookieName] == "1";
    }
    public async Task<bool> SetAsync(bool hidden)
    {
        var context = accessor.HttpContext!;
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var user = await users.GetUserAsync(context.User);
            if (user is not { IsActive: true }) return false;
            var existing = (await users.GetClaimsAsync(user)).FirstOrDefault(c => c.Type == ClaimType);
            var value = hidden ? "1" : "0";
            var result = existing == null ? await users.AddClaimAsync(user, new Claim(ClaimType, value))
                : await users.ReplaceClaimAsync(user, existing, new Claim(ClaimType, value));
            if (!result.Succeeded) return false;
        }
        context.Response.Cookies.Append(CookieName, hidden ? "1" : "0", new CookieOptions {
            HttpOnly = true, Secure = context.Request.IsHttps, SameSite = SameSiteMode.Lax,
            IsEssential = true, MaxAge = TimeSpan.FromDays(365), Path = "/" });
        return true;
    }
}
