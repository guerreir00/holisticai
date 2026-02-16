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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Email único por sistema (simples)
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // User -> Tenant
        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany()
            .HasForeignKey(u => u.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Sessao -> Paciente (o que você já tem)
        modelBuilder.Entity<Sessao>()
            .HasOne(s => s.Paciente)
            .WithMany(p => p.Sessoes)
            .HasForeignKey(s => s.PacienteId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Sessao>()
            .Property(s => s.Status)
            .HasMaxLength(20);
    }
}
