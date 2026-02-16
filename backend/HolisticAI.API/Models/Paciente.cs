using System.ComponentModel.DataAnnotations;

namespace HolisticAI.API.Models;

public class Paciente
{
    public int Id { get; set; }
    
    public Guid TenantId { get; set; }

    [Required, MaxLength(120)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? Telefone { get; set; }

    public DateTime? DataNascimento { get; set; }

    [MaxLength(1000)]
    public string? Observacoes { get; set; }

    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    // 🔥 RELAÇÃO COM SESSÕES
    public ICollection<Sessao> Sessoes { get; set; } = new List<Sessao>();
}
