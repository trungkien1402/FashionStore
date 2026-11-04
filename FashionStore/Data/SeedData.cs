
using FashionStore.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        // 1. Tạo Role
        string[] roles =
        {
            "Admin", "Manager", "Staff", "Shipper", "Customer"
        };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Tạo tài khoản Admin
        const string adminEmail = "admin@fashionstore.local";

        var admin = await userManager.FindByEmailAsync(adminEmail);

        if (admin == null)
        {
            admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Administrator",
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await userManager.CreateAsync(
                admin, "Admin@123456");

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
        else if (!await userManager.IsInRoleAsync(admin, "Admin"))
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }

        // 3. Tạo danh mục
        var categoryData = new[]
        {
            new Category { Name = "Áo thun", Slug = "ao-thun", IsActive = true },
            new Category { Name = "Áo sơ mi", Slug = "ao-so-mi", IsActive = true },
            new Category { Name = "Quần jean", Slug = "quan-jean", IsActive = true },
            new Category { Name = "Quần tây", Slug = "quan-tay", IsActive = true },
            new Category { Name = "Váy", Slug = "vay", IsActive = true },
            new Category { Name = "Đầm", Slug = "dam", IsActive = true },
            new Category { Name = "Áo khoác", Slug = "ao-khoac", IsActive = true },
            new Category { Name = "Phụ kiện", Slug = "phu-kien", IsActive = true }
        };

        foreach (var category in categoryData)
        {
            bool exists = await db.Categories
                .AnyAsync(c => c.Slug == category.Slug);

            if (!exists)
            {
                db.Categories.Add(category);
            }
        }

        await db.SaveChangesAsync();

        // 4. Dữ liệu sản phẩm
        var products = new[]
        {
            new SeedProduct(
                "Áo thun basic nam",
                "ao-thun-basic-nam",
                "Áo thun nam phong cách tối giản, chất liệu cotton mềm mại.",
                199000,
                "ao-thun",
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"),

            new SeedProduct(
                "Áo thun nữ oversize",
                "ao-thun-nu-oversize",
                "Áo thun oversize trẻ trung, dễ phối đồ.",
                219000,
                "ao-thun",
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800"),

            new SeedProduct(
                "Áo sơ mi nam trắng",
                "ao-so-mi-nam-trang",
                "Áo sơ mi trắng thanh lịch dành cho nam.",
                329000,
                "ao-so-mi",
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"),

            new SeedProduct(
                "Áo sơ mi nữ thanh lịch",
                "ao-so-mi-nu-thanh-lich",
                "Áo sơ mi nữ kiểu dáng hiện đại, phù hợp đi làm.",
                299000,
                "ao-so-mi",
                "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800"),

            new SeedProduct(
                "Quần jean nam slim fit",
                "quan-jean-nam-slim-fit",
                "Quần jean nam form slim fit trẻ trung.",
                459000,
                "quan-jean",
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"),

            new SeedProduct(
                "Quần jean nữ ống rộng",
                "quan-jean-nu-ong-rong",
                "Quần jean nữ ống rộng phong cách hiện đại.",
                429000,
                "quan-jean",
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800"),

            new SeedProduct(
                "Quần tây nam công sở",
                "quan-tay-nam-cong-so",
                "Quần tây nam phù hợp môi trường công sở.",
                399000,
                "quan-tay",
                "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800"),

            new SeedProduct(
                "Quần tây nữ ống suông",
                "quan-tay-nu-ong-suong",
                "Quần tây nữ kiểu dáng thanh lịch.",
                379000,
                "quan-tay",
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800"),

            new SeedProduct(
                "Chân váy chữ A",
                "chan-vay-chu-a",
                "Chân váy chữ A trẻ trung, dễ phối trang phục.",
                289000,
                "vay",
                "https://images.unsplash.com/photo-1583496661160-fb5886a13d27?w=800"),

            new SeedProduct(
                "Chân váy dài thanh lịch",
                "chan-vay-dai-thanh-lich",
                "Chân váy dài phong cách nhẹ nhàng.",
                349000,
                "vay",
                "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800"),

            new SeedProduct(
                "Đầm nữ dự tiệc",
                "dam-nu-du-tiec",
                "Đầm nữ thiết kế thanh lịch dành cho các buổi tiệc.",
                599000,
                "dam",
                "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800"),

            new SeedProduct(
                "Đầm nữ dáng dài",
                "dam-nu-dang-dai",
                "Đầm dáng dài phong cách nữ tính.",
                529000,
                "dam",
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"),

            new SeedProduct(
                "Áo khoác denim nam",
                "ao-khoac-denim-nam",
                "Áo khoác denim nam phong cách năng động.",
                649000,
                "ao-khoac",
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"),

            new SeedProduct(
                "Áo khoác nữ cardigan",
                "ao-khoac-nu-cardigan",
                "Cardigan nữ nhẹ nhàng, phù hợp nhiều phong cách.",
                459000,
                "ao-khoac",
                "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800"),

            new SeedProduct(
                "Túi xách nữ basic",
                "tui-xach-nu-basic",
                "Túi xách nữ kiểu dáng tối giản.",
                499000,
                "phu-kien",
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"),

            new SeedProduct(
                "Thắt lưng da nam",
                "that-lung-da-nam",
                "Thắt lưng nam thiết kế đơn giản, dễ phối đồ.",
                259000,
                "phu-kien",
                "https://images.unsplash.com/photo-1624222247344-550fb8f7b2d0?w=800")
        };

        // 5. Thêm sản phẩm nếu chưa tồn tại
        foreach (var item in products)
        {
            bool exists = await db.Products
                .AnyAsync(p => p.Slug == item.Slug);

            if (exists)
                continue;

            var category = await db.Categories
                .FirstOrDefaultAsync(c => c.Slug == item.CategorySlug);

            if (category == null)
                continue;

            db.Products.Add(new Product
            {
                Name = item.Name,
                Slug = item.Slug,
                Description = item.Description,
                Price = item.Price,
                ImageUrl = item.ImageUrl,
                CategoryId = category.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        await db.SaveChangesAsync();

        // 6. Tạo biến thể sản phẩm
        var allProducts = await db.Products.ToListAsync();

        string[] sizes = { "S", "M", "L", "XL" };
        string[] colors = { "Đen", "Trắng" };

        foreach (var product in allProducts)
        {
            bool hasVariants = await db.ProductVariants
                .AnyAsync(v => v.ProductId == product.Id);

            if (hasVariants)
                continue;

            foreach (var size in sizes)
            {
                foreach (var color in colors)
                {
                    db.ProductVariants.Add(new ProductVariant
                    {
                        ProductId = product.Id,
                        SKU = $"{product.Slug.ToUpper()}-{size}-{color}",
                        Size = size,
                        Color = color,
                        Price = product.Price,
                        StockQuantity = 20,
                        IsActive = true
                    });
                }
            }
        }

        await db.SaveChangesAsync();
    }

    private record SeedProduct(
        string Name,
        string Slug,
        string Description,
        decimal Price,
        string CategorySlug,
        string ImageUrl);
}
