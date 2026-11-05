using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FashionStore.Models.ViewModels;

public class CreateShipmentViewModel
{
    public int OrderId { get; set; }

    public string OrderCode { get; set; } = string.Empty;

    public string ReceiverName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public decimal CODAmount { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng chọn Shipper đảm nhận đơn hàng.")]
    [Display(Name = "Shipper phụ trách")]
    public string ShipperId { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự.")]
    [Display(Name = "Ghi chú giao hàng")]
    public string? Note { get; set; }

    public List<SelectListItem> AvailableShippers { get; set; } = new();
}
