using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HolisticAI.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCadastroPacienteDetalhado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Pacientes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Terapia",
                table: "Pacientes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UltimaVisita",
                table: "Pacientes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CadastrosDetalhados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PacienteId = table.Column<int>(type: "INTEGER", nullable: false),
                    CPF = table.Column<string>(type: "TEXT", nullable: true),
                    Endereco = table.Column<string>(type: "TEXT", nullable: true),
                    EstadoCivil = table.Column<string>(type: "TEXT", nullable: true),
                    Religiao = table.Column<string>(type: "TEXT", nullable: true),
                    Profissao = table.Column<string>(type: "TEXT", nullable: true),
                    VeioAtravesDe = table.Column<string>(type: "TEXT", nullable: true),
                    DataInicioTratamento = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MotivoPrincipal = table.Column<string>(type: "TEXT", nullable: true),
                    FamiliaOrigem = table.Column<string>(type: "TEXT", nullable: true),
                    RotinaAtual = table.Column<string>(type: "TEXT", nullable: true),
                    SaudeMedicacao = table.Column<string>(type: "TEXT", nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CadastrosDetalhados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CadastrosDetalhados_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CadastrosDetalhados_PacienteId",
                table: "CadastrosDetalhados",
                column: "PacienteId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CadastrosDetalhados");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Terapia",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "UltimaVisita",
                table: "Pacientes");
        }
    }
}
