
using FashionStore.Data;
using FashionStore.Hubs;
using FashionStore.Models.Entities;
using FashionStore.Repositories.Implementations;
using FashionStore.Repositories.Interfaces;
using FashionStore.Services.Implementations;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;


const string replaceCatalogOption = "--replace-showroom-catalog";
const string importCatalogOption = "--import-showroom-catalog";
var replaceCatalog = args.Contains(replaceCatalogOption, StringComparer.Ordinal);
var importCatalog = args.Contains(importCatalogOption, StringComparer.Ordinal);
var builder = WebApplication.CreateBuilder(args.Where(arg => arg != replaceCatalogOption && arg != importCatalogOption).ToArray());

// MVC
builder.Services.AddControllersWithViews();

builder.Services.AddSignalR();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;

    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Cookie
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;
});

// Session - Giỏ hàng
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(2);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
//Shipper
builder.Services.AddScoped<IShipperService, ShipperService>();
// Repository
builder.Services.AddScoped<IProductRepository, ProductRepository>();

// Services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.Configure<VietQrOptions>(builder.Configuration.GetSection("VietQR"));
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<AdminReportService>();

var app = builder.Build();

if (replaceCatalog || importCatalog)
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    var result = await ShowroomCatalog.ImportAsync(db, replaceLegacy: replaceCatalog);
    Console.WriteLine($"Showroom catalog: {result.Added} products added, {result.Removed} legacy products removed.");
    return;
}

// Khởi tạo dữ liệu mẫu (chỉ gọi một lần)
await SeedData.InitializeAsync(app.Services);

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
// Cấu hình MIME type hỗ trợ file 3D (.glb, .gltf, .bin) và ảnh webp
var contentTypeProvider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
contentTypeProvider.Mappings[".glb"] = "model/gltf-binary";
contentTypeProvider.Mappings[".gltf"] = "model/gltf+json";
contentTypeProvider.Mappings[".bin"] = "application/octet-stream";
contentTypeProvider.Mappings[".webp"] = "image/webp";

app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = contentTypeProvider
});

app.UseRouting();

// Session phải được đặt trước Authentication và Authorization
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}"
);
app.MapHub<ShipmentTrackingHub>("/hubs/shipment-tracking");

app.Run();
