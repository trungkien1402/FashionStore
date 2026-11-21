using System.Text.RegularExpressions;
using FashionStore.Data;
using FashionStore.Models.DTOs;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FashionStore.Controllers;

[ApiController]
[Route("api/sepay")]
public class SePayWebhookController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IOptions<SePayOptions> _sePayOptions;
    private readonly ILogger<SePayWebhookController> _logger;

    public SePayWebhookController(
        ApplicationDbContext context,
        IOptions<SePayOptions> sePayOptions,
        ILogger<SePayWebhookController> logger)
    {
        _context = context;
        _sePayOptions = sePayOptions;
        _logger = logger;
    }

    // =========================================================================================
    // [BÀI TOÁN 4: WEBHOOK TỰ ĐỘNG XÁC NHẬN THANH TOÁN QUA CỔNG SEPAY - IDEMPOTENT WEBHOOK]
    // Tình huống: Khách quét mã VietQR chuyển tiền -> Ngân hàng báo SePay -> SePay bắn Webhook về URL này.
    // Các cơ chế xử lý:
    // 1. Bảo mật: Xác thực header "Authorization: Apikey <Secret_Token>".
    // 2. Chống trùng lặp (Idempotency): Nếu SePay gửi lại cùng 1 giao dịch nhiều lần -> Bỏ qua.
    // 3. Phân tích nội dung: Dùng Regex quét mã đơn hàng "FS..." trong tin nhắn chuyển khoản.
    // 4. Kiểm tra số tiền: Đảm bảo số tiền chuyển vào >= tổng tiền cần thanh toán của đơn hàng.
    // 5. Tự động hóa: Đổi trạng thái PaymentStatus sang Paid và OrderStatus sang Confirmed ngay lập tức!
    // =========================================================================================
    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook([FromBody] SePayWebhookDto? dto)
    {
        if (dto == null)
        {
            return BadRequest(new { success = false, message = "Dữ liệu webhook rỗng." });
        }

        // --- 1. XÁC THỰC BẢO MẬT API KEY ---
        var expectedKey = _sePayOptions.Value.ApiKey;
        if (!string.IsNullOrWhiteSpace(expectedKey))
        {
            var authHeader = Request.Headers.Authorization.ToString().Trim();
            var isAuthorized = false;

            if (authHeader.StartsWith("Apikey ", StringComparison.OrdinalIgnoreCase))
            {
                var token = authHeader["Apikey ".Length..].Trim();
                isAuthorized = string.Equals(token, expectedKey, StringComparison.Ordinal);
            }
            else if (string.Equals(authHeader, expectedKey, StringComparison.Ordinal))
            {
                isAuthorized = true;
            }

            if (!isAuthorized)
            {
                _logger.LogWarning("[SePay Webhook] Truy cập trái phép! Header Authorization không khớp: {Header}", authHeader);
                return Unauthorized(new { success = false, message = "Khóa xác thực API Key không hợp lệ." });
            }
        }

        // --- 2. CHỈ XỬ LÝ GIAO DỊCH TIỀN VÀO (transferType == "in") ---
        if (!string.Equals(dto.TransferType, "in", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new { success = true, message = "Bỏ qua giao dịch tiền ra (transferType != 'in')." });
        }

        var rawContent = $"{dto.Content} {dto.Description}".Trim();
        _logger.LogInformation("[SePay Webhook] Nhận biến động số dư: +{Amount}đ | Nội dung: {Content}", dto.TransferAmount, rawContent);

        // --- 3. TRÍCH XUẤT MÃ ĐƠN HÀNG "FS..." TỪ NỘI DUNG CHUYỂN KHOẢN ---
        var orderMatch = Regex.Match(rawContent, @"FS[0-9]{14}[A-Za-z0-9]+", RegexOptions.IgnoreCase);
        string? targetOrderCode = orderMatch.Success ? orderMatch.Value : null;

        Order? order = null;
        if (!string.IsNullOrEmpty(targetOrderCode))
        {
            order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.OrderCode.ToUpper() == targetOrderCode.ToUpper());
        }

        // Dự phòng tìm kiếm nếu ngân hàng cắt bớt chuỗi
        if (order == null && !string.IsNullOrWhiteSpace(dto.Content))
        {
            var orders = await _context.Orders
                .Where(o => o.PaymentMethod == PaymentMethod.VietQR && o.PaymentStatus == PaymentStatus.Pending)
                .OrderByDescending(o => o.CreatedAt)
                .Take(20)
                .ToListAsync();

            order = orders.FirstOrDefault(o => rawContent.Contains(o.OrderCode, StringComparison.OrdinalIgnoreCase));
        }

        if (order == null)
        {
            _logger.LogWarning("[SePay Webhook] Không tìm thấy đơn hàng tương ứng với nội dung: {Content}", rawContent);
            return NotFound(new { success = false, message = "Không tìm thấy đơn hàng khớp với nội dung chuyển khoản." });
        }

        // --- 4. TÍNH LŨY ĐẲNG (IDEMPOTENCY): NẾU ĐƠN ĐÃ THANH TOÁN RỒI THÌ BỎ QUA ---
        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            return Ok(new { success = true, message = "Đơn hàng này đã được ghi nhận thanh toán trước đó (Idempotent)." });
        }

        // Nếu đơn hàng đã bị hủy (ví dụ quá 15 phút)
        if (order.Status == OrderStatus.Cancelled)
        {
            _logger.LogWarning("[SePay Webhook] Đơn hàng {Code} đã bị hủy nhưng nhận được tiền. Cần đối soát hoàn tiền!", order.OrderCode);
            return Conflict(new { success = false, message = $"Đơn hàng {order.OrderCode} đã bị hủy trước khi nhận được tiền. Cần hỗ trợ hoàn tiền." });
        }

        // --- 5. KIỂM TRA SỐ TIỀN CHUYỂN KHOẢN ---
        if (dto.TransferAmount < order.TotalAmount)
        {
            _logger.LogWarning("[SePay Webhook] Số tiền chuyển ({Received}đ) nhỏ hơn tổng đơn hàng ({Expected}đ)", dto.TransferAmount, order.TotalAmount);
            return BadRequest(new
            {
                success = false,
                message = $"Số tiền chuyển ({dto.TransferAmount:N0}đ) chưa đủ so với giá trị đơn hàng ({order.TotalAmount:N0}đ)."
            });
        }

        // --- 6. CẬP NHẬT TRẠNG THÁI TỰ ĐỘNG THÀNH CÔNG ---
        var oldPaymentStatus = order.PaymentStatus;
        var oldOrderStatus = order.Status;

        order.PaymentStatus = PaymentStatus.Paid;
        order.TransferReportedAt ??= DateTime.UtcNow;

        if (order.Status == OrderStatus.PendingConfirmation)
        {
            order.Status = OrderStatus.Confirmed; // Tự động xác nhận đơn vì đã thanh toán 100%
        }

        // Ghi nhật ký thanh toán
        _context.PaymentHistories.Add(new PaymentHistory
        {
            OrderId = order.Id,
            Event = "SePayWebhookPaid",
            OldStatus = oldPaymentStatus,
            NewStatus = PaymentStatus.Paid,
            Amount = dto.TransferAmount,
            ActorUserId = order.UserId
        });

        // Ghi lịch sử trạng thái đơn hàng
        _context.OrderStatusHistories.Add(new OrderStatusHistory
        {
            OrderId = order.Id,
            OldStatus = oldOrderStatus,
            NewStatus = order.Status,
            ChangedByUserId = order.UserId,
            Note = $"Tự động duyệt thanh toán qua SePay Webhook (Giao dịch #{dto.Id} - Ngân hàng {dto.Gateway} - Mã GD: {dto.ReferenceCode}).",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        _logger.LogInformation("[SePay Webhook] Đơn hàng {Code} đã được TỰ ĐỘNG duyệt thanh toán thành công!", order.OrderCode);

        return Ok(new
        {
            success = true,
            message = "Tự động xác nhận thanh toán đơn hàng thành công!",
            orderId = order.Id,
            orderCode = order.OrderCode,
            amount = dto.TransferAmount
        });
    }

    // =========================================================================================
    // ENDPOINT GIẢ LẬP TEST TRÊN LOCALHOST (Sandbox Simulation)
    // Giúp bạn và Giảng viên test tính năng Webhook trực tiếp mà không cần chuyển tiền thật!
    // =========================================================================================
    [HttpPost("simulate")]
    public async Task<IActionResult> SimulatePayment([FromQuery] string orderCode)
    {
        if (string.IsNullOrWhiteSpace(orderCode))
            return BadRequest(new { success = false, message = "Vui lòng nhập mã đơn hàng (orderCode)." });

        var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderCode.ToUpper() == orderCode.Trim().ToUpper());
        if (order == null)
            return NotFound(new { success = false, message = $"Không tìm thấy đơn hàng mã {orderCode}." });

        var fakeDto = new SePayWebhookDto
        {
            Id = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Gateway = "MBBank",
            TransactionDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            AccountNumber = _sePayOptions.Value.AccountNumber,
            Content = $"Chuyen tien thanh toan don hang {order.OrderCode}",
            TransferType = "in",
            TransferAmount = order.TotalAmount,
            ReferenceCode = $"MB{Random.Shared.Next(100000, 999999)}"
        };

        Request.Headers.Authorization = $"Apikey {_sePayOptions.Value.ApiKey}";
        return await HandleWebhook(fakeDto);
    }
}
