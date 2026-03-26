using HolisticAI.API.Data;
using HolisticAI.API.Models;
using HolisticAI.API.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "OwnerOrSecretary")]
public class SessoesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SessoesController(ApplicationDbContext db)
    {
        _db = db;
    }

    public record SessaoResponseDto(
        int Id,
        int PacienteId,
        string PacienteNome,
        DateTime DataInicio,
        int DuracaoMinutos,
        string Terapia,
        string Status,
        string? Observacoes
    );

    public record CreateSessaoDto(
        int PacienteId,
        DateTime DataInicio,
        int DuracaoMinutos,
        string Terapia,
        string? Status,
        string? Observacoes
    );

    public record UpdateSessaoDto(
        int PacienteId,
        DateTime DataInicio,
        int DuracaoMinutos,
        string Terapia,
        string? Status,
        string? Observacoes
    );

    private static readonly HashSet<string> StatusValidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "Pendente", "Confirmada", "Concluida", "Cancelada"
    };

    [HttpGet]
    public async Task<ActionResult<List<SessaoResponseDto>>> GetByDate([FromQuery] string data)
    {
        var tenantId = UserContext.GetTenantId(User);

        if (string.IsNullOrWhiteSpace(data))
            return BadRequest("Parâmetro 'data' é obrigatório.");

        if (!DateOnly.TryParse(data, out var day))
            return BadRequest("Formato inválido. Use YYYY-MM-DD.");

        var inicio = day.ToDateTime(TimeOnly.MinValue);
        var fim = inicio.AddDays(1);

        var items = await _db.Sessoes
            .AsNoTracking()
            .Include(s => s.Paciente)
            .Where(s =>
                s.TenantId == tenantId &&
                s.DataInicio >= inicio &&
                s.DataInicio < fim)
            .OrderBy(s => s.DataInicio)
            .Select(s => new SessaoResponseDto(
                s.Id,
                s.PacienteId,
                s.Paciente != null ? s.Paciente.Nome : $"Paciente #{s.PacienteId}",
                s.DataInicio,
                s.DuracaoMinutos,
                s.Terapia,
                s.Status,
                s.Observacoes
            ))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SessaoResponseDto>> GetById(int id)
    {
        var tenantId = UserContext.GetTenantId(User);

        var sessao = await _db.Sessoes
            .AsNoTracking()
            .Include(s => s.Paciente)
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        if (sessao is null)
            return NotFound("Sessão não encontrada.");

        var response = new SessaoResponseDto(
            sessao.Id,
            sessao.PacienteId,
            sessao.Paciente != null ? sessao.Paciente.Nome : $"Paciente #{sessao.PacienteId}",
            sessao.DataInicio,
            sessao.DuracaoMinutos,
            sessao.Terapia,
            sessao.Status,
            sessao.Observacoes
        );

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<SessaoResponseDto>> Create([FromBody] CreateSessaoDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);

        if (dto.PacienteId <= 0)
            return BadRequest("PacienteId inválido.");

        if (string.IsNullOrWhiteSpace(dto.Terapia))
            return BadRequest("Terapia é obrigatória.");

        if (dto.DuracaoMinutos is < 15 or > 480)
            return BadRequest("DuracaoMinutos deve estar entre 15 e 480.");

        var status = (dto.Status ?? "Pendente").Trim();

        if (!StatusValidos.Contains(status))
            return BadRequest("Status inválido.");

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == dto.PacienteId && p.TenantId == tenantId);

        if (paciente is null)
            return BadRequest("Paciente não encontrado ou não pertence ao seu tenant.");

        var entity = new Sessao
        {
            TenantId = tenantId,
            PacienteId = dto.PacienteId,
            DataInicio = dto.DataInicio,
            DuracaoMinutos = dto.DuracaoMinutos,
            Terapia = dto.Terapia.Trim(),
            Status = status,
            Observacoes = dto.Observacoes
        };

        _db.Sessoes.Add(entity);
        await _db.SaveChangesAsync();

        var response = new SessaoResponseDto(
            entity.Id,
            entity.PacienteId,
            paciente.Nome,
            entity.DataInicio,
            entity.DuracaoMinutos,
            entity.Terapia,
            entity.Status,
            entity.Observacoes
        );

        return Ok(response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SessaoResponseDto>> Update(int id, [FromBody] UpdateSessaoDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);

        if (dto.PacienteId <= 0)
            return BadRequest("PacienteId inválido.");

        if (string.IsNullOrWhiteSpace(dto.Terapia))
            return BadRequest("Terapia é obrigatória.");

        if (dto.DuracaoMinutos is < 15 or > 480)
            return BadRequest("DuracaoMinutos deve estar entre 15 e 480.");

        var status = (dto.Status ?? "Pendente").Trim();

        if (!StatusValidos.Contains(status))
            return BadRequest("Status inválido.");

        var entity = await _db.Sessoes
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        if (entity is null)
            return NotFound("Sessão não encontrada.");

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == dto.PacienteId && p.TenantId == tenantId);

        if (paciente is null)
            return BadRequest("Paciente não encontrado ou não pertence ao seu tenant.");

        entity.PacienteId = dto.PacienteId;
        entity.DataInicio = dto.DataInicio;
        entity.DuracaoMinutos = dto.DuracaoMinutos;
        entity.Terapia = dto.Terapia.Trim();
        entity.Status = status;
        entity.Observacoes = dto.Observacoes;

        await _db.SaveChangesAsync();

        var response = new SessaoResponseDto(
            entity.Id,
            entity.PacienteId,
            paciente.Nome,
            entity.DataInicio,
            entity.DuracaoMinutos,
            entity.Terapia,
            entity.Status,
            entity.Observacoes
        );

        return Ok(response);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = UserContext.GetTenantId(User);

        var entity = await _db.Sessoes
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);

        if (entity is null)
            return NotFound("Sessão não encontrada.");

        _db.Sessoes.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}