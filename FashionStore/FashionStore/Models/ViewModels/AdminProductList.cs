using System.ComponentModel.DataAnnotations;
using System.Globalization;
using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class AdminProductFilter
{
    public string? Keyword { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsActive { get; set; }
    [Range(typeof(decimal), "0", "9999999999999999")]
    public decimal? MinPrice { get; set; }
    [Range(typeof(decimal), "0", "9999999999999999")]
    public decimal? MaxPrice { get; set; }
    [StringLength(100)]
    public string? Size { get; set; }
    [StringLength(100)]
    public string? Color { get; set; }
    public string? Stock { get; set; }
    public string? Sort { get; set; }
    public int Page { get; set; } = 1;

    public Dictionary<string, string> RouteValues(int page) => new()
    {
        ["keyword"] = Keyword ?? "",
        ["categoryId"] = CategoryId?.ToString(CultureInfo.InvariantCulture) ?? "",
        ["isActive"] = IsActive?.ToString() ?? "",
        ["minPrice"] = MinPrice?.ToString(CultureInfo.InvariantCulture) ?? "",
        ["maxPrice"] = MaxPrice?.ToString(CultureInfo.InvariantCulture) ?? "",
        ["size"] = Size ?? "",
        ["color"] = Color ?? "",
        ["stock"] = Stock ?? "",
        ["sort"] = Sort ?? "",
        ["page"] = page.ToString(CultureInfo.InvariantCulture)
    };
}

public class AdminProductRow
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Slug { get; init; } = "";
    public string? ImageUrl { get; init; }
    public string CategoryName { get; init; } = "";
    public decimal Price { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public int VariantCount { get; init; }
    public long TotalStock { get; init; }
}

public record AdminProductList(AdminProductFilter Filter, List<AdminProductRow> Products,
    int Count, int PageCount, bool HasProducts, List<Category> Categories, List<string> Sizes, List<string> Colors);
