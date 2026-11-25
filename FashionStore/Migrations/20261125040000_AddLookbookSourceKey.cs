using Microsoft.EntityFrameworkCore.Migrations;

namespace FashionStore.Migrations;

public partial class AddLookbookSourceKey : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>("SourceKey", "LookbookCollections", "nvarchar(32)", maxLength: 32, nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn("SourceKey", "LookbookCollections");
    }
}
