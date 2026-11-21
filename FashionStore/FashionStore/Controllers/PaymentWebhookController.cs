using System.Text.RegularExpressions;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentWebhookController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PaymentWebhookController> _logger;

    public PaymentWebhookController(ApplicationDbContext context, ILogger<PaymentWebhookController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Nhận Webhook thông báo chuyển khoản tự động từ cổng VietQR / SePay / PayOS / Ngân hàng.
    /// Khớp mã đơn hàng (OrderCode), kiểm tra số tiền, chống ghi nhận trùng và cập nhật trạng thái Paid.
    /// </summary>
    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook([FromBody] PaymentWebhookPayload payload)
    {
        _logger.LogInformation("Nhận webhook thanh toán: Mã={Code}, Tiền={Amount}, Nội dung={Content}, Ref={Ref}",
            payload.OrderCode, payload.Amount, payload.Content, payload.Reference);

        // Tìm kiếm mã đơn hàng từ thuộc tính trực tiếp hoặc tách từ nội dung chuyển khoản
        var targetCode = payload.OrderCode?.Trim().ToUpperInvariant();
        if (string.IsNullOrEmpty(targetCode) && !string.IsNullOrEmpty(payload.Content))
        {
            var match = Regex.Match(payload.Content, @"FS\d{14}[A-Z0-9]{12}", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                targetCode = match.Value.ToUpperInvariant();
            }
        }

        if (string.IsNullOrEmpty(targetCode) && !payload.OrderId.HasValue)
        {
            return BadRequest(new { success = false, message = "Không xác định được mã đơn hàng (OrderCode)." });
        }

        var order = await _context.Orders
            .FirstOrDefaultAsync(o => (targetCode != null && o.OrderCode == targetCode) ||
                                      (payload.OrderId.HasValue && o.Id == payload.OrderId.Value));

        if (order == null)
        {
            _logger.LogWarning("Webhook: Không tìm thấy đơn hàng tương ứng với mã {Code}", targetCode);
            return NotFound(new { success = false, message = "Không tìm thấy đơn hàng tương ứng." });
        }

        // Kiểm tra tính Idempotent: Nếu đơn đã được xác nhận thanh toán trước đó
        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            return Ok(new
            {
                success = true,
                message = "Đơn hàng đã được thanh toán thành công trước đó (Idempotent).",
                orderCode = order.OrderCode
            });
        }

        // Không thanh toán cho đơn đã bị hủy hoặc hoàn trả
        if (order.Status is OrderStatus.Cancelled or OrderStatus.Returned or OrderStatus.DeliveryFailed)
        {
            _logger.LogWarning("Webhook: Đơn {Code} đã ở trạng thái {Status}, từ chối ghi nhận Paid.",
                order.OrderCode, order.Status);
            return BadRequest(new
            {
                success = false,
                message = $"Đơn hàng đã ở trạng thái {order.Status}, không thể nhận thanh toán."
            });
        }

        // Kiểm tra số tiền chuyển so với tổng tiền đơn hàng
        var transferAmount = payload.Amount > 0 ? payload.Amount : payload.TransferAmount;
        if (transferAmount < order.TotalAmount)
        {
            _logger.LogWarning("Webhook: Số tiền thanh toán {Paid} nhỏ hơn tổng đơn {Total} của đơn {Code}",
                transferAmount, order.TotalAmount, order.OrderCode);

            _context.PaymentHistories.Add(new PaymentHistory
            {
                OrderId = order.Id,
                Event = "WebhookUnderpayment",
                Amount = transferAmount,
                OldStatus = order.PaymentStatus,
                NewStatus = order.PaymentStatus,
                ActorUserId = null
            });
            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status422UnprocessableEntity, new
            {
                success = false,
                message = $"Số tiền thanh toán ({transferAmount:N0} đ) nhỏ hơn tổng đơn ({order.TotalAmount:N0} đ). Cần nhân viên kiểm tra."
            });
        }

        // Xác nhận thanh toán thành công
        var oldPaymentStatus = order.PaymentStatus;
        order.PaymentStatus = PaymentStatus.Paid;
        order.TransferReportedAt ??= DateTime.UtcNow;

        // Nếu đơn hàng đang chờ xác nhận, tự động xác nhận đơn
        if (order.Status == OrderStatus.PendingConfirmation)
        {
            order.Status = OrderStatus.Confirmed;
            _context.OrderStatusHistories.Add(new OrderStatusHistory
            {
                OrderId = order.Id,
                OldStatus = OrderStatus.PendingConfirmation,
                NewStatus = OrderStatus.Confirmed,
                ChangedByUserId = null,
                Note = "Hệ thống tự động xác nhận đơn sau khi nhận tiền chuyển khoản qua Webhook.",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Ghi lại lịch sử thanh toán
        _context.PaymentHistories.Add(new PaymentHistory
        {
            OrderId = order.Id,
            Event = "WebhookPaymentReceived",
            Amount = transferAmount,
            OldStatus = oldPaymentStatus,
            NewStatus = PaymentStatus.Paid,
            ActorUserId = null
        });

        SalesRules.Audit(_context, null, "WebhookPaymentPaid", order.OrderCode,
            $"Số tiền {transferAmount:N0} ₫; Mã giao dịch {payload.Reference ?? "N/A"}");

        await _context.SaveChangesAsync();

        _logger.LogInformation("Webhook thành công: Đơn {Code} đã được cập nhật sang Paid.", order.OrderCode);

        return Ok(new
        {
            success = true,
            message = "Xác nhận thanh toán thành công qua Webhook.",
            orderCode = order.OrderCode,
            amount = transferAmount
        });
    }

    /// <summary>
    /// Endpoint hỗ trợ thử nghiệm mô phỏng Webhook chuyển khoản ngân hàng thành công.
    /// </summary>
    [HttpPost("simulate")]
    public async Task<IActionResult> SimulatePayment([FromBody] SimulatePaymentRequest request)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.OrderCode == request.OrderCode || (request.OrderId.HasValue && o.Id == request.OrderId.Value));

        if (order == null)
            return NotFound(new { success = false, message = "Không tìm thấy đơn hàng." });

        var payload = new PaymentWebhookPayload
        {
            OrderId = order.Id,
            OrderCode = order.OrderCode,
            Amount = request.Amount > 0 ? request.Amount : order.TotalAmount,
            Content = $"Chuyen khoan don hang {order.OrderCode}",
            Reference = $"SIM_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}"[..20]
        };

        return await HandleWebhook(payload);
    }
}

public class PaymentWebhookPayload
{
    public int? OrderId { get; set; }
    public string? OrderCode { get; set; }
    public decimal Amount { get; set; }
    public decimal TransferAmount { get; set; }
    public string? Content { get; set; }
    public string? Reference { get; set; }
    public string? Signature { get; set; }
}

public class SimulatePaymentRequest
{
    public int? OrderId { get; set; }
    public string? OrderCode { get; set; }
    public decimal Amount { get; set; }
}
