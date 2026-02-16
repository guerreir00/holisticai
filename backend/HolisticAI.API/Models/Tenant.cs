using System.ComponentModel.DataAnnotations;

namespace HolisticAI.API.Models;

public class Tenant
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)]
    public string Nome { get; set; } = string.Empty;

    public bool Ativo { get; set; } = true;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
