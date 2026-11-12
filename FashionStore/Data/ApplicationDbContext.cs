using FashionStore.Models.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

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

    public DbSet<PaymentHistory> PaymentHistories => Set<PaymentHistory>();

    public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }

    public DbSet<Shipment> Shipments => Set<Shipment>();

    public DbSet<ShipmentHistory> ShipmentHistories => Set<ShipmentHistory>();

    public DbSet<ShipmentLocation> ShipmentLocations => Set<ShipmentLocation>();

    public DbSet<SupportRequest> SupportRequests => Set<SupportRequest>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Order>().Property(o => o.RowVersion).IsRowVersion();
        builder.Entity<PaymentHistory>(entity =>
        {
            entity.Property(h => h.Event).HasMaxLength(40);
            entity.Property(h => h.Amount).HasPrecision(18, 2);
            entity.HasOne(h => h.Order).WithMany().HasForeignKey(h => h.OrderId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(h => h.ActorUser).WithMany().HasForeignKey(h => h.ActorUserId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(h => new { h.OrderId, h.CreatedAt });
        });

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
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(h => h.ChangedByUser)
                .WithMany()
                .HasForeignKey(h => h.ChangedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(h => h.Note)
                .HasMaxLength(500);
        });

        // --- Shipment ---
        builder.Entity<Shipment>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.HasIndex(s => s.TrackingCode).IsUnique();

            entity.Property(s => s.CODAmount).HasPrecision(18, 2);

            entity.HasOne(s => s.Order)
                .WithMany(o => o.Shipments)
                .HasForeignKey(s => s.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.Shipper)
                .WithMany()
                .HasForeignKey(s => s.ShipperId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(s => s.Note).HasMaxLength(500);
        });

        // --- ShipmentHistory ---
        builder.Entity<ShipmentHistory>(entity =>
        {
            entity.HasKey(h => h.Id);

            entity.HasOne(h => h.Shipment)
                .WithMany(s => s.Histories)
                .HasForeignKey(h => h.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(h => h.ChangedByUser)
                .WithMany()
                .HasForeignKey(h => h.ChangedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(h => h.Note).HasMaxLength(500);
        });

        builder.Entity<ShipmentLocation>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasOne(x => x.Shipment)
                .WithMany(x => x.Locations)
                .HasForeignKey(x => x.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.ShipmentId, x.RecordedAt });
        });

        // --- SupportRequest ---
        builder.Entity<SupportRequest>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(s => s.CreatedAt);
            entity.HasIndex(s => s.Status);
        });
    }
}
