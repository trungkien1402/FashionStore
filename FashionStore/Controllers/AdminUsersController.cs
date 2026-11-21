using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin")]
[AutoValidateAntiforgeryToken]
public class AdminUsersController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminUsersController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    private string? ActorId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    // GET: /AdminUsers
    public async Task<IActionResult> Index(string? search, string? role, bool? isActive, string? sort, int page = 1)
    {
        const int pageSize = 20;
        var query = _context.Users.AsNoTracking().AsQueryable();

        var term = search?.Trim();
        if (!string.IsNullOrEmpty(term))
        {
            term = term[..Math.Min(term.Length, 100)];
            query = query.Where(u => u.FullName.Contains(term) ||
                                     (u.Email != null && u.Email.Contains(term)) ||
                                     (u.PhoneNumber != null && u.PhoneNumber.Contains(term)));
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        if (!string.IsNullOrEmpty(role))
        {
            var roleEntity = await _roleManager.FindByNameAsync(role);
            if (roleEntity != null)
            {
                var userIdsInRole = await _context.UserRoles
                    .Where(ur => ur.RoleId == roleEntity.Id)
                    .Select(ur => ur.UserId)
                    .ToListAsync();

                query = query.Where(u => userIdsInRole.Contains(u.Id));
            }
        }

        var totalCount = await query.CountAsync();
        var pageCount = Math.Max(1, (int)Math.Ceiling(totalCount / (double)pageSize));
        page = Math.Clamp(page, 1, pageCount);

        var orderedQuery = sort switch
        {
            "oldest" => query.OrderBy(u => u.CreatedAt),
            "name" => query.OrderBy(u => u.FullName),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };

        var users = await orderedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();

        // Load roles
        var userRoles = await (from ur in _context.UserRoles
                               join r in _context.Roles on ur.RoleId equals r.Id
                               where userIds.Contains(ur.UserId)
                               select new { ur.UserId, RoleName = r.Name })
                              .ToListAsync();

        var rolesLookup = userRoles.ToLookup(ur => ur.UserId, ur => ur.RoleName ?? "");

        // Load order stats
        var orderStats = await _context.Orders
            .Where(o => userIds.Contains(o.UserId))
            .GroupBy(o => o.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                Count = g.Count(),
                TotalSpent = g.Where(o => o.PaymentStatus == PaymentStatus.Paid).Sum(o => (decimal?)o.TotalAmount) ?? 0
            })
            .ToDictionaryAsync(s => s.UserId, s => s);

        var items = users.Select(u => new AdminUserItemViewModel
        {
            Id = u.Id,
            UserName = u.UserName ?? "",
            Email = u.Email ?? "",
            FullName = u.FullName,
            PhoneNumber = u.PhoneNumber,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            Roles = rolesLookup[u.Id].ToList(),
            OrderCount = orderStats.TryGetValue(u.Id, out var stat) ? stat.Count : 0,
            TotalSpent = stat?.TotalSpent ?? 0
        }).ToList();

        var model = new AdminUserListViewModel
        {
            Users = items,
            Search = term,
            Role = role,
            IsActive = isActive,
            Sort = sort,
            Page = page,
            PageCount = pageCount,
            TotalCount = totalCount
        };

        return View(model);
    }

    // GET: /AdminUsers/Details/guid
    public async Task<IActionResult> Details(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);

        var orders = await _context.Orders
            .Where(o => o.UserId == id)
            .OrderByDescending(o => o.CreatedAt)
            .Take(20)
            .AsNoTracking()
            .ToListAsync();

        var totalSpent = await _context.Orders
            .Where(o => o.UserId == id && o.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        var orderCount = await _context.Orders.CountAsync(o => o.UserId == id);

        var model = new AdminUserDetailsViewModel
        {
            User = user,
            Roles = roles.ToList(),
            RecentOrders = orders,
            TotalSpent = totalSpent,
            OrderCount = orderCount
        };

        return View(model);
    }

    // POST: /AdminUsers/ToggleLock
    [HttpPost]
    public async Task<IActionResult> ToggleLock(string id)
    {
        if (id == ActorId)
        {
            TempData["Error"] = "Bạn không thể tự khóa tài khoản của chính mình.";
            return RedirectToAction(nameof(Index));
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Admin") && user.IsActive)
        {
            var adminRole = await _roleManager.FindByNameAsync("Admin");
            if (adminRole != null)
            {
                var activeAdminCount = await (from ur in _context.UserRoles
                                              join u in _context.Users on ur.UserId equals u.Id
                                              where ur.RoleId == adminRole.Id && u.IsActive
                                              select u.Id).CountAsync();

                if (activeAdminCount <= 1)
                {
                    TempData["Error"] = "Không thể khóa Quản trị viên (Admin) duy nhất đang hoạt động.";
                    return RedirectToAction(nameof(Index));
                }
            }
        }

        user.IsActive = !user.IsActive;
        if (!user.IsActive)
        {
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
        }
        else
        {
            user.LockoutEnd = null;
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            TempData["Error"] = "Cập nhật trạng thái khóa thất bại.";
            return RedirectToAction(nameof(Index));
        }

        await _userManager.UpdateSecurityStampAsync(user);

        SalesRules.Audit(_context, ActorId, "UserLockStatus", user.UserName ?? user.Id,
            user.IsActive ? "Mở khóa tài khoản" : "Khóa tài khoản");
        await _context.SaveChangesAsync();

        TempData["Success"] = user.IsActive
            ? $"Đã mở khóa tài khoản {user.FullName}."
            : $"Đã khóa tài khoản {user.FullName}.";

        return RedirectToAction(nameof(Index));
    }

    // POST: /AdminUsers/UpdateRole
    [HttpPost]
    public async Task<IActionResult> UpdateRole(string id, string newRole)
    {
        var validRoles = new[] { "Admin", "Manager", "Staff", "Shipper", "Customer" };
        if (!validRoles.Contains(newRole))
        {
            TempData["Error"] = "Vai trò không hợp lệ.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var currentRoles = await _userManager.GetRolesAsync(user);

        if (id == ActorId && !newRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            TempData["Error"] = "Bạn không thể tự hạ quyền Quản trị viên (Admin) của chính mình.";
            return RedirectToAction(nameof(Details), new { id });
        }

        if (currentRoles.Contains("Admin") && !newRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            var adminRole = await _roleManager.FindByNameAsync("Admin");
            if (adminRole != null)
            {
                var adminCount = await _context.UserRoles.CountAsync(ur => ur.RoleId == adminRole.Id);
                if (adminCount <= 1)
                {
                    TempData["Error"] = "Không thể xóa quyền Admin của Quản trị viên cuối cùng trong hệ thống.";
                    return RedirectToAction(nameof(Details), new { id });
                }
            }
        }

        if (currentRoles.Count == 1 && currentRoles.Contains(newRole))
        {
            TempData["Success"] = "Người dùng đã có vai trò này.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded)
        {
            TempData["Error"] = "Không thể gỡ vai trò cũ.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var addResult = await _userManager.AddToRoleAsync(user, newRole);
        if (!addResult.Succeeded)
        {
            TempData["Error"] = "Không thể gán vai trò mới.";
            return RedirectToAction(nameof(Details), new { id });
        }

        await _userManager.UpdateSecurityStampAsync(user);

        SalesRules.Audit(_context, ActorId, "UserRoleChanged", user.UserName ?? user.Id,
            $"{string.Join(", ", currentRoles)} → {newRole}");
        await _context.SaveChangesAsync();

        TempData["Success"] = $"Đã cập nhật vai trò {newRole} cho {user.FullName}.";
        return RedirectToAction(nameof(Details), new { id });
    }

    // POST: /AdminUsers/ResetPassword
    [HttpPost]
    public async Task<IActionResult> ResetPassword(string id, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
        {
            TempData["Error"] = "Mật khẩu mới phải có ít nhất 6 ký tự.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            TempData["Error"] = $"Đặt lại mật khẩu thất bại: {errors}";
            return RedirectToAction(nameof(Details), new { id });
        }

        await _userManager.UpdateSecurityStampAsync(user);

        SalesRules.Audit(_context, ActorId, "UserPasswordReset", user.UserName ?? user.Id,
            "Quản trị viên đặt lại mật khẩu");
        await _context.SaveChangesAsync();

        TempData["Success"] = $"Đã đặt lại mật khẩu thành công cho {user.FullName}.";
        return RedirectToAction(nameof(Details), new { id });
    }
}
