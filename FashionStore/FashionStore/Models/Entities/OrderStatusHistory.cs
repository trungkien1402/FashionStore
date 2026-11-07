
using FashionStore.Models.Enums;

namespace FashionStore.Models.Entities;

public class OrderStatusHistory
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public OrderStatus? OldStatus { get; set; }

    public OrderStatus NewStatus { get; set; }

    // ID tài khoản thực hiện thay đổi
    public string? ChangedByUserId { get; set; }
    public ApplicationUser? ChangedByUser { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
