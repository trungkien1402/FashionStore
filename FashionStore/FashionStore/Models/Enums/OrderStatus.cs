namespace FashionStore.Models.Enums;

public enum OrderStatus
{
    PendingConfirmation = 0,
    Confirmed = 1,
    Processing = 2,
    Shipping = 3,
    Delivered = 4,
    Cancelled = 5,
    DeliveryFailed = 6,
    Returned = 7
}