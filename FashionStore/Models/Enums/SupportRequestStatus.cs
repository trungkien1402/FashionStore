namespace FashionStore.Models.Enums;

public enum SupportRequestStatus
{
    Pending = 0,    // Chờ xử lý
    InProgress = 1, // Đang xử lý
    Resolved = 2,   // Đã giải quyết
    Closed = 3      // Đã đóng
}
