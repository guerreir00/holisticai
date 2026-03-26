    using System.ComponentModel.DataAnnotations;

namespace HolisticAI.API.Models;

public class ProntuarioRegistro
{
    public int Id { get; set; }

    public Guid TenantId { get; set; }

    public int PacienteId { get; set; }
    public Paciente Paciente { get; set; } = null!;

    [MaxLength(150)]
    public string? Titulo { get; set; }

    [Required, MaxLength(10000)]
    public string ConteudoFinal { get; set; } = string.Empty;

    [MaxLength(10000)]
    public string? ConteudoGeradoIa { get; set; }

    [MaxLength(50)]
    public string Tipo { get; set; } = "Prontuario";

    public bool GeradoPorIa { get; set; } = false;

    [MaxLength(100)]
    public string? ModeloIa { get; set; }

    public DateTime DataSessao { get; set; }

    [MaxLength(100)]
    public string? TerapiaAplicada { get; set; }

    public int? DuracaoMinutos { get; set; }

    [MaxLength(5000)]
    public string? ObservacoesSessao { get; set; }

    [MaxLength(5000)]
    public string? RelatoInicial { get; set; }

    [MaxLength(3000)]
    public string? SituacaoEnergetica { get; set; }

    public int? ChakraBase { get; set; }
    public int? ChakraSacral { get; set; }
    public int? ChakraPlexo { get; set; }
    public int? ChakraCardiaco { get; set; }
    public int? ChakraLaringeo { get; set; }
    public int? ChakraFrontal { get; set; }
    public int? ChakraCoronario { get; set; }

    [MaxLength(2000)]
    public string? Trabalho { get; set; }

    [MaxLength(2000)]
    public string? Familia { get; set; }

    [MaxLength(2000)]
    public string? Prosperidade { get; set; }

    [MaxLength(2000)]
    public string? Espiritualidade { get; set; }

    [MaxLength(2000)]
    public string? RelacoesAfetivas { get; set; }

    [MaxLength(3000)]
    public string? TratamentoExecutado { get; set; }

    [MaxLength(3000)]
    public string? OrientacaoParaCasa { get; set; }

    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    public DateTime? DataAtualizacao { get; set; }

    public int CriadoPorUserId { get; set; }

    [MaxLength(150)]
    public string? CriadoPorNome { get; set; }
}