using HolisticAI.API.Data;
using HolisticAI.API.Infrastructure;
using HolisticAI.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "OwnerOrSecretary")]
public class PacientesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PacientesController(ApplicationDbContext db)
    {
        _db = db;
    }

    // ==========================
    // DTOs (padrão seguro)
    // ==========================
    public record PacienteCreateDto(
        string Nome,
        string? Email,
        string? Telefone,
        DateTime? DataNascimento,
        string? Observacoes,
        string? Terapia,
        string? Status
    );

    public record PacienteUpdateDto(
        string Nome,
        string? Email,
        string? Telefone,
        DateTime? DataNascimento,
        string? Observacoes,
        string? Terapia,
        string? Status
    );

    private static string NormalizeStatus(string? status)
    {
        var s = (status ?? "Ativo").Trim();
        if (string.IsNullOrWhiteSpace(s)) return "Ativo";

        // aceita variações básicas
        s = char.ToUpper(s[0]) + s.Substring(1).ToLower();

        return s switch
        {
            "Ativo" => "Ativo",
            "Inativo" => "Inativo",
            "Aguardando" => "Aguardando",
            _ => "Ativo"
        };
    }

    // ==========================
    // GET: /api/pacientes
    // ==========================
    [HttpGet]
    public async Task<ActionResult<List<Paciente>>> GetAll()
    {
        var tenantId = UserContext.GetTenantId(User);

        var pacientes = await _db.Pacientes
            .Where(p => p.TenantId == tenantId)
            .OrderByDescending(p => p.Id)
            .ToListAsync();

        return Ok(pacientes);
    }

    // ==========================
    // GET: /api/pacientes/5
    // ==========================
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Paciente>> GetById(int id)
    {
        var tenantId = UserContext.GetTenantId(User);

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (paciente is null) return NotFound();

        return Ok(paciente);
    }

    // ==========================
    // POST: /api/pacientes
    // ==========================
    [HttpPost]
    public async Task<ActionResult<Paciente>> Create([FromBody] PacienteCreateDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);

        if (string.IsNullOrWhiteSpace(dto.Nome))
            return BadRequest("Nome é obrigatório.");

        var paciente = new Paciente
        {
            TenantId = tenantId,
            Nome = dto.Nome.Trim(),
            Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim(),
            Telefone = string.IsNullOrWhiteSpace(dto.Telefone) ? null : dto.Telefone.Trim(),
            DataNascimento = dto.DataNascimento,
            Observacoes = dto.Observacoes,
            Terapia = string.IsNullOrWhiteSpace(dto.Terapia) ? null : dto.Terapia.Trim(),
            Status = NormalizeStatus(dto.Status),
            DataCadastro = DateTime.UtcNow,

            // Pode deixar null (vai ser preenchido quando houver sessão concluída)
            UltimaVisita = null
        };

        _db.Pacientes.Add(paciente);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = paciente.Id }, paciente);
    }

    // ==========================
    // PUT: /api/pacientes/5
    // ==========================
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PacienteUpdateDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);

        if (string.IsNullOrWhiteSpace(dto.Nome))
            return BadRequest("Nome é obrigatório.");

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (paciente is null) return NotFound();

        paciente.Nome = dto.Nome.Trim();
        paciente.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
        paciente.Telefone = string.IsNullOrWhiteSpace(dto.Telefone) ? null : dto.Telefone.Trim();
        paciente.DataNascimento = dto.DataNascimento;
        paciente.Observacoes = dto.Observacoes;
        paciente.Terapia = string.IsNullOrWhiteSpace(dto.Terapia) ? null : dto.Terapia.Trim();
        paciente.Status = NormalizeStatus(dto.Status);

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // ==========================
    // DELETE: /api/pacientes/5
    // ==========================
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = UserContext.GetTenantId(User);

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (paciente is null) return NotFound();

        _db.Pacientes.Remove(paciente);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}