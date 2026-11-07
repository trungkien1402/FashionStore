using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.ViewModels;

public class ProfileViewModel
{
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập họ và tên.")]
    [Display(Name = "Họ và tên")]
    [StringLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    [Display(Name = "Số điện thoại")]
    public string? PhoneNumber { get; set; }

    [Display(Name = "Ngày đăng ký")]
    public DateTime CreatedAt { get; set; }

    public string Role { get; set; } = string.Empty;
}
