using FashionStore.Services;
using FashionStore.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FashionStore.Controllers;

[Authorize(Roles = AccessRoles.BackOffice)]
public class AdminController(AdminReportService reports, ILogger<AdminController> logger) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(DateTime? startDate, DateTime? endDate)
    {
        var (start, end) = GetRange(startDate, endDate);
        if (!ModelState.IsValid || !AdminReportService.IsValidRange(start, end))
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            return View("InvalidRange");
        }

        return View(await reports.GetAsync(start, end));
    }

    [HttpGet]
    public async Task<IActionResult> PrintReport(DateTime? startDate, DateTime? endDate)
    {
        var (start, end) = GetRange(startDate, endDate);
        if (!ModelState.IsValid || !AdminReportService.IsValidRange(start, end))
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            return View("InvalidRange");
        }

        logger.LogInformation("Admin report print requested by {User} for {Start}–{End}",
            User.Identity?.Name, start, end);
        return View(await reports.GetAsync(start, end));
    }

    [HttpGet]
    public async Task<IActionResult> ExportReport(DateTime? startDate, DateTime? endDate)
    {
        var (start, end) = GetRange(startDate, endDate);
        if (!ModelState.IsValid || !AdminReportService.IsValidRange(start, end))
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            return View("InvalidRange");
        }

        var report = await reports.GetAsync(start, end);
        var file = AdminReportPdf.Create(report);
        logger.LogInformation("Admin report exported by {User} for {Start}–{End}",
            User.Identity?.Name, start, end);
        return File(file, "application/pdf",
            $"FashionStore_Report_{start:yyyyMMdd}_{end:yyyyMMdd}.pdf");
    }

    private static (DateTime Start, DateTime End) GetRange(DateTime? start, DateTime? end)
    {
        var today = AdminReportService.Today;
        return (start?.Date ?? today.AddDays(-6), end?.Date ?? today);
    }
}
