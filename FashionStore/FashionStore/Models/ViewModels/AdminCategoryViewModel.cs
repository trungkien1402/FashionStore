using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.ViewModels;

public class AdminCategoryViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập tên danh mục.")]
    [StringLength(100, ErrorMessage = "Tên danh mục không được vượt quá 100 ký tự.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(150)]
    public string? Slug { get; set; }

    public bool IsActive { get; set; } = true;
}