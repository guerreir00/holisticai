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
public class PacientesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PacientesController(ApplicationDbContext db)
    {
        _db = db;
    }

    // GET: api/pacientes
    [HttpGet]
    public async Task<ActionResult<List<Paciente>>> GetAll()
    {
        var tenantId = UserContext.GetTenantId(User);

        var pacientes = await _db.Pacientes
            .Where(p => p.TenantId == tenantId) // 🔒 FILTRO
            .OrderByDescending(p => p.Id)
            .ToListAsync();

        return Ok(pacientes);
    }

    // GET: api/pacientes/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Paciente>> GetById(int id)
    {
        var tenantId = UserContext.GetTenantId(User);

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (paciente is null)
            return NotFound();

        return Ok(paciente);
    }

    // POST
    [HttpPost]
    public async Task<ActionResult<Paciente>> Create([FromBody] Paciente input)
    {
        var tenantId = UserContext.GetTenantId(User);

        input.Id = 0;
        input.TenantId = tenantId; // 🔥 MULTI-TENANT
        input.DataCadastro = DateTime.UtcNow;

        _db.Pacientes.Add(input);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = input.Id }, input);
    }

    // PUT
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Paciente input)
    {
        var tenantId = UserContext.GetTenantId(User);

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (paciente is null)
            return NotFound();

        paciente.Nome = input.Nome;
        paciente.Email = input.Email;
        paciente.Telefone = input.Telefone;
        paciente.DataNascimento = input.DataNascimento;
        paciente.Observacoes = input.Observacoes;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = UserContext.GetTenantId(User);

        var paciente = await _db.Pacientes
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        if (paciente is null)
            return NotFound();

        _db.Pacientes.Remove(paciente);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
