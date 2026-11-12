using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin,Manager,Staff")]
public class AdminSupportRequestsController : Controller
{
    private readonly ApplicationDbContext _context;

    public AdminSupportRequestsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /AdminSupportRequests
    public async Task<IActionResult> Index(SupportRequestStatus? status, string? search)
    {
        var query = _context.SupportRequests
            .Include(s => s.User)
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedAt)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            query = query.Where(s =>
                s.FullName.Contains(search) ||
                s.Email.Contains(search) ||
                s.PhoneNumber.Contains(search) ||
                (s.OrderCode != null && s.OrderCode.Contains(search)) ||
                s.Subject.Contains(search));
        }

        ViewBag.SelectedStatus = status;
        ViewBag.SearchKeyword = search;

        ViewBag.CountPending = await _context.SupportRequests.CountAsync(s => s.Status == SupportRequestStatus.Pending);
        ViewBag.CountInProgress = await _context.SupportRequests.CountAsync(s => s.Status == SupportRequestStatus.InProgress);
        ViewBag.CountResolved = await _context.SupportRequests.CountAsync(s => s.Status == SupportRequestStatus.Resolved);
        ViewBag.CountClosed = await _context.SupportRequests.CountAsync(s => s.Status == SupportRequestStatus.Closed);

        var list = await query.ToListAsync();
        return View(list);
    }

    // GET: /AdminSupportRequests/Details/5
    public async Task<IActionResult> Details(int id)
    {
        var item = await _context.SupportRequests
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        return View(item);
    }

    // POST: /AdminSupportRequests/UpdateStatus/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateStatus(int id, SupportRequestStatus status, string? adminNote)
    {
        var item = await _context.SupportRequests.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        item.Status = status;
        item.AdminNote = adminNote?.Trim();

        if (status == SupportRequestStatus.Resolved || status == SupportRequestStatus.Closed)
        {
            if (!item.ResolvedAt.HasValue)
            {
                item.ResolvedAt = DateTime.UtcNow;
            }
        }
        else
        {
            item.ResolvedAt = null;
        }

        await _context.SaveChangesAsync();
        TempData["SuccessMessage"] = "Đã cập nhật trạng thái yêu cầu hỗ trợ thành công!";

        return RedirectToAction(nameof(Details), new { id });
    }
}
