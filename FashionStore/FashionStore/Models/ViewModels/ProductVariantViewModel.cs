using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.ViewModels;

public class ProductVariantViewModel
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập SKU.")]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn kích thước.")]
    [StringLength(20)]
    public string Size { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn màu sắc.")]
    [StringLength(50)]
    public string Color { get; set; } = string.Empty;

    [Range(0.01, 100000000, ErrorMessage = "Giá phải lớn hơn 0.")]
    public decimal Price { get; set; }

    [Range(0, 1000000, ErrorMessage = "Tồn kho không hợp lệ.")]
    public int StockQuantity { get; set; }

    public bool IsActive { get; set; } = true;
}