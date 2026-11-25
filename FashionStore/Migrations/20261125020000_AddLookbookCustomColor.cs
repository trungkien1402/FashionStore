using Microsoft.EntityFrameworkCore.Migrations;

namespace FashionStore.Migrations;

public partial class AddLookbookCustomColor : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "BackgroundColor",
            table: "LookbookCollections",
            type: "nvarchar(7)",
            maxLength: 7,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "BackgroundColor", table: "LookbookCollections");
    }
}
