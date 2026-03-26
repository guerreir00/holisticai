using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HolisticAI.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProntuarioRegistro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Prontuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TenantId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PacienteId = table.Column<int>(type: "INTEGER", nullable: false),
                    Titulo = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true),
                    ConteudoFinal = table.Column<string>(type: "TEXT", maxLength: 10000, nullable: false),
                    ConteudoGeradoIa = table.Column<string>(type: "TEXT", maxLength: 10000, nullable: true),
                    Tipo = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    GeradoPorIa = table.Column<bool>(type: "INTEGER", nullable: false),
                    ModeloIa = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DataSessao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TerapiaAplicada = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    DuracaoMinutos = table.Column<int>(type: "INTEGER", nullable: true),
                    ObservacoesSessao = table.Column<string>(type: "TEXT", maxLength: 5000, nullable: true),
                    RelatoInicial = table.Column<string>(type: "TEXT", maxLength: 5000, nullable: true),
                    SituacaoEnergetica = table.Column<string>(type: "TEXT", maxLength: 3000, nullable: true),
                    ChakraBase = table.Column<int>(type: "INTEGER", nullable: true),
                    ChakraSacral = table.Column<int>(type: "INTEGER", nullable: true),
                    ChakraPlexo = table.Column<int>(type: "INTEGER", nullable: true),
                    ChakraCardiaco = table.Column<int>(type: "INTEGER", nullable: true),
                    ChakraLaringeo = table.Column<int>(type: "INTEGER", nullable: true),
                    ChakraFrontal = table.Column<int>(type: "INTEGER", nullable: true),
                    ChakraCoronario = table.Column<int>(type: "INTEGER", nullable: true),
                    Trabalho = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Familia = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Prosperidade = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Espiritualidade = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    RelacoesAfetivas = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    TratamentoExecutado = table.Column<string>(type: "TEXT", maxLength: 3000, nullable: true),
                    OrientacaoParaCasa = table.Column<string>(type: "TEXT", maxLength: 3000, nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CriadoPorUserId = table.Column<int>(type: "INTEGER", nullable: false),
                    CriadoPorNome = table.Column<string>(type: "TEXT", maxLength: 150, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prontuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Prontuarios_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_PacienteId",
                table: "Prontuarios",
                column: "PacienteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Prontuarios");
        }
    }
}
