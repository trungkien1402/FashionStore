using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FashionStore.Models.ViewModels;

public class ProductVariantInputModel
{
    public string SKU { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; } = 10;
    public bool IsActive { get; set; } = true;
}

public class AdminProductViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập tên sản phẩm.")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập mô tả.")]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 100000000, ErrorMessage = "Giá sản phẩm phải lớn hơn 0.")]
    public decimal Price { get; set; }

    [Required(ErrorMessage = "Vui lòng chọn danh mục.")]
    public int CategoryId { get; set; }

    public IFormFile? ImageFile { get; set; }

    public string? CurrentImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    /// <summary>
    /// "variants" (nhiều size/màu) hoặc "simple" (freesize)
    /// </summary>
    public string ProductType { get; set; } = "variants";

    /// <summary>
    /// Số tồn kho ban đầu nếu là sản phẩm đơn giản (FreeSize)
    /// </summary>
    public int SimpleStock { get; set; } = 10;

    /// <summary>
    /// Danh sách biến thể sinh từ ma trận size & màu
    /// </summary>
    public List<ProductVariantInputModel> Variants { get; set; } = new();
}