using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.Entities;

public enum LookbookBackground
{
    Noir = 0,
    Sunwash = 1,
    Blue = 2,
    Rose = 3,
    None = 4,
    Sage = 5,
    Lavender = 6,
    Peach = 7,
    Mint = 8,
    Sand = 9,
    Custom = 10
}

public class LookbookCollection
{
    public int Id { get; set; }
    [MaxLength(120)] public string Name { get; set; } = "";
    [MaxLength(1000)] public string Description { get; set; } = "";
    [MaxLength(255)] public string CoverUrl { get; set; } = "";
    public LookbookBackground Background { get; set; }
    [MaxLength(7)] public string? BackgroundColor { get; set; }
    public bool IsPublished { get; set; }
    public List<LookbookLook> Looks { get; set; } = [];
}

public class LookbookLook
{
    public int Id { get; set; }
    public int LookbookCollectionId { get; set; }
    [MaxLength(120)] public string Name { get; set; } = "";
    [MaxLength(255)] public string ImageUrl { get; set; } = "";
    [MaxLength(255)] public string OriginalImageUrl { get; set; } = "";
    public int SortOrder { get; set; }
    public string ProductsJson { get; set; } = "[]";
}
