namespace FashionStore.Models.ViewModels;

public record PaymentInfoViewModel(
    int OrderId, string OrderCode, decimal Amount, string Currency,
    string BankId, string BankName, string AccountNo, string AccountName,
    string TransferContent, string QrImageUrl, string PaymentStatus,
    bool IsPaid, bool TransferReported, bool CanPay);
