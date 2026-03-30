using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HolisticAI.API.Models;

public class ProfessionalProfile
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(120)]
    public string Especialidade { get; set; } = string.Empty;

    [MaxLength(80)]
    public string? RegistroProfissional { get; set; }

    [Required]
    public bool AceitouTermos { get; set; }

    public DateTime AceitouTermosEm { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }
}