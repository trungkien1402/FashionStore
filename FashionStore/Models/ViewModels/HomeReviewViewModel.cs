namespace FashionStore.Models.ViewModels;

public class HomeReviewViewModel
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string CustomerName { get; set; } = "Khách hàng";
    public string Initials { get; set; } = "KH";
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
