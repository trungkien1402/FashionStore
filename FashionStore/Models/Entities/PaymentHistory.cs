using FashionStore.Models.Enums;

namespace FashionStore.Models.Entities;

public class PaymentHistory
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string Event { get; set; } = string.Empty;
    public PaymentStatus OldStatus { get; set; }
    public PaymentStatus NewStatus { get; set; }
    public decimal Amount { get; set; }
    public string? ActorUserId { get; set; }
    public ApplicationUser? ActorUser { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
