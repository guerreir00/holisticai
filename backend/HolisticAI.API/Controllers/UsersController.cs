using HolisticAI.API.Data;
using HolisticAI.API.Infrastructure;
using HolisticAI.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "OwnerOnly")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public UsersController(ApplicationDbContext db)
    {
        _db = db;
    }

    public record CreateUserDto(string Nome, string Email, string Password, string Role);
    public record SetActiveDto(bool Ativo);
    public record ResetPasswordDto(string NewPassword);

    // GET /api/users
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tenantId = UserContext.GetTenantId(User);

        var users = await _db.Users
            .Where(u => u.TenantId == tenantId)
            .OrderByDescending(u => u.Id)
            .Select(u => new
            {
                u.Id,
                u.Nome,
                u.Email,
                u.Role,
                u.Ativo,
                u.DataCriacao
            })
            .ToListAsync();

        return Ok(users);
    }

    // POST /api/users  (cria Secretary)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome)) return BadRequest("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Email)) return BadRequest("Email é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest("Password deve ter no mínimo 6 caracteres.");

        var tenantId = UserContext.GetTenantId(User);
        var email = dto.Email.Trim().ToLowerInvariant();

        var role = string.IsNullOrWhiteSpace(dto.Role) ? "Secretary" : dto.Role.Trim();

        if (role != "Secretary" && role != "Owner")
            return BadRequest("Role inválida. Use Owner ou Secretary.");

        // Segurança: esse endpoint NÃO cria Owner (Owner só via /auth/register)
        if (role == "Owner")
            return BadRequest("Criação de Owner não permitida por este endpoint.");

        // ✅ Email único por TENANT (mais correto pra SaaS)
        var exists = await _db.Users.AnyAsync(u => u.TenantId == tenantId && u.Email.ToLower() == email);
        if (exists) return BadRequest("Email já está em uso neste tenant.");

        var user = new User
        {
            TenantId = tenantId,
            Nome = dto.Nome.Trim(),
            Email = email,
            Role = role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Ativo = true,
            DataCriacao = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.Nome,
            user.Email,
            user.Role,
            user.Ativo,
            user.DataCriacao
        });
    }

    // PATCH /api/users/{id}/active  (ativar/desativar)
    [HttpPatch("{id:int}/active")]
    public async Task<IActionResult> SetActive(int id, [FromBody] SetActiveDto dto)
    {
        var tenantId = UserContext.GetTenantId(User);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
        if (user is null) return NotFound();

        // opcional: impedir desativar a si mesmo (Owner) aqui
        // var currentUserId = int.Parse(User.FindFirst("userId")!.Value);
        // if (user.Id == currentUserId) return BadRequest("Você não pode desativar seu próprio usuário.");

        user.Ativo = dto.Ativo;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // PATCH /api/users/{id}/reset-password  (reset senha sem email, MVP)
    [HttpPatch("{id:int}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            return BadRequest("NewPassword deve ter no mínimo 6 caracteres.");

        var tenantId = UserContext.GetTenantId(User);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId);
        if (user is null) return NotFound();

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}