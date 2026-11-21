using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class AdminUserItemViewModel
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Roles { get; set; } = [];
    public int OrderCount { get; set; }
    public decimal TotalSpent { get; set; }
}

public class AdminUserListViewModel
{
    public List<AdminUserItemViewModel> Users { get; set; } = [];
    public string? Search { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public string? Sort { get; set; }
    public int Page { get; set; } = 1;
    public int PageCount { get; set; } = 1;
    public int TotalCount { get; set; }
    public List<string> AvailableRoles { get; set; } = ["Admin", "Manager", "Staff", "Shipper", "Customer"];
}

public class AdminUserDetailsViewModel
{
    public ApplicationUser User { get; set; } = null!;
    public List<string> Roles { get; set; } = [];
    public List<Order> RecentOrders { get; set; } = [];
    public decimal TotalSpent { get; set; }
    public int OrderCount { get; set; }
}
