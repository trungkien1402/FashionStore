using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.ViewModels;

public class ContactViewModel
{
    [Required(ErrorMessage = "Vui lòng nhập họ và tên của bạn")]
    [Display(Name = "Họ và tên")]
    [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập địa chỉ email")]
    [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
    [Display(Name = "Email")]
    [StringLength(150, ErrorMessage = "Email không được vượt quá 150 ký tự")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
    [Display(Name = "Số điện thoại")]
    [RegularExpression(@"^(0[3|5|7|8|9])+([0-9]{8})$", ErrorMessage = "Số điện thoại không đúng định dạng (VD: 0988776655)")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn hoặc nhập chủ đề liên hệ")]
    [Display(Name = "Chủ đề")]
    [StringLength(100, ErrorMessage = "Chủ đề không được vượt quá 100 ký tự")]
    public string Subject { get; set; } = string.Empty;

    [Display(Name = "Mã đơn hàng (nếu có)")]
    [StringLength(50, ErrorMessage = "Mã đơn hàng không được vượt quá 50 ký tự")]
    public string? OrderCode { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập nội dung tin nhắn")]
    [Display(Name = "Nội dung")]
    [StringLength(2000, MinimumLength = 10, ErrorMessage = "Nội dung tin nhắn phải từ 10 đến 2000 ký tự")]
    public string Message { get; set; } = string.Empty;
}
