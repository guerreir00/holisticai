using HolisticAI.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "OwnerOrSecretary")]
public class IAController : ControllerBase
{
    private readonly IAService _iaService;

    public IAController(IAService iaService)
    {
        _iaService = iaService;
    }

    public record GerarProntuarioDto(
        string NomePaciente,
        string Terapia,
        int Duracao,
        string Relato,
        string EstadoEnergetico
    );

    [HttpPost("prontuario")]
    public async Task<IActionResult> GerarProntuario([FromBody] GerarProntuarioDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NomePaciente))
            return BadRequest("NomePaciente é obrigatório.");

        if (string.IsNullOrWhiteSpace(dto.Terapia))
            return BadRequest("Terapia é obrigatória.");

        if (dto.Duracao <= 0)
            return BadRequest("Duracao deve ser maior que zero.");

        var conteudo = await _iaService.GerarProntuarioAsync(
            dto.NomePaciente,
            dto.Terapia,
            dto.Duracao,
            dto.Relato ?? "",
            dto.EstadoEnergetico ?? ""
        );

        return Ok(new
        {
            conteudo
        });
    }
}