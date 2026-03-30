using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HolisticAI.API.Models;

public class PasswordResetToken
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string TokenHash { get; set; } = string.Empty;

    [Required]
    public DateTime ExpiraEm { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public DateTime? UtilizadoEm { get; set; }

    [Required]
    public bool Ativo { get; set; } = true;

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}