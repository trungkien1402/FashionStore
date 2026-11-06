using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;

namespace FashionStore.Services.Interfaces;

public record PaymentResult(bool Success, string Message, bool Duplicate = false);

public interface IPaymentService
{
    bool IsVietQrReady { get; }
    PaymentInfoViewModel GetPaymentInfo(Order order);
    Task<PaymentResult> ReportTransferAsync(int orderId, string userId);
    Task<PaymentResult> UpdateStatusAsync(int orderId, PaymentStatus status, string actorUserId);
}
