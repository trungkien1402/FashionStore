using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

using FashionStore.Data;
using FashionStore.Hubs;
using FashionStore.Models.Entities;
using FashionStore.Repositories.Implementations;
using FashionStore.Repositories.Interfaces;
using FashionStore.Services.Implementations;
using FashionStore.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;


const string replaceCatalogOption = "--replace-showroom-catalog";
const string importCatalogOption = "--import-showroom-catalog";
const string exportCatalogOption = "--export-product-catalog";
var exportCatalog = args.Contains(exportCatalogOption, StringComparer.Ordinal);
var replaceCatalog = args.Contains(replaceCatalogOption, StringComparer.Ordinal);
var importCatalog = args.Contains(importCatalogOption, StringComparer.Ordinal);
var builder = WebApplication.CreateBuilder(args.Where(arg => arg != replaceCatalogOption && arg != importCatalogOption && arg != exportCatalogOption).ToArray());
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
}

// Đảm bảo luôn tìm thấy wwwroot (CSS, JS, 3D models, hình ảnh) dù ứng dụng chạy từ thư mục gốc giải pháp, Visual Studio hay output bin
var candidateWebRoots = new[]
{
    builder.Environment.WebRootPath,
    Path.Combine(builder.Environment.ContentRootPath, "wwwroot"),
    Path.Combine(builder.Environment.ContentRootPath, "FashionStore", "wwwroot"),
    Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "wwwroot")),
    Path.Combine(AppContext.BaseDirectory, "wwwroot")
};
var resolvedWebRoot = candidateWebRoots.FirstOrDefault(p => !string.IsNullOrEmpty(p) && Directory.Exists(p) && File.Exists(Path.Combine(p, "css", "fashionstore.css")));
if (!string.IsNullOrEmpty(resolvedWebRoot))
{
    builder.Environment.WebRootPath = resolvedWebRoot;
    builder.Environment.WebRootFileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(resolvedWebRoot);
}

// MVC
builder.Services.AddControllersWithViews();

builder.Services.AddSignalR();

var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
{
    builder.Services.AddAuthentication().AddGoogle(options =>
    {
        options.ClientId = googleClientId;
        options.ClientSecret = googleClientSecret;
        options.ClaimActions.MapJsonKey("google_email_verified", "email_verified", System.Security.Claims.ClaimValueTypes.Boolean);
        options.ClaimActions.MapJsonKey("google_hosted_domain", "hd");
        options.Events.OnRemoteFailure = context =>
        {
            context.HandleResponse();
            context.Response.Redirect(context.Request.PathBase.Add("/GoogleAccount/Failed").Value!);
            return Task.CompletedTask;
        };
    });
}

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
    options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

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

builder.Services.Configure<DataProtectionTokenProviderOptions>(options => options.TokenLifespan = TimeSpan.FromMinutes(30));
builder.Services.Configure<SecurityStampValidatorOptions>(options => options.ValidationInterval = TimeSpan.FromMinutes(1));
builder.Services.AddScoped<IPasswordRecoveryEmail, PasswordRecoveryEmail>();
builder.Services.AddSingleton<TimeProvider>(TimeProvider.System);
builder.Services.AddSingleton<PasswordRecoveryOtp>();
builder.Services.AddSingleton<PasswordRecoveryEmailQueue>();
builder.Services.AddHostedService<PasswordRecoveryEmailQueue>(sp => sp.GetRequiredService<PasswordRecoveryEmailQueue>());

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
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICartService, CartService>();
//Shipper
builder.Services.AddScoped<IShipperService, ShipperService>();
// Repository
builder.Services.AddScoped<IProductRepository, ProductRepository>();

// Services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.Configure<VietQrOptions>(builder.Configuration.GetSection("VietQR"));
builder.Services.Configure<SePayOptions>(builder.Configuration.GetSection(SePayOptions.Section));
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<AdminReportService>();
builder.Services.AddSingleton<VietnamAddresses>();
builder.Services.AddScoped<IntroPreference>();
builder.Services.AddSingleton<FashionStore.Services.AdminPresenceService>();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, ct) =>
    {
        context.HttpContext.Response.Headers.RetryAfter = "60";
        context.HttpContext.Response.ContentType = "text/plain; charset=utf-8";
        await context.HttpContext.Response.WriteAsync("Bạn đang thao tác quá nhanh, vui lòng thử lại sau 1 phút.", ct);
    };
    foreach (var (name, limit) in new[] { ("login", 5), ("password-recovery", 3), ("password-otp", 10), ("checkout", 10), ("voucher", 20) })
    {
        options.AddPolicy(name, http => RateLimitPartition.GetFixedWindowLimiter(
            http.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = limit, Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0, AutoReplenishment = true
            }));
    }
});

var app = builder.Build();

var productSnapshot = Path.Combine(app.Environment.ContentRootPath, ProductCatalogSnapshot.RelativePath);
if (exportCatalog)
{
    if (!app.Environment.IsDevelopment())
        throw new InvalidOperationException("Product catalog export requires the Development environment.");

    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var count = await ProductCatalogSnapshot.ExportAsync(db, productSnapshot);
    Console.WriteLine($"Exported {count} products to {productSnapshot}");
    return;
}

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
await SeedData.InitializeAsync(app.Services, app.Environment.IsDevelopment() && File.Exists(productSnapshot) ? productSnapshot : null);

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
    app.UseHttpsRedirection();
}

// Cấu hình MIME type hỗ trợ file 3D (.glb, .gltf, .bin) và ảnh webp
var contentTypeProvider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
contentTypeProvider.Mappings[".glb"] = "model/gltf-binary";
contentTypeProvider.Mappings[".gltf"] = "model/gltf+json";
contentTypeProvider.Mappings[".bin"] = "application/octet-stream";
contentTypeProvider.Mappings[".webp"] = "image/webp";

var staticFileOptions = new StaticFileOptions
{
    ContentTypeProvider = contentTypeProvider
};
if (!string.IsNullOrEmpty(resolvedWebRoot) && Directory.Exists(resolvedWebRoot))
{
    staticFileOptions.FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(resolvedWebRoot);
}

app.UseStaticFiles(staticFileOptions);

app.UseRouting();

// Session phải được đặt trước Authentication và Authorization
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}"
);
app.MapHub<ShipmentTrackingHub>("/hubs/shipment-tracking");

app.Run();
