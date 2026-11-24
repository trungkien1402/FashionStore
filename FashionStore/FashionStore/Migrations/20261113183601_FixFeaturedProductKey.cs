using Microsoft.EntityFrameworkCore.Migrations;

namespace FashionStore.Migrations;

public partial class FixFeaturedProductKey : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE TABLE [FeaturedProductsReplacement] (
                [Id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
                [ProductId] int NOT NULL UNIQUE REFERENCES [Products]([Id]) ON DELETE CASCADE,
                [Position] int NOT NULL
            );

            INSERT INTO [FeaturedProductsReplacement] ([ProductId], [Position])
            SELECT [ProductId1], MIN([Position])
            FROM [FeaturedProducts]
            GROUP BY [ProductId1];

            DROP TABLE [FeaturedProducts];
            EXEC sp_rename N'dbo.FeaturedProductsReplacement', N'FeaturedProducts';
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE TABLE [FeaturedProductsReplacement] (
                [ProductId] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
                [ProductId1] int NOT NULL REFERENCES [Products]([Id]) ON DELETE CASCADE,
                [Position] int NOT NULL
            );

            INSERT INTO [FeaturedProductsReplacement] ([ProductId1], [Position])
            SELECT [ProductId], [Position] FROM [FeaturedProducts];

            DROP TABLE [FeaturedProducts];
            EXEC sp_rename N'dbo.FeaturedProductsReplacement', N'FeaturedProducts';
            CREATE INDEX [IX_FeaturedProducts_ProductId1] ON [FeaturedProducts]([ProductId1]);
            """);
    }
}
