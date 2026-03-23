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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Email único por sistema
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // User -> Tenant
        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany()
            .HasForeignKey(u => u.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Sessao -> Paciente
        modelBuilder.Entity<Sessao>()
            .HasOne(s => s.Paciente)
            .WithMany(p => p.Sessoes)
            .HasForeignKey(s => s.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Sessao>()
            .Property(s => s.Status)
            .HasMaxLength(20);

        // CadastroPacienteDetalhado -> Paciente (1:1)
        modelBuilder.Entity<CadastroPacienteDetalhado>()
            .HasOne(c => c.Paciente)
            .WithOne(p => p.CadastroDetalhado)
            .HasForeignKey<CadastroPacienteDetalhado>(c => c.PacienteId)
            .OnDelete(DeleteBehavior.Cascade);

        // Um cadastro detalhado por paciente
        modelBuilder.Entity<CadastroPacienteDetalhado>()
            .HasIndex(c => c.PacienteId)
            .IsUnique();
    }
}