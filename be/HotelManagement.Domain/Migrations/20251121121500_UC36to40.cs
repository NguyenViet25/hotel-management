using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HotelManagement.Domain.Migrations
{
    public partial class UC36to40 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ActualCheckInAt",
                table: "BookingRooms",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ActualCheckOutAt",
                table: "BookingRooms",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdCardFrontImageUrl",
                table: "Guests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdCardBackImageUrl",
                table: "Guests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MinibarBookings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MinibarId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ComsumedQuantity = table.Column<int>(type: "int", nullable: false),
                    OriginalQuantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MinibarBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MinibarBookings_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MinibarBookings_Minibars_MinibarId",
                        column: x => x.MinibarId,
                        principalTable: "Minibars",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MinibarBookings_BookingId",
                table: "MinibarBookings",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_MinibarBookings_MinibarId",
                table: "MinibarBookings",
                column: "MinibarId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MinibarBookings");

            migrationBuilder.DropColumn(
                name: "ActualCheckInAt",
                table: "BookingRooms");

            migrationBuilder.DropColumn(
                name: "ActualCheckOutAt",
                table: "BookingRooms");

            migrationBuilder.DropColumn(
                name: "IdCardFrontImageUrl",
                table: "Guests");

            migrationBuilder.DropColumn(
                name: "IdCardBackImageUrl",
                table: "Guests");
        }
    }
}