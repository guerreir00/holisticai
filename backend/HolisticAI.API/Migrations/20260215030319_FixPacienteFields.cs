using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HolisticAI.API.Migrations
{
    /// <inheritdoc />
    public partial class FixPacienteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sessoes_Pacientes_PacienteId1",
                table: "Sessoes");

            migrationBuilder.DropIndex(
                name: "IX_Sessoes_PacienteId1",
                table: "Sessoes");

            migrationBuilder.DropColumn(
                name: "PacienteId1",
                table: "Sessoes");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Pacientes");

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Pacientes",
                type: "TEXT",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Pacientes",
                type: "TEXT",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "TEXT",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PacienteId1",
                table: "Sessoes",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Pacientes",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacoes",
                table: "Pacientes",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Pacientes",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Sessoes_PacienteId1",
                table: "Sessoes",
                column: "PacienteId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Sessoes_Pacientes_PacienteId1",
                table: "Sessoes",
                column: "PacienteId1",
                principalTable: "Pacientes",
                principalColumn: "Id");
        }
    }
}
