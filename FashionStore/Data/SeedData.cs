using FashionStore.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FashionStore.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await db.Database.MigrateAsync();

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // 1. Tạo Roles
        string[] roles = { "Admin", "Manager", "Staff", "Shipper", "Customer" };
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
            var result = await userManager.CreateAsync(admin, "Admin@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
        else if (!await userManager.IsInRoleAsync(admin, "Admin"))
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }

        // 2b. Tạo tài khoản Shipper
        const string shipperEmail = "shipper@fashionstore.local";
        var shipper = await userManager.FindByEmailAsync(shipperEmail);
        if (shipper == null)
        {
            shipper = new ApplicationUser
            {
                UserName = shipperEmail,
                Email = shipperEmail,
                FullName = "Nguyễn Văn Giao (Shipper)",
                PhoneNumber = "0988776655",
                EmailConfirmed = true,
                IsActive = true
            };
            var result = await userManager.CreateAsync(shipper, "Shipper@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(shipper, "Shipper");
            }
        }
        else if (!await userManager.IsInRoleAsync(shipper, "Shipper"))
        {
            await userManager.AddToRoleAsync(shipper, "Shipper");
        }

        // Nếu đã có dữ liệu sản phẩm trong DB, bỏ qua bước khởi tạo lại
        if (await db.Products.AnyAsync())
        {
            return;
        }

        // ==============================================================
        // 3. CLEAN RESET: XÓA SẠCH DỮ LIỆU CŨ THEO YÊU CẦU NGƯỜI DÙNG
        // ==============================================================
        try
        {
            db.ShipmentHistories.RemoveRange(db.ShipmentHistories);
            db.Shipments.RemoveRange(db.Shipments);
            db.OrderStatusHistories.RemoveRange(db.OrderStatusHistories);
            db.OrderItems.RemoveRange(db.OrderItems);
            db.Orders.RemoveRange(db.Orders);
            db.ProductVariants.RemoveRange(db.ProductVariants);
            db.Products.RemoveRange(db.Products);
            db.Categories.RemoveRange(db.Categories);
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SeedData Clean Error]: {ex.Message}");
        }

        // ==============================================================
        // 4. TẠO 5 DANH MỤC STREETWEAR & SNEAKER CHUẨN GU
        // ==============================================================
        var categoryData = new[]
        {
            new Category { Name = "Áo Thun & Graphic Tees", Slug = "ao-thun-streetwear", IsActive = true },
            new Category { Name = "Hoodies & Sweaters", Slug = "hoodie-sweater", IsActive = true },
            new Category { Name = "Áo Khoác & Outerwear", Slug = "ao-khoac-varsity", IsActive = true },
            new Category { Name = "Quần Streetwear & Cargo", Slug = "quan-baggy-cargo", IsActive = true },
            new Category { Name = "Sneakers & Streetwear Shoes", Slug = "giay-sneaker-streetwear", IsActive = true }
        };

        db.Categories.AddRange(categoryData);
        await db.SaveChangesAsync();

        // ==============================================================
        // 5. SEED SẢN PHẨM: 10 MẪU QUẦN ÁO + 10 MẪU GIÀY CẮT NỀN SÁT 100%
        // ==============================================================
        var products = new[]
        {
            // --- 10 MẪU QUẦN ÁO STREETWEAR (CẮT NỀN TRONG SUỐT CHO SÀO TREO 3D) ---
            new SeedProduct(
                "Heavyweight Boxy Hoodie Ash Grey",
                "heavyweight-boxy-hoodie-ash-grey",
                "Áo hoodie nỉ bông 400gsm form boxy rộng rãi, mũ trùm 2 lớp đứng phom chuẩn streetwear đường phố.",
                550000,
                "hoodie-sweater",
                "/images/products/clothes/heavyweight-boxy-hoodie.png"),

            new SeedProduct(
                "Vintage Washed Boxy Tee Charcoal",
                "vintage-washed-boxy-tee-charcoal",
                "Áo thun wash loang màu xám khói vintage hoài niệm, cotton 100% 260gsm dày dặn, bo cổ dệt chống giãn.",
                320000,
                "ao-thun-streetwear",
                "/images/products/clothes/vintage-washed-boxy-tee.png"),

            new SeedProduct(
                "Oversize Streetwear Tee Clean White",
                "oversize-streetwear-tee-clean-white",
                "Áo phông basic trắng tinh khôi dệt sợi cotton 2 chiều cao cấp, dáng thả vai drop-shoulder tôn phom.",
                290000,
                "ao-thun-streetwear",
                "/images/products/clothes/oversize-streetwear-tee-white.png"),

            new SeedProduct(
                "Distressed Graphic Tee 'Urbn Rebel'",
                "distressed-graphic-tee-urbn-rebel",
                "Graphic typography phong cách gothic nổi loạn, chi tiết mài rách sờn gấu cá tính không đụng hàng.",
                350000,
                "ao-thun-streetwear",
                "/images/products/clothes/distressed-graphic-tee.png"),

            new SeedProduct(
                "Cyberpunk Leather Sleeve Varsity Jacket",
                "cyberpunk-leather-sleeve-varsity-jacket",
                "Áo khoác bóng chày phối tay da PU cao cấp, logo thêu nổi 3D, nút bấm kim loại sang trọng.",
                890000,
                "ao-khoac-varsity",
                "/images/products/clothes/cyberpunk-leather-jacket.png"),

            new SeedProduct(
                "Techwear Parachute Bomber Jacket",
                "techwear-parachute-bomber-jacket",
                "Áo bomber vải dù chống nước nhẹ, khóa kéo YKK 2 chiều, thiết kế nhiều túi khóa bấm đa năng tiện lợi.",
                790000,
                "ao-khoac-varsity",
                "/images/products/clothes/techwear-bomber-jacket.png"),

            new SeedProduct(
                "Varsity Stadium Bomber Jacket Black",
                "varsity-stadium-bomber-jacket-black",
                "Phom dáng thể thao năng động, bo chun cổ tay và gấu áo dệt sọc thể thao thời thượng.",
                750000,
                "ao-khoac-varsity",
                "/images/products/clothes/varsity-bomber-jacket.png"),

            new SeedProduct(
                "Fleece Vintage Washed Crewneck Olive",
                "fleece-vintage-washed-crewneck-olive",
                "Áo nỉ chui đầu màu rêu khói wash vintage, mặt trong lót bông mềm mại chống rụng lông.",
                520000,
                "hoodie-sweater",
                "/images/products/clothes/fleece-vintage-crewneck.png"),

            new SeedProduct(
                "Vintage Distressed Baggy Denim Jeans",
                "vintage-distressed-baggy-denim-jeans",
                "Quần jean 14oz ống suông rộng rách gối nhẹ bụi bặm, hack dáng kéo dài chân cực kỳ tôn dáng.",
                590000,
                "quan-baggy-cargo",
                "/images/products/clothes/baggy-washed-denim.png"),

            new SeedProduct(
                "Multi-Pocket Skate Cargo Pants Black",
                "multi-pocket-skate-cargo-pants-black",
                "Quần túi hộp ống rộng phong cách trượt ván đường phố, cạp chun kèm dây rút tiện lợi cả đi học lẫn đi chơi.",
                550000,
                "quan-baggy-cargo",
                "/images/products/clothes/baggy-skate-cargo-pants.png"),

            // --- 10 MẪU SNEAKER SHOWROOM 3D (CẮT NỀN TRONG SUỐT GÓC NGHIÊNG ĐẶT KỆ KÍNH) ---
            new SeedProduct(
                "Air Jordan 1 Retro High OG 'Chicago'",
                "air-jordan-1-retro-high-og-chicago",
                "Biểu tượng thời trang bất diệt với phối màu Đỏ/Trắng/Đen kinh điển. Da sần cao cấp, đế Air êm ái.",
                4500000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/air-jordan-1-retro-high.png"),

            new SeedProduct(
                "Nike Dunk Low Retro 'Panda' Black/White",
                "nike-dunk-low-retro-panda",
                "Đôi sneaker quốc dân dễ phối đồ nhất mọi thời đại. Phối màu Panda tương phản sắc nét, cổ thấp năng động.",
                2850000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/nike-dunk-low-retro.png"),

            new SeedProduct(
                "Travis Scott x Air Jordan 1 Low 'Mocha'",
                "travis-scott-air-jordan-1-low-mocha",
                "Thiết kế dấu Swoosh ngược trứ danh của Travis Scott trên nền da lộn màu nâu mocha và trắng kem thời thượng.",
                18500000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/travis-scott-retro-low.png"),

            new SeedProduct(
                "Balenciaga Triple S Clear Sole Chunky",
                "balenciaga-triple-s-clear-sole",
                "Đỉnh cao phong cách chunky dad shoe với đế khí trong suốt clear sole 3 lớp độc bản, tăng chiều cao vượt trội.",
                19800000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/balenciaga-triple-s.png"),

            new SeedProduct(
                "Yeezy Boost 350 V2 'Onyx' Core Black",
                "yeezy-boost-350-v2-onyx",
                "Upper vải Primeknit dệt thoáng khí ôm sát bàn chân, đế đệm Boost toàn phần êm ái vượt trội.",
                6200000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/yeezy-boost-350-v2.png"),

            new SeedProduct(
                "New Balance 550 Retro Basketball White/Green",
                "new-balance-550-retro-white-green",
                "Vibe retro bóng rổ thập niên 80s với chất liệu da mịn cao cấp phối viền xanh lá đậm cổ điển.",
                3200000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/new-balance-550.png"),

            new SeedProduct(
                "Rick Owens Geobasket High-Top Leather",
                "rick-owens-geobasket-high-top",
                "Tuyệt tác high-fashion avant-garde với lưỡi gà siêu cao, da bê dẻo dai và đế răng cưa đặc trưng.",
                24500000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/rick-owens-geobasket.png"),

            new SeedProduct(
                "Nike Air Force 1 '07 Low Triple White",
                "nike-air-force-1-07-low-triple-white",
                "Thiết kế sneaker all-white vĩ đại nhất lịch sử, đệm khí Nike Air êm ái và tag dây giày kim loại tinh tế.",
                2650000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/nike-air-force-1-low.png"),

            new SeedProduct(
                "Converse Chuck 70 High Heritage Black",
                "converse-chuck-70-high-heritage-black",
                "Vải canvas 12oz dày dặn, đường chỉ khâu gia cố cổ điển, đế cao su bóng ngà vintage bền bỉ.",
                1950000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/converse-chuck-70-high.png"),

            new SeedProduct(
                "Adidas Forum 84 Low Vintage Cloud White",
                "adidas-forum-84-low-vintage",
                "Quai dán Velcro chéo mắt cá chân đặc trưng thập niên 80, da phối da lộn sang xịn mịn.",
                2500000,
                "giay-sneaker-streetwear",
                "/images/products/shoes/adidas-forum-low.png")
        };

        foreach (var item in products)
        {
            var category = await db.Categories.FirstOrDefaultAsync(c => c.Slug == item.CategorySlug);
            if (category == null) continue;

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

        // ==============================================================
        // 6. TẠO BIẾN THỂ SIZE & MÀU CHO TOÀN BỘ SẢN PHẨM
        // ==============================================================
        var shoeCategory = await db.Categories.FirstOrDefaultAsync(c => c.Slug == "giay-sneaker-streetwear");
        var allProducts = await db.Products.ToListAsync();
        string[] clothingSizes = { "S", "M", "L", "XL" };
        string[] shoeSizes = { "38", "39", "40", "41", "42", "43", "44" };
        string[] colors = { "Đen", "Trắng", "Xám", "Be" };

        foreach (var product in allProducts)
        {
            var isShoe = shoeCategory != null && product.CategoryId == shoeCategory.Id;
            var sizesToUse = isShoe ? shoeSizes : clothingSizes;

            foreach (var size in sizesToUse)
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
                        StockQuantity = 30,
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
