using System.ComponentModel.DataAnnotations;
using FashionStore.Models.Entities;

namespace FashionStore.Models.ViewModels;

public sealed record ProductDetailsViewModel(
    Product Product,
    IReadOnlyList<ProductReview> Reviews,
    int ReviewCount,
    double AverageRating,
    bool HasDeliveredPurchase,
    bool HasReviewed)
{
    public ProductReviewInput Input { get; init; } = new();
    public IReadOnlyDictionary<int, int> RatingBreakdown { get; init; } = new Dictionary<int, int>();
    public IReadOnlyDictionary<string, string> ReviewerNames { get; init; } = new Dictionary<string, string>();
    public IReadOnlyDictionary<string, string> PurchasedSpecs { get; init; } = new Dictionary<string, string>();
}

public sealed class ProductReviewInput
{
    [Display(Name = "Số sao")]
    [Range(1, 5, ErrorMessage = "Vui lòng chọn từ 1 đến 5 sao.")]
    public int Rating { get; set; }

    [Display(Name = "Nội dung đánh giá")]
    [Required(ErrorMessage = "Vui lòng nhập nội dung đánh giá.")]
    [StringLength(1000, ErrorMessage = "Nội dung đánh giá tối đa 1000 ký tự.")]
    public string Comment { get; set; } = string.Empty;
}
