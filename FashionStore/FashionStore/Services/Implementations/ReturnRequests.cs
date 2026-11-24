using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Services.Implementations;

public static class ReturnRequests
{
    public static async Task<(DateTime? Deadline, string Policy, string? IneligibleReason)> GetEligibilityAsync(
        ApplicationDbContext db, Order order)
    {
        var settings = await SalesRules.GetSettingsAsync(db);
        if (order.Status != OrderStatus.Delivered || order.InventoryRestored)
            return (null, settings.ReturnPolicy, "Yêu cầu áp dụng cho đơn đã giao và hàng chưa được hoàn kho.");

        var deliveredAt = await db.OrderStatusHistories.AsNoTracking()
            .Where(h => h.OrderId == order.Id && h.NewStatus == OrderStatus.Delivered)
            .MaxAsync(h => (DateTime?)h.CreatedAt);
        var deadline = deliveredAt?.AddDays(settings.ReturnWindowDays);
        var reason = order.PaymentStatus != PaymentStatus.Paid
            ? "Cần xác nhận đã thanh toán trước khi yêu cầu trả hàng hoàn tiền."
            : deadline == null
                ? "Chưa xác minh được thời điểm giao hàng. Vui lòng liên hệ hỗ trợ."
                : deadline < DateTime.UtcNow ? "Đơn hàng đã quá hạn yêu cầu trả hàng." : null;
        return (deadline, settings.ReturnPolicy, reason);
    }

    public static async Task<string?> SubmitAsync(ApplicationDbContext db, Order order,
        string? actor, string? reason, string? evidence)
    {
        reason = reason?.Trim();
        evidence = evidence?.Trim();
        if (reason is null or { Length: 0 or > 500 } || evidence is { Length: > 500 })
            return "Nhập lý do và mô tả bằng chứng tối đa 500 ký tự mỗi mục.";

        if (await db.MerchandiseReturns.AnyAsync(r => r.OrderId == order.Id))
            return "Đơn này đã có yêu cầu trả hàng.";

        var eligibility = await GetEligibilityAsync(db, order);
        if (eligibility.IneligibleReason != null)
            return eligibility.IneligibleReason;

        db.MerchandiseReturns.Add(new MerchandiseReturn
        {
            OrderId = order.Id,
            Reason = reason,
            Evidence = evidence,
            Events = [new ReturnEvent { State = ReturnState.Requested, ActorId = actor, Note = reason }]
        });
        try
        {
            await db.SaveChangesAsync();
            return null;
        }
        catch (DbUpdateException)
        {
            return "Chưa lưu được yêu cầu. Tải lại trang để kiểm tra yêu cầu đã gửi.";
        }
    }

    public static string Label(ReturnState state) => state switch
    {
        ReturnState.Requested => "Chờ duyệt",
        ReturnState.Approved => "Đã duyệt, chờ nhận hàng",
        ReturnState.Rejected => "Đã từ chối",
        ReturnState.Received => "Đã nhận và kiểm định, chờ hoàn tiền",
        ReturnState.Refunded => "Đã hoàn tiền",
        _ => state.ToString()
    };
}
