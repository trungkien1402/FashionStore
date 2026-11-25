using System.ComponentModel.DataAnnotations;
using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class LookbookCollectionForm
{
    [EnumDataType(typeof(LookbookBackground))]
    public LookbookBackground Background { get; set; }
    [RegularExpression("^#[0-9a-fA-F]{6}$", ErrorMessage = "Màu nền phải có dạng #RRGGBB.")]
    public string? BackgroundColor { get; set; }
    public int Id { get; set; }
    [Required, StringLength(120)] public string Name { get; set; } = "";
    [StringLength(1000)] public string? Description { get; set; }
    public IFormFile? Cover { get; set; }
    public string CoverUrl { get; set; } = "";
    public bool IsSale { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    [StringLength(240)] public string? SaleNotice { get; set; }
    public bool IsPublished { get; set; }
    public List<LookbookLook> Looks { get; set; } = [];
}

public class LookbookLookForm
{
    public bool IsSale { get; set; }
    public int Id { get; set; }
    public int CollectionId { get; set; }
    [Required, StringLength(120)] public string Name { get; set; } = "";
    public IFormFile? Image { get; set; }
    public IFormFile? Original { get; set; }
    public string ImageUrl { get; set; } = "";
    public string OriginalImageUrl { get; set; } = "";
    public List<LookbookSelection> Items { get; set; } = [];
}

public class LookbookSelection
{
    [Range(0, 100)] public int DiscountPercent { get; set; }
    public int ProductId { get; set; }
    [Required, StringLength(120)] public string Color { get; set; } = "";
    [Range(0, 100)] public double X { get; set; } = 50;
    [Range(0, 100)] public double Y { get; set; } = 50;
}

public record LookbookDisplay(LookbookCollection Collection,
    IReadOnlyDictionary<int, Product> Products, IReadOnlyDictionary<int, List<LookbookSelection>> Selections);
