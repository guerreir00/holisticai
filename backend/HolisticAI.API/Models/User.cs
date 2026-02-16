using System.ComponentModel.DataAnnotations;

namespace HolisticAI.API.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    [Required, MaxLength(120)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Role { get; set; } = "Owner"; // Owner | Secretary

    public bool Ativo { get; set; } = true;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
