using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public class AdminInventoryItem
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public string ProductSlug { get; set; } = "";
    public string? ProductImage { get; set; }
    public string? CategoryName { get; set; }
    public string Sku { get; set; } = "";
    public string Size { get; set; } = "";
    public string Color { get; set; } = "";
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public decimal AssetValue => Price * StockQuantity;
    public bool IsActive { get; set; }
}

public class AdminInventoryViewModel
{
    // KPIs
    public int TotalVariants { get; set; }
    public int TotalStockQuantity { get; set; }
    public decimal TotalAssetValue { get; set; }
    public int OutOfStockCount { get; set; }
    public int LowStockCount { get; set; }
    public int HealthyStockCount { get; set; }

    // Filters & Pagination
    public string Filter { get; set; } = "all"; // "all", "out", "low", "healthy"
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public string Sort { get; set; } = "stock_asc"; // "stock_asc", "stock_desc", "price_desc", "name_asc"
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 25;
    public int TotalItems { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);

    // Data
    public List<AdminInventoryItem> Items { get; set; } = [];
    public List<Category> Categories { get; set; } = [];
}
