using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FashionStore.Migrations;

public partial class AddSaleCampaign : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>("IsSale", "LookbookCollections", "bit", nullable: false, defaultValue: false);
        migrationBuilder.AddColumn<DateTimeOffset>("StartsAt", "LookbookCollections", "datetimeoffset", nullable: true);
        migrationBuilder.AddColumn<DateTimeOffset>("EndsAt", "LookbookCollections", "datetimeoffset", nullable: true);
        migrationBuilder.AddColumn<string>("SaleNotice", "LookbookCollections", "nvarchar(240)", maxLength: 240, nullable: false, defaultValue: "");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn("IsSale", "LookbookCollections");
        migrationBuilder.DropColumn("StartsAt", "LookbookCollections");
        migrationBuilder.DropColumn("EndsAt", "LookbookCollections");
        migrationBuilder.DropColumn("SaleNotice", "LookbookCollections");
    }
}
