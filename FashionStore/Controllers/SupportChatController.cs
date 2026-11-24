using System.Data;
using System.Security.Claims;
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize]
[AutoValidateAntiforgeryToken]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class SupportChatController(ApplicationDbContext db, AdminPresenceService presence) : Controller
{
    private string Actor => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // ── Trạng thái admin thực tế ──────────────────────────────────────────────

    /// <summary>Endpoint PUBLIC – SSE stream push realtime trạng thái admin trực tiếp tới khách hàng không cần reload.</summary>
    [AllowAnonymous, HttpGet, IgnoreAntiforgeryToken]
    [ResponseCache(Duration = 0, NoStore = true)]
    public async Task PresenceStream(CancellationToken ct)
    {
        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";

        var channel = System.Threading.Channels.Channel.CreateUnbounded<bool>();
        void Handler(bool isOnline) => channel.Writer.TryWrite(isOnline);

        presence.OnPresenceChanged += Handler;
        try
        {
            var initial = presence.IsAnyAdminOnline();
            await Response.WriteAsync($"data: {{\"online\": {initial.ToString().ToLowerInvariant()}}}\n\n", ct);
            await Response.Body.FlushAsync(ct);

            while (!ct.IsCancellationRequested)
            {
                using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                timeoutCts.CancelAfter(TimeSpan.FromSeconds(15));
                try
                {
                    var isOnline = await channel.Reader.ReadAsync(timeoutCts.Token);
                    await Response.WriteAsync($"data: {{\"online\": {isOnline.ToString().ToLowerInvariant()}}}\n\n", ct);
                    await Response.Body.FlushAsync(ct);
                }
                catch (OperationCanceledException) when (!ct.IsCancellationRequested)
                {
                    await Response.WriteAsync(": keepalive\n\n", ct);
                    await Response.Body.FlushAsync(ct);
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Client closed connection
        }
        finally
        {
            presence.OnPresenceChanged -= Handler;
        }
    }

    /// <summary>Endpoint PUBLIC – fallback polling kiểm tra admin online.</summary>
    [AllowAnonymous, HttpGet, IgnoreAntiforgeryToken]
    [ResponseCache(Duration = 0, NoStore = true)]
    public IActionResult AdminOnline() =>
        Json(new { online = presence.IsAnyAdminOnline() });

    /// <summary>Endpoint PRIVATE – admin/staff gửi heartbeat khi đang tương tác tích cực.</summary>
    [AcceptVerbs("GET", "POST"), Authorize(Roles = AccessRoles.BackOffice), IgnoreAntiforgeryToken]
    public IActionResult Heartbeat()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;
        presence.Heartbeat(userId);
        return Ok();
    }

    /// <summary>Endpoint PRIVATE – admin/staff chuyển sang vắng mặt (khi không lăn chuột 20s hoặc ẩn tab).</summary>
    [AcceptVerbs("GET", "POST"), Authorize(Roles = AccessRoles.BackOffice), IgnoreAntiforgeryToken]
    public IActionResult AdminAway()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;
        presence.Remove(userId);
        return Ok();
    }

    [HttpGet, Authorize(Roles = AccessRoles.BackOffice)]
    public IActionResult Inbox() => View();

    [HttpGet, Authorize(Roles = AccessRoles.BackOffice)]
    public async Task<IActionResult> Queue(CancellationToken ct) =>
        Json(await db.SupportConversations.AsNoTracking()
            .OrderBy(c => c.IsClosed).ThenByDescending(c => c.NeedsReply)
            .ThenByDescending(c => c.UpdatedAt).ThenByDescending(c => c.Id).Take(100)
            .Select(c => new { c.Id, Name = c.Customer.FullName, c.IsClosed, c.NeedsReply })
            .ToListAsync(ct));

    [HttpGet]
    [Authorize(Roles = "Customer," + AccessRoles.BackOffice)]
    public async Task<IActionResult> Thread(int? id, long before = 0, CancellationToken ct = default)
    {
        if (!ModelState.IsValid) return BadRequest();
        if (id.HasValue && !AccessRoles.CanUseBackOffice(User)) return Forbid();
        if (!id.HasValue && !User.IsInRole("Customer")) return Forbid();
        var conversation = await db.SupportConversations.AsNoTracking()
            .Where(c => id.HasValue ? c.Id == id : c.CustomerId == Actor)
            .Select(c => new { c.Id, c.IsClosed }).SingleOrDefaultAsync(ct);

        if (conversation == null)
            return id.HasValue ? NotFound() : Json(new { isClosed = false, messages = Array.Empty<object>(), hasOlder = false });

        var messages = await db.SupportChatMessages.AsNoTracking()
            .Where(m => m.ConversationId == conversation.Id && (before == 0 || m.Id < before))
            .OrderByDescending(m => m.Id).Take(51)
            .Select(m => new { m.Id, m.FromStaff, m.Text, CreatedAt = DateTime.SpecifyKind(m.CreatedAt, DateTimeKind.Utc) })
            .ToListAsync(ct);
        return Json(new { conversation.IsClosed, messages = messages.Take(50).Reverse(), hasOlder = messages.Count > 50 });
    }

    [HttpPost, Authorize(Roles = "Customer")]
    public Task<IActionResult> Send(string? message, CancellationToken ct) => WriteAsync(null, message, false, ct);

    [HttpPost, Authorize(Roles = AccessRoles.BackOffice)]
    public Task<IActionResult> Reply(int id, string? message, CancellationToken ct) => WriteAsync(id, message, false, ct);

    [HttpPost, Authorize(Roles = AccessRoles.BackOffice)]
    public Task<IActionResult> Close(int id, CancellationToken ct) => WriteAsync(id, null, true, ct);

    private async Task<IActionResult> WriteAsync(int? id, string? message, bool close, CancellationToken ct)
    {
        message = message?.Trim();
        if (!ModelState.IsValid || (!close && message is (null or { Length: 0 or > 1000 })))
            return BadRequest("Nhập tin nhắn từ 1 đến 1.000 ký tự.");

        try
        {
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);
            var conversations = id.HasValue
                ? db.SupportConversations.FromSqlInterpolated($"SELECT * FROM [SupportConversations] WITH (UPDLOCK, HOLDLOCK) WHERE [Id] = {id.Value}")
                : db.SupportConversations.FromSqlInterpolated($"SELECT * FROM [SupportConversations] WITH (UPDLOCK, HOLDLOCK) WHERE [CustomerId] = {Actor}");
            var conversation = await conversations.SingleOrDefaultAsync(ct);
            if (id.HasValue && conversation == null) return NotFound();
            if (id.HasValue && conversation!.IsClosed)
                return close ? Ok() : Conflict("Cuộc trò chuyện đã đóng. Khách có thể mở lại bằng tin nhắn mới.");

            var now = DateTime.UtcNow;
            if (conversation == null)
            {
                conversation = new SupportConversation { CustomerId = Actor };
                db.SupportConversations.Add(conversation);
            }
            if (!id.HasValue && conversation.Id != 0 && await db.SupportChatMessages.CountAsync(m =>
                m.ConversationId == conversation.Id && !m.FromStaff && m.CreatedAt >= now.AddMinutes(-1), ct) >= 10)
                return StatusCode(429, "Bạn gửi tin nhắn quá nhanh. Vui lòng thử lại sau ít phút.");

            conversation.IsClosed = close;
            conversation.NeedsReply = !id.HasValue;
            conversation.UpdatedAt = now;
            if (!close)
                db.SupportChatMessages.Add(new SupportChatMessage
                {
                    Conversation = conversation, AuthorId = Actor, FromStaff = id.HasValue,
                    Text = message!, CreatedAt = now
                });
            await db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            return Ok();
        }
        catch (Exception error) when (error.GetBaseException() is Microsoft.Data.SqlClient.SqlException { Number: 1205 or 1222 })
        {
            return StatusCode(503, "Hộp thư đang bận. Vui lòng thử gửi lại.");
        }
    }
}
