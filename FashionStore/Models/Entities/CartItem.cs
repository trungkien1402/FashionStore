namespace FashionStore.Models.Entities;

public class CartItem
{
    public int Id { get; set; }

    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    public int Quantity { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
