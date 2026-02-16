using System.ComponentModel.DataAnnotations;

namespace HolisticAI.API.Models;

public class Sessao
{
    public int Id { get; set; }

    public Guid TenantId { get; set; }

    [Required]
    public int PacienteId { get; set; }

    public Paciente? Paciente { get; set; }

    [Required]
    public DateTime DataInicio { get; set; }

    [Range(15, 480)]
    public int DuracaoMinutos { get; set; } = 60;

    [Required, MaxLength(80)]
    public string Terapia { get; set; } = "Reiki";

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Pendente"; // Pendente | Confirmada | Concluida | Cancelada

    [MaxLength(1000)]
    public string? Observacoes { get; set; }

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
