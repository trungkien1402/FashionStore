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

        if (!await db.Products.AnyAsync())
        {
            await ShowroomCatalog.ImportAsync(db);
        }
    }
}
