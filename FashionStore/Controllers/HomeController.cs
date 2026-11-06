
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FashionStore.Controllers;

public class HomeController : Controller
{
    private readonly IProductService _productService;

    public HomeController(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<IActionResult> Index()
    {
        var products = await _productService.GetAllProductsAsync();

        // Chỉ hiển thị sản phẩm đang kinh doanh
        var latestProducts = products
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Take(8)
            .ToList();

        return View(latestProducts);
    }
}
