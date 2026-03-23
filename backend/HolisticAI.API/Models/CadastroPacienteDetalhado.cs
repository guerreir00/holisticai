using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HolisticAI.API.Models;

public class CadastroPacienteDetalhado
{
    public int Id { get; set; }

    public int PacienteId { get; set; }

    [ForeignKey("PacienteId")]
    public Paciente Paciente { get; set; } = null!;

    [MaxLength(20)]
    public string? CPF { get; set; }

    [MaxLength(250)]
    public string? Endereco { get; set; }

    [MaxLength(80)]
    public string? EstadoCivil { get; set; }

    [MaxLength(120)]
    public string? Religiao { get; set; }

    [MaxLength(120)]
    public string? Profissao { get; set; }

    [MaxLength(150)]
    public string? VeioAtravesDe { get; set; }

    public DateTime? DataInicioTratamento { get; set; }

    [MaxLength(2000)]
    public string? MotivoPrincipal { get; set; }

    [MaxLength(3000)]
    public string? FamiliaOrigem { get; set; }

    [MaxLength(3000)]
    public string? RotinaAtual { get; set; }

    [MaxLength(3000)]
    public string? SaudeMedicacao { get; set; }

    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    public DateTime? DataAtualizacao { get; set; }
}