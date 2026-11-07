using FashionStore.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace FashionStore.Models.ViewModels;

public class CheckoutViewModel
{
    [Required(ErrorMessage = "Vui lòng nhập tên người nhận.")]
    [StringLength(100)]
    public string ReceiverName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại.")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập địa chỉ giao hàng.")]
    [StringLength(300)]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string PaymentMethod { get; set; } = "COD";

  
    public decimal SubTotal { get; set; }

    public decimal ShippingFee { get; set; } = 30000;

    public decimal TotalAmount => SubTotal + ShippingFee;

    public List<CartItemViewModel> CartItems { get; set; } = new();
}