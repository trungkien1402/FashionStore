using FashionStore.Models.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace FashionStore.Data;

public class ApplicationDbContext
    : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<ProductVariant> ProductVariants
        => Set<ProductVariant>();

    public DbSet<Order> Orders => Set<Order>();

    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Product>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);

        builder.Entity<ProductVariant>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(x => x.TotalAmount)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(x => x.SubTotal)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(x => x.ShippingFee)
            .HasPrecision(18, 2);

        builder.Entity<Order>()
            .Property(x => x.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Entity<Product>()
            .HasOne(x => x.Category)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ProductVariant>()
            .HasIndex(x => x.SKU)
            .IsUnique();

        builder.Entity<Order>()
            .HasIndex(x => x.OrderCode)
            .IsUnique();

        builder.Entity<OrderItem>()
            .HasOne(x => x.Order)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.OrderId);


        builder.Entity<OrderStatusHistory>(entity =>
        {
            entity.HasKey(h => h.Id);

            entity.HasOne(h => h.Order)
                .WithMany()
                .HasForeignKey(h => h.OrderId)
                .OnDelete(DeleteBehavior.Restrict); // Sửa Cascade thành Restrict ở đây

            entity.HasOne(h => h.ChangedByUser)
                .WithMany()
                .HasForeignKey(h => h.ChangedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(h => h.Note)
                .HasMaxLength(500);
        });
    }
}