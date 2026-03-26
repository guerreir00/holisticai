using HolisticAI.API.Data;
using HolisticAI.API.Infrastructure;
using HolisticAI.API.Models;
using HolisticAI.API.Services.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/pacientes/{pacienteId:int}/prontuario")]
[Authorize(Policy = "OwnerOrSecretary")]
public class ProntuarioController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IProntuarioIaService _iaService;

    public ProntuarioController(ApplicationDbContext db, IProntuarioIaService iaService)
    {
        _db = db;
        _iaService = iaService;
    }

    public record GerarProntuarioIaRequestDto(
        DateTime DataSessao,
        string? TerapiaAplicada,
        int? DuracaoMinutos,
        string? RelatoInicial,
        string? SituacaoEnergetica,
        int? ChakraBase,
        int? ChakraSacral,
        int? ChakraPlexo,
        int? ChakraCardiaco,
        int? ChakraLaringeo,
        int? ChakraFrontal,
        int? ChakraCoronario,
        string? Trabalho,
        string? Familia,
        string? Prosperidade,
        string? Espiritualidade,
        string? RelacoesAfetivas,
        string? TratamentoExecutado,
        string? OrientacaoParaCasa,
        string? ObservacoesSessao
    );

    public record GerarProntuarioIaResponseDto(
        string TituloSugerido,
        string ConteudoGerado,
        string ModeloIa
    );

    public record SaveProntuarioRequestDto(
        string? Titulo,
        string ConteudoFinal,
        string? ConteudoGeradoIa,
        bool GeradoPorIa,
        string? ModeloIa,
        DateTime DataSessao,
        string? TerapiaAplicada,
        int? DuracaoMinutos,
        string? ObservacoesSessao,
        string? RelatoInicial,
        string? SituacaoEnergetica,
        int? ChakraBase,
        int? ChakraSacral,
        int? ChakraPlexo,
        int? ChakraCardiaco,
        int? ChakraLaringeo,
        int? ChakraFrontal,
        int? ChakraCoronario,
        string? Trabalho,
        string? Familia,
        string? Prosperidade,
        string? Espiritualidade,
        string? RelacoesAfetivas,
        string? TratamentoExecutado,
        string? OrientacaoParaCasa
    );

    public record ProntuarioResponseDto(
        int Id,
        int PacienteId,
        string? Titulo,
        string ConteudoFinal,
        string? ConteudoGeradoIa,
        string Tipo,
        bool GeradoPorIa,
        string? ModeloIa,
        DateTime DataSessao,
        string? TerapiaAplicada,
        int? DuracaoMinutos,
        string? ObservacoesSessao,
        string? RelatoInicial,
        string? SituacaoEnergetica,
        int? ChakraBase,
        int? ChakraSacral,
        int? ChakraPlexo,
        int? ChakraCardiaco,
        int? ChakraLaringeo,
        int? ChakraFrontal,
        int? ChakraCoronario,
        string? Trabalho,
        string? Familia,
        string? Prosperidade,
        string? Espiritualidade,
        string? RelacoesAfetivas,
        string? TratamentoExecutado,
        string? OrientacaoParaCasa,
        DateTime DataCadastro,
        DateTime? DataAtualizacao,
        int CriadoPorUserId,
        string? CriadoPorNome
    );

    [HttpPost("gerar")]
    public async Task<IActionResult> Gerar(int pacienteId, [FromBody] GerarProntuarioIaRequestDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);

        var paciente = await _db.Pacientes
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == pacienteId && p.TenantId == tenantId);

        if (paciente is null)
            return NotFound("Paciente não encontrado.");

        var input = new ProntuarioIaInput
        {
            PacienteNome = paciente.Nome,
            DataSessao = dto.DataSessao,
            TerapiaAplicada = dto.TerapiaAplicada,
            DuracaoMinutos = dto.DuracaoMinutos,
            RelatoInicial = dto.RelatoInicial,
            SituacaoEnergetica = dto.SituacaoEnergetica,
            ChakraBase = dto.ChakraBase,
            ChakraSacral = dto.ChakraSacral,
            ChakraPlexo = dto.ChakraPlexo,
            ChakraCardiaco = dto.ChakraCardiaco,
            ChakraLaringeo = dto.ChakraLaringeo,
            ChakraFrontal = dto.ChakraFrontal,
            ChakraCoronario = dto.ChakraCoronario,
            Trabalho = dto.Trabalho,
            Familia = dto.Familia,
            Prosperidade = dto.Prosperidade,
            Espiritualidade = dto.Espiritualidade,
            RelacoesAfetivas = dto.RelacoesAfetivas,
            TratamentoExecutado = dto.TratamentoExecutado,
            OrientacaoParaCasa = dto.OrientacaoParaCasa,
            ObservacoesSessao = dto.ObservacoesSessao
        };

        var result = await _iaService.GerarAsync(input);

        return Ok(new GerarProntuarioIaResponseDto(
            result.TituloSugerido,
            result.ConteudoGerado,
            result.Modelo
        ));
    }

    [HttpGet]
    public async Task<IActionResult> Listar(int pacienteId)
    {
        var tenantId = UserContext.GetTenantId(User);

        var pacienteExiste = await _db.Pacientes
            .AsNoTracking()
            .AnyAsync(p => p.Id == pacienteId && p.TenantId == tenantId);

        if (!pacienteExiste)
            return NotFound("Paciente não encontrado.");

        var itens = await _db.Prontuarios
            .AsNoTracking()
            .Where(x => x.PacienteId == pacienteId && x.TenantId == tenantId)
            .OrderByDescending(x => x.DataSessao)
            .ThenByDescending(x => x.Id)
            .Select(x => new ProntuarioResponseDto(
                x.Id,
                x.PacienteId,
                x.Titulo,
                x.ConteudoFinal,
                x.ConteudoGeradoIa,
                x.Tipo,
                x.GeradoPorIa,
                x.ModeloIa,
                x.DataSessao,
                x.TerapiaAplicada,
                x.DuracaoMinutos,
                x.ObservacoesSessao,
                x.RelatoInicial,
                x.SituacaoEnergetica,
                x.ChakraBase,
                x.ChakraSacral,
                x.ChakraPlexo,
                x.ChakraCardiaco,
                x.ChakraLaringeo,
                x.ChakraFrontal,
                x.ChakraCoronario,
                x.Trabalho,
                x.Familia,
                x.Prosperidade,
                x.Espiritualidade,
                x.RelacoesAfetivas,
                x.TratamentoExecutado,
                x.OrientacaoParaCasa,
                x.DataCadastro,
                x.DataAtualizacao,
                x.CriadoPorUserId,
                x.CriadoPorNome
            ))
            .ToListAsync();

        return Ok(itens);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int pacienteId, int id)
    {
        var tenantId = UserContext.GetTenantId(User);

        var item = await _db.Prontuarios
            .AsNoTracking()
            .Where(x => x.Id == id && x.PacienteId == pacienteId && x.TenantId == tenantId)
            .Select(x => new ProntuarioResponseDto(
                x.Id,
                x.PacienteId,
                x.Titulo,
                x.ConteudoFinal,
                x.ConteudoGeradoIa,
                x.Tipo,
                x.GeradoPorIa,
                x.ModeloIa,
                x.DataSessao,
                x.TerapiaAplicada,
                x.DuracaoMinutos,
                x.ObservacoesSessao,
                x.RelatoInicial,
                x.SituacaoEnergetica,
                x.ChakraBase,
                x.ChakraSacral,
                x.ChakraPlexo,
                x.ChakraCardiaco,
                x.ChakraLaringeo,
                x.ChakraFrontal,
                x.ChakraCoronario,
                x.Trabalho,
                x.Familia,
                x.Prosperidade,
                x.Espiritualidade,
                x.RelacoesAfetivas,
                x.TratamentoExecutado,
                x.OrientacaoParaCasa,
                x.DataCadastro,
                x.DataAtualizacao,
                x.CriadoPorUserId,
                x.CriadoPorNome
            ))
            .FirstOrDefaultAsync();

        if (item is null)
            return NotFound("Prontuário não encontrado.");

        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Salvar(int pacienteId, [FromBody] SaveProntuarioRequestDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);
        var userId = UserContext.GetUserId(User);
        var userName = User.Identity?.Name ?? User.FindFirst("name")?.Value ?? "Usuário";

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == pacienteId && p.TenantId == tenantId);

        if (paciente is null)
            return NotFound("Paciente não encontrado.");

        if (string.IsNullOrWhiteSpace(dto.ConteudoFinal))
            return BadRequest("Conteúdo final do prontuário é obrigatório.");

        var entity = new ProntuarioRegistro
        {
            TenantId = tenantId,
            PacienteId = pacienteId,
            Titulo = dto.Titulo?.Trim(),
            ConteudoFinal = dto.ConteudoFinal.Trim(),
            ConteudoGeradoIa = dto.ConteudoGeradoIa,
            Tipo = "Prontuario",
            GeradoPorIa = dto.GeradoPorIa,
            ModeloIa = dto.ModeloIa,
            DataSessao = dto.DataSessao,
            TerapiaAplicada = dto.TerapiaAplicada,
            DuracaoMinutos = dto.DuracaoMinutos,
            ObservacoesSessao = dto.ObservacoesSessao,
            RelatoInicial = dto.RelatoInicial,
            SituacaoEnergetica = dto.SituacaoEnergetica,
            ChakraBase = dto.ChakraBase,
            ChakraSacral = dto.ChakraSacral,
            ChakraPlexo = dto.ChakraPlexo,
            ChakraCardiaco = dto.ChakraCardiaco,
            ChakraLaringeo = dto.ChakraLaringeo,
            ChakraFrontal = dto.ChakraFrontal,
            ChakraCoronario = dto.ChakraCoronario,
            Trabalho = dto.Trabalho,
            Familia = dto.Familia,
            Prosperidade = dto.Prosperidade,
            Espiritualidade = dto.Espiritualidade,
            RelacoesAfetivas = dto.RelacoesAfetivas,
            TratamentoExecutado = dto.TratamentoExecutado,
            OrientacaoParaCasa = dto.OrientacaoParaCasa,
            CriadoPorUserId = userId,
            CriadoPorNome = userName,
            DataCadastro = DateTime.UtcNow
        };

        _db.Prontuarios.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(entity));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int pacienteId, int id, [FromBody] SaveProntuarioRequestDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);

        var entity = await _db.Prontuarios
            .FirstOrDefaultAsync(x => x.Id == id && x.PacienteId == pacienteId && x.TenantId == tenantId);

        if (entity is null)
            return NotFound("Prontuário não encontrado.");

        if (string.IsNullOrWhiteSpace(dto.ConteudoFinal))
            return BadRequest("Conteúdo final do prontuário é obrigatório.");

        entity.Titulo = dto.Titulo?.Trim();
        entity.ConteudoFinal = dto.ConteudoFinal.Trim();
        entity.ConteudoGeradoIa = dto.ConteudoGeradoIa;
        entity.GeradoPorIa = dto.GeradoPorIa;
        entity.ModeloIa = dto.ModeloIa;
        entity.DataSessao = dto.DataSessao;
        entity.TerapiaAplicada = dto.TerapiaAplicada;
        entity.DuracaoMinutos = dto.DuracaoMinutos;
        entity.ObservacoesSessao = dto.ObservacoesSessao;
        entity.RelatoInicial = dto.RelatoInicial;
        entity.SituacaoEnergetica = dto.SituacaoEnergetica;
        entity.ChakraBase = dto.ChakraBase;
        entity.ChakraSacral = dto.ChakraSacral;
        entity.ChakraPlexo = dto.ChakraPlexo;
        entity.ChakraCardiaco = dto.ChakraCardiaco;
        entity.ChakraLaringeo = dto.ChakraLaringeo;
        entity.ChakraFrontal = dto.ChakraFrontal;
        entity.ChakraCoronario = dto.ChakraCoronario;
        entity.Trabalho = dto.Trabalho;
        entity.Familia = dto.Familia;
        entity.Prosperidade = dto.Prosperidade;
        entity.Espiritualidade = dto.Espiritualidade;
        entity.RelacoesAfetivas = dto.RelacoesAfetivas;
        entity.TratamentoExecutado = dto.TratamentoExecutado;
        entity.OrientacaoParaCasa = dto.OrientacaoParaCasa;
        entity.DataAtualizacao = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(ToResponse(entity));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int pacienteId, int id)
    {
        var tenantId = UserContext.GetTenantId(User);

        var entity = await _db.Prontuarios
            .FirstOrDefaultAsync(x => x.Id == id && x.PacienteId == pacienteId && x.TenantId == tenantId);

        if (entity is null)
            return NotFound("Prontuário não encontrado.");

        _db.Prontuarios.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static ProntuarioResponseDto ToResponse(ProntuarioRegistro x)
    {
        return new ProntuarioResponseDto(
            x.Id,
            x.PacienteId,
            x.Titulo,
            x.ConteudoFinal,
            x.ConteudoGeradoIa,
            x.Tipo,
            x.GeradoPorIa,
            x.ModeloIa,
            x.DataSessao,
            x.TerapiaAplicada,
            x.DuracaoMinutos,
            x.ObservacoesSessao,
            x.RelatoInicial,
            x.SituacaoEnergetica,
            x.ChakraBase,
            x.ChakraSacral,
            x.ChakraPlexo,
            x.ChakraCardiaco,
            x.ChakraLaringeo,
            x.ChakraFrontal,
            x.ChakraCoronario,
            x.Trabalho,
            x.Familia,
            x.Prosperidade,
            x.Espiritualidade,
            x.RelacoesAfetivas,
            x.TratamentoExecutado,
            x.OrientacaoParaCasa,
            x.DataCadastro,
            x.DataAtualizacao,
            x.CriadoPorUserId,
            x.CriadoPorNome
        );
    }
}