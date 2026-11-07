namespace FashionStore.Models.ViewModels;

public class AdminUserListItemViewModel
{
    public string Id { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public IList<string> Roles { get; set; } = new List<string>();

    public int OrderCount { get; set; }

    public int ShipmentCount { get; set; }

    public bool IsCurrentAdmin { get; set; }
}
