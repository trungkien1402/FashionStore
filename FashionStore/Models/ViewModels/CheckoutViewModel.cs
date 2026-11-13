using FashionStore.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.ViewModels;

public class CheckoutViewModel
{
    public Guid CheckoutRequestId { get; set; }
    [Required(ErrorMessage = "Vui lòng nhập tên người nhận.")]
    [StringLength(100)]
    public string ReceiverName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại.")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Chọn tỉnh hoặc thành phố.")]
    public int? ProvinceCode { get; set; }

    [Required(ErrorMessage = "Chọn xã hoặc phường.")]
    public int? WardCode { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập địa chỉ giao hàng.")]
    [StringLength(180, MinimumLength = 5, ErrorMessage = "Nhập địa chỉ cụ thể từ 5 đến 180 ký tự.")]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string PaymentMethod { get; set; } = "COD";

  
    [StringLength(40)]
    public string? VoucherCode { get; set; }

    [Microsoft.AspNetCore.Mvc.ModelBinding.BindNever]
    public string? StudioVoucherCode { get; set; }

    [Microsoft.AspNetCore.Mvc.ModelBinding.BindNever]
    public decimal StudioVoucherPercent { get; set; }

    public decimal SubTotal { get; set; }

    public decimal ShippingFee { get; set; } = 30000;

    public decimal TotalAmount => SubTotal + ShippingFee;

    public List<CartItemViewModel> CartItems { get; set; } = new();
}