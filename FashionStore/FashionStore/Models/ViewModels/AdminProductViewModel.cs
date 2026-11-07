using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FashionStore.Models.ViewModels;

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
}