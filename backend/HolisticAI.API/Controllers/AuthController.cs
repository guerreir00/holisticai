using HolisticAI.API.Data;
using HolisticAI.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // ==========================
    // POST /api/auth/register
    // Cria Tenant + User Owner
    // ==========================
    public record RegisterDto(string TenantNome, string Nome, string Email, string Password);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TenantNome)) return BadRequest("TenantNome é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Nome)) return BadRequest("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Email)) return BadRequest("Email é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest("Password deve ter no mínimo 6 caracteres.");

        var email = dto.Email.Trim().ToLowerInvariant();

        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == email);
        if (exists) return BadRequest("Email já está em uso.");

        // 1) cria tenant
        var tenant = new Tenant
        {
            Nome = dto.TenantNome.Trim()
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync(); // garante tenant.Id

        // 2) cria user owner
        var user = new User
        {
            TenantId = tenant.Id,
            Nome = dto.Nome.Trim(),
            Email = email,
            Role = "Owner",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // 3) retorna já logado
        var token = GenerateJwt(user);

        return Ok(new
        {
            token,
            user = new { user.Id, user.Nome, user.Email, user.Role, user.TenantId },
            tenant = new { tenant.Id, tenant.Nome }
        });
    }

    // ==========================
    // POST /api/auth/login
    // ==========================
    public record LoginDto(string Email, string Password);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email)) return BadRequest("Email é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Password)) return BadRequest("Password é obrigatório.");

        var email = dto.Email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user is null) return Unauthorized("Usuário ou senha inválidos.");

        var ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!ok) return Unauthorized("Usuário ou senha inválidos.");

        var token = GenerateJwt(user);

        return Ok(new
        {
            token,
            user = new { user.Id, user.Nome, user.Email, user.Role, user.TenantId }
        });
    }

    private string GenerateJwt(User user)
    {
        var jwtKey = _config["Jwt:Key"];
        var jwtIssuer = _config["Jwt:Issuer"];
        var jwtAudience = _config["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey))
            throw new Exception("Jwt:Key não configurado no appsettings.json");

        var claims = new List<Claim>
        {
            new Claim("userId", user.Id.ToString()),
            new Claim("tenantId", user.TenantId.ToString()),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(ClaimTypes.Name, user.Nome),
            new Claim(ClaimTypes.Email, user.Email),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
