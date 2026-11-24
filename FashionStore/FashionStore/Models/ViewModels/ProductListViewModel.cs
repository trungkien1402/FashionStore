using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class ProductListViewModel
{
    public List<Product> Products { get; set; } = new();

    public List<Product> AllCatalogProducts { get; set; } = new();

    public string? Keyword { get; set; }

    public int? CategoryId { get; set; }

    public decimal? MinPrice { get; set; }

    public decimal? MaxPrice { get; set; }

    public string SortOrder { get; set; } = "newest";

    public int CurrentPage { get; set; } = 1;

    public int PageSize { get; set; } = 12;

    public int TotalItems { get; set; }

    public int TotalPages =>
        (int)Math.Ceiling(TotalItems / (double)PageSize);

    public List<Category> Categories { get; set; } = new();
}
