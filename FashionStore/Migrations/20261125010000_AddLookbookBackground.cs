using Microsoft.EntityFrameworkCore.Migrations;

namespace FashionStore.Migrations;

public partial class AddLookbookBackground : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "Background",
            table: "LookbookCollections",
            type: "int",
            nullable: false,
            defaultValue: 0);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Background",
            table: "LookbookCollections");
    }
}
