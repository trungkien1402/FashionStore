namespace FashionStore.Models.ViewModels;

using FashionStore.Models.Entities;

public record CustomerReturnViewModel(Order Order, MerchandiseReturn? Request,
    DateTime? Deadline, string Policy, string? IneligibleReason);
