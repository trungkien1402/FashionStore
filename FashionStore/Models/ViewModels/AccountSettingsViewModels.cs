using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.ViewModels;

public class AccountSettingsViewModel
{
    [Required(ErrorMessage = "Vui lòng nhập họ tên."), StringLength(100)]
    public string FullName { get; set; } = "";
    [RegularExpression(@"^(?:0[35789][0-9]{8}|\+84[35789][0-9]{8})$", ErrorMessage = "Nhập số điện thoại Việt Nam hợp lệ (0… hoặc +84…).")]
    public string? PhoneNumber { get; set; }
    [Microsoft.AspNetCore.Mvc.ModelBinding.Validation.ValidateNever]
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public int? ProvinceCode { get; set; }
    public int? WardCode { get; set; }
    [StringLength(180, ErrorMessage = "Địa chỉ chi tiết tối đa 180 ký tự.")]
    public string? Address { get; set; }
}

public class ChangeAccountPasswordViewModel
{
    [Required(ErrorMessage = "Nhập mật khẩu hiện tại."), DataType(DataType.Password)]
    public string CurrentPassword { get; set; } = "";
    [Required(ErrorMessage = "Nhập mật khẩu mới."), DataType(DataType.Password)]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Mật khẩu cần từ 8 đến 100 ký tự.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$", ErrorMessage = "Cần chữ hoa, chữ thường, số và ký tự đặc biệt.")]
    public string NewPassword { get; set; } = "";
    [Required(ErrorMessage = "Xác nhận mật khẩu mới."), DataType(DataType.Password)]
    [Compare(nameof(NewPassword), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    public string ConfirmPassword { get; set; } = "";
}
