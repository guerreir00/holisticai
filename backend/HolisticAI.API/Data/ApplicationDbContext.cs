using HolisticAI.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HolisticAI.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Sessao> Sessoes => Set<Sessao>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<CadastroPacienteDetalhado> CadastrosDetalhados => Set<CadastroPacienteDetalhado>();
    public DbSet<ProntuarioRegistro> Prontuarios => Set<ProntuarioRegistro>();
    public DbSet<ProfessionalProfile> ProfessionalProfiles => Set<ProfessionalProfile>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany()
            .HasForeignKey(u => u.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Sessao>()
            .HasOne(s => s.Paciente)
            .WithMany(p => p.Sessoes)
            .HasForeignKey(s => s.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Sessao>()
            .Property(s => s.Status)
            .HasMaxLength(20);

        modelBuilder.Entity<CadastroPacienteDetalhado>()
            .HasOne(c => c.Paciente)
            .WithOne(p => p.CadastroDetalhado)
            .HasForeignKey<CadastroPacienteDetalhado>(c => c.PacienteId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CadastroPacienteDetalhado>()
            .HasIndex(c => c.PacienteId)
            .IsUnique();

        modelBuilder.Entity<ProntuarioRegistro>()
            .HasOne(p => p.Paciente)
            .WithMany(x => x.Prontuarios)
            .HasForeignKey(p => p.PacienteId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProntuarioRegistro>()
            .Property(p => p.Tipo)
            .HasMaxLength(50);

        modelBuilder.Entity<ProntuarioRegistro>()
            .Property(p => p.Titulo)
            .HasMaxLength(150);

        modelBuilder.Entity<ProntuarioRegistro>()
            .Property(p => p.ModeloIa)
            .HasMaxLength(100);

        modelBuilder.Entity<ProntuarioRegistro>()
            .Property(p => p.TerapiaAplicada)
            .HasMaxLength(100);

        modelBuilder.Entity<ProntuarioRegistro>()
            .Property(p => p.CriadoPorNome)
            .HasMaxLength(150);

        modelBuilder.Entity<ProfessionalProfile>()
            .HasOne(pp => pp.User)
            .WithOne()
            .HasForeignKey<ProfessionalProfile>(pp => pp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProfessionalProfile>()
            .HasIndex(pp => pp.UserId)
            .IsUnique();

        modelBuilder.Entity<ProfessionalProfile>()
            .Property(pp => pp.Especialidade)
            .HasMaxLength(120);

        modelBuilder.Entity<ProfessionalProfile>()
            .Property(pp => pp.RegistroProfissional)
            .HasMaxLength(80);

        modelBuilder.Entity<PasswordResetToken>()
            .HasOne(prt => prt.User)
            .WithMany()
            .HasForeignKey(prt => prt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PasswordResetToken>()
            .Property(prt => prt.TokenHash)
            .HasMaxLength(200);
    }
}