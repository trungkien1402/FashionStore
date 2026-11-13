using System.Security.Claims;

namespace FashionStore.Services;

public static class AccessRoles
{
    public const string BackOffice = "Admin,Manager,Staff";
    public const string Management = "Admin,Manager";

    public static bool CanUseBackOffice(ClaimsPrincipal user) =>
        CanManage(user) || user.IsInRole("Staff");

    public static bool CanManage(ClaimsPrincipal user) =>
        user.IsInRole("Admin") || user.IsInRole("Manager");
}
