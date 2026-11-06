using System.Globalization;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FashionStore.Services.Implementations;

public class PaymentService(ApplicationDbContext db, IOptions<VietQrOptions> options) : IPaymentService
{
    public bool IsVietQrReady => options.Value.IsReady;

    public PaymentInfoViewModel GetPaymentInfo(Order order)
    {
        if (!IsVietQrReady)
            throw new InvalidOperationException("Chưa cấu hình tài khoản nhận thanh toán VietQR.");
        if (order.PaymentMethod != PaymentMethod.VietQR)
            throw new InvalidOperationException("Đơn hàng không thanh toán bằng VietQR.");
        if (order.TotalAmount <= 0 || order.TotalAmount > 9999999999999m ||
            decimal.Truncate(order.TotalAmount) != order.TotalAmount)
            throw new InvalidOperationException("Số tiền VietQR phải là số nguyên VND hợp lệ.");

        var bank = options.Value;
        var canPay = order.PaymentStatus == PaymentStatus.Pending &&
            order.Status is not (OrderStatus.Cancelled or OrderStatus.Returned or OrderStatus.DeliveryFailed);
        var amount = order.TotalAmount.ToString("0", CultureInfo.InvariantCulture);
        var qrUrl = canPay
            ? $"https://img.vietqr.io/image/{bank.BankId}-{bank.AccountNo}-{bank.Template}.svg" +
              $"?amount={amount}&addInfo={Uri.EscapeDataString(order.OrderCode)}" +
              $"&accountName={Uri.EscapeDataString(bank.AccountName)}"
            : string.Empty;
        return new(order.Id, order.OrderCode, order.TotalAmount, "VND", bank.BankId,
            bank.BankName, bank.AccountNo, bank.AccountName, order.OrderCode, qrUrl,
            order.PaymentStatus.ToString(), order.PaymentStatus == PaymentStatus.Paid,
            order.TransferReportedAt.HasValue, canPay);
    }

    public async Task<PaymentResult> ReportTransferAsync(int orderId, string userId)
    {
        var order = await db.Orders.SingleOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);
        if (order == null) return new(false, "Không tìm thấy đơn hàng.");
        if (order.PaymentMethod != PaymentMethod.VietQR || order.PaymentStatus != PaymentStatus.Pending ||
            order.Status is OrderStatus.Cancelled or OrderStatus.Returned or OrderStatus.DeliveryFailed)
            return new(false, "Đơn hàng không còn nhận thông báo chuyển khoản.");
        if (order.TransferReportedAt.HasValue)
            return new(true, "Cửa hàng đã nhận thông báo trước đó.", true);

        order.TransferReportedAt = DateTime.UtcNow;
        db.PaymentHistories.Add(new PaymentHistory
        {
            OrderId = order.Id, Event = "TransferReported", Amount = order.TotalAmount,
            OldStatus = order.PaymentStatus, NewStatus = order.PaymentStatus, ActorUserId = userId
        });
        try
        {
            // Status remains Pending. RowVersion prevents duplicate concurrent reports.
            await db.SaveChangesAsync();
            return new(true, "Đã thông báo cho cửa hàng. Vui lòng chờ xác nhận thanh toán.");
        }
        catch (DbUpdateConcurrencyException)
        {
            db.ChangeTracker.Clear();
            var current = await db.Orders.AsNoTracking().SingleAsync(o => o.Id == orderId);
            return current.TransferReportedAt.HasValue
                ? new(true, "Cửa hàng đã nhận thông báo trước đó.", true)
                : new(false, "Đơn hàng vừa thay đổi. Vui lòng tải lại.");
        }
    }

    public async Task<PaymentResult> UpdateStatusAsync(int orderId, PaymentStatus status, string actorUserId)
    {
        if (!Enum.IsDefined(status)) return new(false, "Trạng thái thanh toán không hợp lệ.");
        var order = await db.Orders.SingleOrDefaultAsync(o => o.Id == orderId);
        if (order == null) return new(false, "Không tìm thấy đơn hàng.");
        var old = order.PaymentStatus;
        if (old == status) return new(true, "Trạng thái đã được ghi nhận trước đó.", true);

        var allowed = status switch
        {
            PaymentStatus.Paid => old is PaymentStatus.Pending or PaymentStatus.Failed &&
                order.Status is not (OrderStatus.Cancelled or OrderStatus.Returned or OrderStatus.DeliveryFailed),
            PaymentStatus.Failed => old == PaymentStatus.Pending,
            PaymentStatus.Refunded => old == PaymentStatus.Paid &&
                order.Status is OrderStatus.Cancelled or OrderStatus.Returned or OrderStatus.DeliveryFailed,
            _ => false
        };
        if (!allowed) return new(false, "Không thể cập nhật trạng thái thanh toán này cho đơn hàng.");

        order.PaymentStatus = status;
        db.PaymentHistories.Add(new PaymentHistory
        {
            OrderId = order.Id, Event = "StatusChanged", OldStatus = old, NewStatus = status,
            Amount = order.TotalAmount, ActorUserId = actorUserId
        });
        try
        {
            // EF saves the status and audit record in the same database transaction.
            await db.SaveChangesAsync();
            return new(true, "Cập nhật trạng thái thanh toán thành công.");
        }
        catch (DbUpdateConcurrencyException)
        {
            db.ChangeTracker.Clear();
            return new(false, "Đơn hàng vừa được cập nhật bởi yêu cầu khác. Vui lòng tải lại.");
        }
    }
}
