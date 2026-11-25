
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FashionStore.Controllers;

[Authorize(Roles = "Shipper")]
public class ShipperController : Controller
{
    private readonly IShipperService _shipperService;

    public ShipperController(IShipperService shipperService)
    {
        _shipperService = shipperService;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    // GET: /Shipper
    public async Task<IActionResult> Index(ShipmentStatus? status)
    {
        if (string.IsNullOrEmpty(CurrentUserId))
            return Challenge();

        if (status.HasValue &&
            !Enum.IsDefined(typeof(ShipmentStatus), status.Value))
        {
            return BadRequest();
        }

        var shipments = await _shipperService.GetShipmentsAsync(
            CurrentUserId,
            status);

        ViewBag.SelectedStatus = status;

        return View(shipments);
    }

    // GET: /Shipper/Details/5
    public async Task<IActionResult> Details(int id)
    {
        if (string.IsNullOrEmpty(CurrentUserId))
            return Challenge();

        var shipment = await _shipperService.GetShipmentDetailsAsync(
            id,
            CurrentUserId);

        if (shipment == null)
            return NotFound();

        return View(shipment);
    }

    // POST: /Shipper/UpdateStatus
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateStatus(
        int id,
        ShipmentStatus newStatus,
        string? note)
    {
        if (string.IsNullOrEmpty(CurrentUserId))
            return Challenge();

        var result = await _shipperService.UpdateStatusAsync(
            id,
            CurrentUserId,
            newStatus,
            note);

        if (result.NotFound)
            return NotFound();

        TempData[result.Success ? "Success" : "Error"] =
            result.Message;

        return RedirectToAction(nameof(Details), new { id });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateLocation(
    int id,
    [FromForm] ShipmentLocationRequest request)
    {
        if (string.IsNullOrEmpty(CurrentUserId))
            return Challenge();

        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Tọa độ GPS không hợp lệ."
            });
        }

        var result = await _shipperService.UpdateLocationAsync(
            id,
            CurrentUserId,
            request.Latitude,
            request.Longitude,
            request.Accuracy);

        if (result.NotFound)
            return NotFound(new { success = false, result.Message });

        if (!result.Success)
            return BadRequest(new { success = false, result.Message });

        return Ok(new { success = true, result.Message });
    }
}
