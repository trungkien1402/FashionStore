
using FashionStore.Data;
using FashionStore.Models.Entities;
using FashionStore.Models.Enums;
using FashionStore.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Controllers;

[Authorize(Roles = "Admin,Manager,Staff")]
public class AdminController : Controller
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /Admin
    public async Task<IActionResult> Index()
    {
        var model = new AdminDashboardViewModel();

        // Tổng số sản phẩm
        model.TotalProducts = await _context.Products
            .CountAsync();

        // Tổng số danh mục
        model.TotalCategories = await _context.Categories
            .CountAsync();

        // Tổng số đơn hàng
        model.TotalOrders = await _context.Orders
            .CountAsync();

        // Đơn hàng chờ xác nhận
        model.PendingOrders = await _context.Orders
            .CountAsync(o => o.Status == OrderStatus.PendingConfirmation);

        // Doanh thu: chỉ tính đơn đã giao thành công
        model.TotalRevenue = await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        // 5 đơn hàng mới nhất
        model.RecentOrders = await _context.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .ToListAsync();

        // Top 5 sản phẩm bán chạy trong các đơn đã giao
        model.TopSellingProducts = await _context.OrderItems
            .AsNoTracking()
            .Where(oi => oi.Order.Status == OrderStatus.Delivered)
            .GroupBy(oi => oi.ProductName)
            .Select(group => new TopSellingProductViewModel
            {
                ProductName = group.Key,
                TotalQuantity = group.Sum(oi => oi.Quantity),
                TotalRevenue = group.Sum(oi => oi.UnitPrice * oi.Quantity)
            })
            .OrderByDescending(p => p.TotalQuantity)
            .Take(5)
            .ToListAsync();

        return View(model);
    }
}
