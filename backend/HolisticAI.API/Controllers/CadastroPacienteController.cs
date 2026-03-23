using HolisticAI.API.Data;
using HolisticAI.API.Infrastructure;
using HolisticAI.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/pacientes/{pacienteId:int}/cadastro")]
[Authorize(Policy = "OwnerOrSecretary")]
public class CadastroPacienteController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CadastroPacienteController(ApplicationDbContext db)
    {
        _db = db;
    }

    public record CadastroPacienteDetalhadoDto(
        string? CPF,
        string? Endereco,
        string? EstadoCivil,
        string? Religiao,
        string? Profissao,
        string? VeioAtravesDe,
        DateTime? DataInicioTratamento,
        string? MotivoPrincipal,
        string? FamiliaOrigem,
        string? RotinaAtual,
        string? SaudeMedicacao
    );

    [HttpGet]
    public async Task<IActionResult> Get(int pacienteId)
    {
        var tenantId = UserContext.GetTenantId(User);

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == pacienteId && p.TenantId == tenantId);

        if (paciente is null)
            return NotFound("Paciente não encontrado.");

        var cadastro = await _db.CadastrosDetalhados
            .FirstOrDefaultAsync(c => c.PacienteId == pacienteId);

        return Ok(cadastro);
    }

    [HttpPost]
    public async Task<IActionResult> Save(int pacienteId, [FromBody] CadastroPacienteDetalhadoDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == pacienteId && p.TenantId == tenantId);

        if (paciente is null)
            return NotFound("Paciente não encontrado.");

        var existente = await _db.CadastrosDetalhados
            .FirstOrDefaultAsync(c => c.PacienteId == pacienteId);

        if (existente is null)
        {
            var novoCadastro = new CadastroPacienteDetalhado
            {
                PacienteId = pacienteId,
                CPF = dto.CPF,
                Endereco = dto.Endereco,
                EstadoCivil = dto.EstadoCivil,
                Religiao = dto.Religiao,
                Profissao = dto.Profissao,
                VeioAtravesDe = dto.VeioAtravesDe,
                DataInicioTratamento = dto.DataInicioTratamento,
                MotivoPrincipal = dto.MotivoPrincipal,
                FamiliaOrigem = dto.FamiliaOrigem,
                RotinaAtual = dto.RotinaAtual,
                SaudeMedicacao = dto.SaudeMedicacao,
                DataCadastro = DateTime.UtcNow
            };

            _db.CadastrosDetalhados.Add(novoCadastro);
            await _db.SaveChangesAsync();

            return Ok(novoCadastro);
        }

        existente.CPF = dto.CPF;
        existente.Endereco = dto.Endereco;
        existente.EstadoCivil = dto.EstadoCivil;
        existente.Religiao = dto.Religiao;
        existente.Profissao = dto.Profissao;
        existente.VeioAtravesDe = dto.VeioAtravesDe;
        existente.DataInicioTratamento = dto.DataInicioTratamento;
        existente.MotivoPrincipal = dto.MotivoPrincipal;
        existente.FamiliaOrigem = dto.FamiliaOrigem;
        existente.RotinaAtual = dto.RotinaAtual;
        existente.SaudeMedicacao = dto.SaudeMedicacao;
        existente.DataAtualizacao = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(existente);
    }
}