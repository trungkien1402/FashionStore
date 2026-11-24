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
                FullName = "Nguyễn Văn Giao",
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
        else
        {
            if (shipper.FullName != null && shipper.FullName.Contains("(Shipper)"))
            {
                shipper.FullName = shipper.FullName.Replace(" (Shipper)", "").Replace("(Shipper)", "").Trim();
                await userManager.UpdateAsync(shipper);
            }
            if (!await userManager.IsInRoleAsync(shipper, "Shipper"))
            {
                await userManager.AddToRoleAsync(shipper, "Shipper");
            }
        }

        var variantsWithParens = await db.ProductVariants.Where(v => v.Color != null && v.Color.Contains("(")).ToListAsync();
        foreach (var v in variantsWithParens)
        {
            var idx = v.Color.IndexOf('(');
            if (idx > 0)
            {
                v.Color = v.Color.Substring(0, idx).Trim();
            }
        }
        if (variantsWithParens.Any())
        {
            await db.SaveChangesAsync();
        }

        var allCategories = await db.Categories.ToListAsync();
        bool catChanged = false;
        foreach (var cat in allCategories)
        {
            var oldName = cat.Name;
            if (string.IsNullOrEmpty(cat.Name)) continue;
            if (cat.Name.Contains("& Graphic Tees")) cat.Name = cat.Name.Replace("& Graphic Tees", "").Trim();
            if (cat.Name.Contains("& Sweaters")) cat.Name = cat.Name.Replace("& Sweaters", "").Trim();
            if (cat.Name.Contains("& Outerwear")) cat.Name = cat.Name.Replace("& Outerwear", "").Trim();
            if (cat.Name.Contains("& Denim")) cat.Name = cat.Name.Replace("& Denim", "").Trim();
            if (cat.Name.Contains("& Blouse")) cat.Name = cat.Name.Replace("& Blouse", "").Trim();
            if (cat.Name.Contains("& Chino")) cat.Name = cat.Name.Replace("& Chino", "").Trim();
            if (cat.Name.Contains("& Streetwear Shoes")) cat.Name = cat.Name.Replace("& Streetwear Shoes", "").Trim();
            if (cat.Name.Contains("& Cargo")) cat.Name = "Quần túi hộp";
            if (cat.Name.Contains("Hoodies")) cat.Name = "Áo nỉ & Hoodie";
            if (cat.Name.Contains("("))
            {
                var idx = cat.Name.IndexOf('(');
                if (idx > 0) cat.Name = cat.Name.Substring(0, idx).Trim();
            }
            if (cat.Name != oldName) catChanged = true;
        }
        if (catChanged)
        {
            await db.SaveChangesAsync();
        }

        if (!await db.Products.AnyAsync(p => p.ShowroomMetadata != null))
        {
            await ShowroomCatalog.ImportAsync(db);
        }
        await ShowroomCatalog.ReconcileCategoriesAsync(db);
    }
}
