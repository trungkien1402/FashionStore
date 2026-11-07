using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin")]
public class AdminUsersController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    private static readonly string[] AllowedRoles =
    {
        "Admin", "Manager", "Staff", "Shipper", "Customer"
    };

    public AdminUsersController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    // GET: /AdminUsers
    public async Task<IActionResult> Index(
        string? keyword,
        string? role,
        string? status,
        int page = 1)
    {
        const int pageSize = 15;
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var query = _userManager.Users.AsNoTracking().AsQueryable();

        // 1. Tìm kiếm theo Từ khóa (Tên, Email, Số điện thoại)
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim().ToLower();
            query = query.Where(u =>
                (u.FullName != null && u.FullName.ToLower().Contains(kw)) ||
                (u.Email != null && u.Email.ToLower().Contains(kw)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(kw)));
        }

        // 2. Lọc theo Trạng thái hoạt động
        if (status == "active")
        {
            query = query.Where(u => u.IsActive);
        }
        else if (status == "locked")
        {
            query = query.Where(u => !u.IsActive);
        }

        // 3. Lọc theo Vai trò
        if (!string.IsNullOrWhiteSpace(role) && AllowedRoles.Contains(role))
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

        var totalUsers = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalUsers / (double)pageSize);
        page = Math.Max(1, totalPages > 0 ? Math.Min(page, totalPages) : 1);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();

        // Thống kê số đơn hàng của người dùng
        var orderCounts = await _context.Orders
            .Where(o => userIds.Contains(o.UserId))
            .GroupBy(o => o.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.UserId, g => g.Count);

        // Thống kê số lượt giao hàng nếu là Shipper
        var shipmentCounts = await _context.Shipments
            .Where(s => userIds.Contains(s.ShipperId))
            .GroupBy(s => s.ShipperId)
            .Select(g => new { ShipperId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.ShipperId, g => g.Count);

        var viewModels = new List<AdminUserListItemViewModel>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            viewModels.Add(new AdminUserListItemViewModel
            {
                Id = user.Id,
                UserName = user.UserName ?? user.Email ?? string.Empty,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                Roles = roles,
                OrderCount = orderCounts.GetValueOrDefault(user.Id, 0),
                ShipmentCount = shipmentCounts.GetValueOrDefault(user.Id, 0),
                IsCurrentAdmin = user.Id == currentUserId
            });
        }

        ViewBag.Keyword = keyword;
        ViewBag.SelectedRole = role;
        ViewBag.SelectedStatus = status;
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = totalPages;
        ViewBag.TotalUsers = totalUsers;
        ViewBag.AvailableRoles = AllowedRoles;

        return View(viewModels);
    }

    // GET: /AdminUsers/Details/guid-id
    public async Task<IActionResult> Details(string id)
    {
        if (string.IsNullOrEmpty(id))
            return NotFound();

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var roles = await _userManager.GetRolesAsync(user);

        // Đơn hàng của người dùng
        var orders = await _context.Orders
            .Where(o => o.UserId == id)
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .AsNoTracking()
            .ToListAsync();

        var totalOrders = await _context.Orders.CountAsync(o => o.UserId == id);
        var totalSpent = await _context.Orders
            .Where(o => o.UserId == id && o.Status == Models.Enums.OrderStatus.Delivered)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        // Vận đơn của người dùng (nếu là Shipper)
        var totalShipments = await _context.Shipments.CountAsync(s => s.ShipperId == id);
        var deliveredShipments = await _context.Shipments
            .CountAsync(s => s.ShipperId == id && s.Status == Models.Enums.ShipmentStatus.Delivered);

        var recentShipments = await _context.Shipments
            .Include(s => s.Order)
            .Where(s => s.ShipperId == id)
            .OrderByDescending(s => s.CreatedAt)
            .Take(10)
            .AsNoTracking()
            .ToListAsync();

        var viewModel = new AdminUserDetailsViewModel
        {
            User = user,
            Roles = roles,
            TotalOrders = totalOrders,
            TotalSpent = totalSpent,
            RecentOrders = orders,
            TotalShipments = totalShipments,
            DeliveredShipments = deliveredShipments,
            RecentShipments = recentShipments,
            IsCurrentAdmin = user.Id == currentUserId
        };

        return View(viewModel);
    }

    // GET: /AdminUsers/Create
    [HttpGet]
    public IActionResult Create()
    {
        var model = new AdminUserCreateViewModel
        {
            AvailableRoles = GetRoleSelectList("Customer")
        };

        return View(model);
    }

    // POST: /AdminUsers/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(AdminUserCreateViewModel model)
    {
        if (!AllowedRoles.Contains(model.Role))
        {
            ModelState.AddModelError(nameof(model.Role), "Vai trò được chọn không hợp lệ.");
        }

        var existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser != null)
        {
            ModelState.AddModelError(nameof(model.Email), "Email này đã được sử dụng bởi một tài khoản khác.");
        }

        if (!ModelState.IsValid)
        {
            model.AvailableRoles = GetRoleSelectList(model.Role);
            return View(model);
        }

        var newUser = new ApplicationUser
        {
            UserName = model.Email.Trim(),
            Email = model.Email.Trim(),
            FullName = model.FullName.Trim(),
            PhoneNumber = model.PhoneNumber?.Trim(),
            IsActive = model.IsActive,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(newUser, model.Password);
        if (!createResult.Succeeded)
        {
            foreach (var error in createResult.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            model.AvailableRoles = GetRoleSelectList(model.Role);
            return View(model);
        }

        var roleResult = await _userManager.AddToRoleAsync(newUser, model.Role);
        if (!roleResult.Succeeded)
        {
            foreach (var error in roleResult.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            model.AvailableRoles = GetRoleSelectList(model.Role);
            return View(model);
        }

        TempData["Success"] = $"Tạo tài khoản thành công cho {newUser.Email} ({model.Role}).";
        return RedirectToAction(nameof(Index));
    }

    // GET: /AdminUsers/Edit/guid-id
    [HttpGet]
    public async Task<IActionResult> Edit(string id)
    {
        if (string.IsNullOrEmpty(id))
            return NotFound();

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        var model = new AdminUserEditViewModel
        {
            Id = user.Id,
            Email = user.Email ?? user.UserName ?? string.Empty,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = primaryRole,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            IsCurrentAdmin = user.Id == currentUserId,
            AvailableRoles = GetRoleSelectList(primaryRole)
        };

        return View(model);
    }

    // POST: /AdminUsers/Edit
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(AdminUserEditViewModel model)
    {
        var user = await _userManager.FindByIdAsync(model.Id);
        if (user == null)
            return NotFound();

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isCurrentAdmin = user.Id == currentUserId;
        model.IsCurrentAdmin = isCurrentAdmin;

        if (!AllowedRoles.Contains(model.Role))
        {
            ModelState.AddModelError(nameof(model.Role), "Vai trò được chọn không hợp lệ.");
        }

        // Quy tắc bảo vệ Admin:
        // 1. Không cho phép tự khóa tài khoản của chính mình
        if (isCurrentAdmin && !model.IsActive)
        {
            ModelState.AddModelError(nameof(model.IsActive), "Bạn không thể tự khóa tài khoản của chính mình.");
        }

        // 2. Không cho phép tự hạ quyền Admin của chính mình
        if (isCurrentAdmin && model.Role != "Admin")
        {
            ModelState.AddModelError(nameof(model.Role), "Bạn không thể tự hạ quyền Quản trị viên (Admin) của chính mình.");
        }

        // 3. Kiểm tra xem có phải tài khoản Admin duy nhất đang hoạt động không
        var isUserAdmin = await _userManager.IsInRoleAsync(user, "Admin");
        if (isUserAdmin && (!model.IsActive || model.Role != "Admin"))
        {
            var allAdmins = await _userManager.GetUsersInRoleAsync("Admin");
            var remainingActiveAdmins = allAdmins.Count(a => a.IsActive && a.Id != user.Id);
            if (remainingActiveAdmins == 0)
            {
                ModelState.AddModelError(string.Empty, "Hệ thống phải có ít nhất 1 Quản trị viên (Admin) đang hoạt động. Không thể khóa hoặc đổi vai trò của tài khoản này.");
            }
        }

        if (!ModelState.IsValid)
        {
            model.AvailableRoles = GetRoleSelectList(model.Role);
            return View(model);
        }

        user.FullName = model.FullName.Trim();
        user.PhoneNumber = model.PhoneNumber?.Trim();

        var oldActiveStatus = user.IsActive;
        user.IsActive = model.IsActive;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            foreach (var error in updateResult.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            model.AvailableRoles = GetRoleSelectList(model.Role);
            return View(model);
        }

        // Cập nhật Vai trò
        var currentRoles = await _userManager.GetRolesAsync(user);
        if (!currentRoles.Contains(model.Role))
        {
            if (currentRoles.Any())
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
            }
            await _userManager.AddToRoleAsync(user, model.Role);
        }

        // Nếu vừa khóa tài khoản, làm mới SecurityStamp để vô hiệu hóa phiên đăng nhập hiện tại
        if (oldActiveStatus && !user.IsActive)
        {
            await _userManager.UpdateSecurityStampAsync(user);
        }

        TempData["Success"] = $"Cập nhật thông tin tài khoản {user.Email} thành công.";
        return RedirectToAction(nameof(Details), new { id = user.Id });
    }

    // POST: /AdminUsers/ToggleStatus
    // Khóa / Mở khóa nhanh tài khoản
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleStatus(string id)
    {
        if (string.IsNullOrEmpty(id))
            return NotFound();

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Không tự khóa chính mình
        if (user.Id == currentUserId)
        {
            TempData["Error"] = "Bạn không thể tự khóa tài khoản của chính mình.";
            return RedirectToAction(nameof(Index));
        }

        // Bảo vệ Admin cuối cùng
        var isUserAdmin = await _userManager.IsInRoleAsync(user, "Admin");
        if (isUserAdmin && user.IsActive)
        {
            var allAdmins = await _userManager.GetUsersInRoleAsync("Admin");
            var remainingActiveAdmins = allAdmins.Count(a => a.IsActive && a.Id != user.Id);
            if (remainingActiveAdmins == 0)
            {
                TempData["Error"] = "Không thể khóa tài khoản Quản trị viên (Admin) duy nhất đang hoạt động trong hệ thống.";
                return RedirectToAction(nameof(Index));
            }
        }

        user.IsActive = !user.IsActive;

        if (!user.IsActive)
        {
            await _userManager.UpdateSecurityStampAsync(user);
        }

        var result = await _userManager.UpdateAsync(user);
        if (result.Succeeded)
        {
            TempData["Success"] = user.IsActive
                ? $"Đã mở khóa tài khoản {user.Email}."
                : $"Đã khóa tài khoản {user.Email}. Tài khoản này sẽ không thể đăng nhập.";
        }
        else
        {
            TempData["Error"] = "Có lỗi xảy ra khi cập nhật trạng thái tài khoản.";
        }

        return RedirectToAction(nameof(Index));
    }

    // GET: /AdminUsers/ResetPassword/guid-id
    [HttpGet]
    public async Task<IActionResult> ResetPassword(string id)
    {
        if (string.IsNullOrEmpty(id))
            return NotFound();

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var model = new AdminUserResetPasswordViewModel
        {
            UserId = user.Id,
            Email = user.Email ?? user.UserName ?? string.Empty,
            FullName = user.FullName
        };

        return View(model);
    }

    // POST: /AdminUsers/ResetPassword
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ResetPassword(AdminUserResetPasswordViewModel model)
    {
        var user = await _userManager.FindByIdAsync(model.UserId);
        if (user == null)
            return NotFound();

        if (!ModelState.IsValid)
        {
            model.Email = user.Email ?? user.UserName ?? string.Empty;
            model.FullName = user.FullName;
            return View(model);
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

        if (result.Succeeded)
        {
            // Làm mới security stamp để đăng xuất các phiên đăng nhập cũ
            await _userManager.UpdateSecurityStampAsync(user);

            TempData["Success"] = $"Đặt lại mật khẩu cho tài khoản {user.Email} thành công.";
            return RedirectToAction(nameof(Details), new { id = user.Id });
        }

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(string.Empty, error.Description);
        }

        model.Email = user.Email ?? user.UserName ?? string.Empty;
        model.FullName = user.FullName;
        return View(model);
    }

    private List<SelectListItem> GetRoleSelectList(string? selectedRole)
    {
        return AllowedRoles.Select(r => new SelectListItem
        {
            Value = r,
            Text = GetRoleDisplayName(r),
            Selected = r == selectedRole
        }).ToList();
    }

    private static string GetRoleDisplayName(string role) => role switch
    {
        "Admin" => "Quản trị viên (Admin)",
        "Manager" => "Quản lý (Manager)",
        "Staff" => "Nhân viên (Staff)",
        "Shipper" => "Giao hàng (Shipper)",
        "Customer" => "Khách hàng (Customer)",
        _ => role
    };
}
