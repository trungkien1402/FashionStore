using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FashionStore.Migrations;

public partial class AddShowroomCatalog : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>("ShowroomAudience", "Products", type: "nvarchar(16)", maxLength: 16, nullable: true);
        migrationBuilder.AddColumn<string>("ShowroomKind", "Products", type: "nvarchar(8)", maxLength: 8, nullable: true);
        migrationBuilder.AddColumn<string>("ShowroomMetadata", "Products", type: "nvarchar(max)", nullable: true);
        migrationBuilder.AddColumn<int>("ShowroomSortOrder", "Products", type: "int", nullable: false, defaultValue: 0);
        migrationBuilder.CreateIndex("IX_Products_ShowroomAudience_ShowroomKind_ShowroomSortOrder",
            "Products", new[] { "ShowroomAudience", "ShowroomKind", "ShowroomSortOrder" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex("IX_Products_ShowroomAudience_ShowroomKind_ShowroomSortOrder", "Products");
        migrationBuilder.DropColumn("ShowroomAudience", "Products");
        migrationBuilder.DropColumn("ShowroomKind", "Products");
        migrationBuilder.DropColumn("ShowroomMetadata", "Products");
        migrationBuilder.DropColumn("ShowroomSortOrder", "Products");
    }
}
