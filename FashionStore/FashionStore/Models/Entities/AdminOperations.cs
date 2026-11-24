using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Models.Entities;

public class StockMovement
{
    public long Id { get; set; }
    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
    public int Before { get; set; }
    public int After { get; set; }
    [MaxLength(250)] public string Reason { get; set; } = "";
    [MaxLength(450)] public string? ActorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ReturnState { Requested, Approved, Rejected, Received, Refunded }

public class MerchandiseReturn
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    [MaxLength(500)] public string Reason { get; set; } = "";
    [MaxLength(500)] public string? Evidence { get; set; }
    [ConcurrencyCheck] public ReturnState State { get; set; }
    [Precision(18, 2)] public decimal RefundAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<ReturnEvent> Events { get; set; } = [];
}

public class ReturnEvent
{
    public int Id { get; set; }
    public int MerchandiseReturnId { get; set; }
    public ReturnState State { get; set; }
    [MaxLength(450)] public string? ActorId { get; set; }
    [MaxLength(500)] public string Note { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Voucher
{
    public int Id { get; set; }
    [MaxLength(40)] public string Code { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public bool IsPercentage { get; set; }
    [Precision(18, 2)] public decimal Value { get; set; }
    [Precision(18, 2)] public decimal MinimumOrder { get; set; }
    [Precision(18, 2)] public decimal? MaximumDiscount { get; set; }
    public int? GameMinimumScore { get; set; }
    public int TotalLimit { get; set; }
    public int CustomerLimit { get; set; }
    public int? CategoryId { get; set; }
    public int? ProductId { get; set; }
    public List<VoucherRedemption> Redemptions { get; set; } = [];
}

public class VoucherRedemption
{
    public int Id { get; set; }
    public int VoucherId { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    [MaxLength(450)] public string CustomerId { get; set; } = "";
}

public class StoreSettings
{
    public int Id { get; set; }
    [Precision(18, 2)] public decimal ShippingFee { get; set; } = 30000;
    [Precision(18, 2)] public decimal? FreeShippingThreshold { get; set; }
    [MaxLength(100)] public string StoreName { get; set; } = "FashionStore";
    [MaxLength(1000)] public string ReturnPolicy { get; set; } = "";
    public int ReturnWindowDays { get; set; } = 14;
}

public class AdminAuditEvent
{
    public long Id { get; set; }
    [MaxLength(60)] public string Action { get; set; } = "";
    [MaxLength(80)] public string Target { get; set; } = "";
    [MaxLength(450)] public string? ActorId { get; set; }
    [MaxLength(1000)] public string Detail { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ProductReview
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    [MaxLength(450)] public string UserId { get; set; } = "";
    public int Rating { get; set; }
    [MaxLength(1000)] public string Comment { get; set; } = "";
    public bool IsVisible { get; set; }
    public bool IsReported { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FeaturedProduct
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Position { get; set; }
}
