namespace FashionStore.Models.Entities;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string? ShowroomAudience { get; set; }

    public string? ShowroomKind { get; set; }

    public int ShowroomSortOrder { get; set; }

    public string? ShowroomMetadata { get; set; }

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProductVariant> Variants { get; set; }
        = new List<ProductVariant>();
}
