using FashionStore.Models.Enums;

namespace FashionStore.Models.Entities;

public class Order
{
    public int Id { get; set; }

    public Guid? CheckoutRequestId { get; set; }
    public string OrderCode { get; set; } = string.Empty;

    public string UserId { get; set; } = string.Empty;

    public ApplicationUser User { get; set; } = null!;

    public string ReceiverName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }

    public decimal ShippingFee { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; }
        = OrderStatus.PendingConfirmation;

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;

    public PaymentStatus PaymentStatus { get; set; }
        = PaymentStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? TransferReportedAt { get; set; }

    public byte[] RowVersion { get; set; } = [];

    public ICollection<OrderItem> Items { get; set; }
        = new List<OrderItem>();

    /// <summary>
    /// Cờ bảo vệ chống hoàn kho nhiều lần (Cancelled / DeliveryFailed / Returned).
    /// </summary>
    public bool InventoryRestored { get; set; } = false;

    public ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
}
