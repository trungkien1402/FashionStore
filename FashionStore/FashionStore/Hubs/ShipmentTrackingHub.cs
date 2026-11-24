
using System.Security.Claims;
using FashionStore.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Hubs;

[Authorize]
public class ShipmentTrackingHub : Hub
{
    private readonly ApplicationDbContext _context;

    public ShipmentTrackingHub(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task JoinShipment(int shipmentId)
    {
        if (shipmentId <= 0)
            throw new HubException("Mã vận đơn không hợp lệ.");

        var userId = Context.User?.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            throw new HubException("Bạn chưa đăng nhập.");

        var isAuthorized = await _context.Shipments
            .AsNoTracking()
            .AnyAsync(s =>
                s.Id == shipmentId &&
                (
                    s.ShipperId == userId ||
                    s.Order.UserId == userId
                ));

        if (!isAuthorized)
            throw new HubException("Bạn không có quyền theo dõi vận đơn này.");

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"shipment_{shipmentId}");
    }

    public async Task LeaveShipment(int shipmentId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            $"shipment_{shipmentId}");
    }
}
