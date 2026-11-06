using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FashionStore.Models.ViewModels;

public class AdminUserEditViewModel
{
    public string Id { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập họ và tên.")]
    [Display(Name = "Họ và tên")]
    [StringLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    [Display(Name = "Số điện thoại")]
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = "Vui lòng chọn vai trò.")]
    [Display(Name = "Vai trò")]
    public string Role { get; set; } = "Customer";

    [Display(Name = "Trạng thái hoạt động")]
    public bool IsActive { get; set; } = true;

    [Display(Name = "Ngày đăng ký")]
    public DateTime CreatedAt { get; set; }

    public bool IsCurrentAdmin { get; set; }

    public List<SelectListItem> AvailableRoles { get; set; } = new();
}
