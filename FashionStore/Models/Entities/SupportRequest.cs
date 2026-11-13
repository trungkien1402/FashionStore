using System.ComponentModel.DataAnnotations;
using FashionStore.Models.Enums;

namespace FashionStore.Models.Entities;

public class SupportRequest
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Subject { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? OrderCode { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    public SupportRequestStatus Status { get; set; } = SupportRequestStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }

    [MaxLength(1000)]
    public string? AdminNote { get; set; }

    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
}
