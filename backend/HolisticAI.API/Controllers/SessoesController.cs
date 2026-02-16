using HolisticAI.API.Data;
using HolisticAI.API.Models;
using HolisticAI.API.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // 🔒 PROTEGIDO POR JWT
public class SessoesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SessoesController(ApplicationDbContext db)
    {
        _db = db;
    }

    // ================================
    // DTO de resposta
    // ================================
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

    // ================================
    // GET /api/Sessoes?data=YYYY-MM-DD
    // ================================
    [HttpGet]
    public async Task<ActionResult<List<SessaoResponseDto>>> GetByDate([FromQuery] string data)
    {
        var tenantId = UserContext.GetTenantId(User); // 🔥 pega tenant do token

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
                s.TenantId == tenantId &&  // 🔒 FILTRO MULTI-TENANT
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

    // ================================
    // DTO criação
    // ================================
    public record CreateSessaoDto(
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

    // ================================
    // POST
    // ================================
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

        // 🔒 paciente precisa pertencer ao mesmo tenant
        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == dto.PacienteId && p.TenantId == tenantId);

        if (paciente is null)
            return BadRequest("Paciente não encontrado ou não pertence ao seu tenant.");

        var entity = new Sessao
        {
            TenantId = tenantId, // 🔥 CRÍTICO
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
            status,
            entity.Observacoes
        );

        return Ok(response);
    }
}
