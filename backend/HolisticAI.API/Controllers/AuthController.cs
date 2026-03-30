using HolisticAI.API.Data;
using HolisticAI.API.Infrastructure;
using HolisticAI.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace HolisticAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JwtSettings _jwt;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        ApplicationDbContext db,
        IOptions<JwtSettings> jwtOptions,
        IWebHostEnvironment environment)
    {
        _db = db;
        _jwt = jwtOptions.Value;
        _environment = environment;

        if (string.IsNullOrWhiteSpace(_jwt.Key))
            throw new InvalidOperationException("Jwt:Key não configurado (User Secrets).");
        if (string.IsNullOrWhiteSpace(_jwt.Issuer))
            throw new InvalidOperationException("Jwt:Issuer não configurado.");
        if (string.IsNullOrWhiteSpace(_jwt.Audience))
            throw new InvalidOperationException("Jwt:Audience não configurado.");
        if (_jwt.ExpHours <= 0) _jwt.ExpHours = 8;
    }

    public record RegisterDto(string TenantNome, string Nome, string Email, string Password);

    public record RegisterTherapistDto(
        string NomeCompleto,
        string EmailProfissional,
        string Senha,
        string ConfirmarSenha,
        string Especialidade,
        string? RegistroProfissional,
        bool AceitouTermos
    );

    public record LoginDto(string Email, string Password);

    public record ForgotPasswordDto(string Email);

    public record ResetPasswordDto(string Token, string NovaSenha, string ConfirmarNovaSenha);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TenantNome))
            return BadRequest(new { message = "TenantNome é obrigatório." });

        if (string.IsNullOrWhiteSpace(dto.Nome))
            return BadRequest(new { message = "Nome é obrigatório." });

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email é obrigatório." });

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest(new { message = "Password deve ter no mínimo 6 caracteres." });

        var email = dto.Email.Trim().ToLowerInvariant();

        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == email);
        if (exists)
            return BadRequest(new { message = "Email já está em uso." });

        var tenant = new Tenant
        {
            Nome = dto.TenantNome.Trim()
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync();

        var user = new User
        {
            TenantId = tenant.Id,
            Nome = dto.Nome.Trim(),
            Email = email,
            Role = "Owner",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Ativo = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwt(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.Nome,
                user.Email,
                user.Role,
                user.TenantId
            },
            tenant = new
            {
                tenant.Id,
                tenant.Nome
            }
        });
    }

    [HttpPost("register-therapist")]
    public async Task<IActionResult> RegisterTherapist([FromBody] RegisterTherapistDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NomeCompleto))
            return BadRequest(new { message = "Nome completo é obrigatório." });

        if (string.IsNullOrWhiteSpace(dto.EmailProfissional))
            return BadRequest(new { message = "E-mail profissional é obrigatório." });

        if (string.IsNullOrWhiteSpace(dto.Senha) || dto.Senha.Length < 6)
            return BadRequest(new { message = "A senha deve ter no mínimo 6 caracteres." });

        if (string.IsNullOrWhiteSpace(dto.ConfirmarSenha))
            return BadRequest(new { message = "A confirmação de senha é obrigatória." });

        if (dto.Senha != dto.ConfirmarSenha)
            return BadRequest(new { message = "As senhas não coincidem." });

        if (string.IsNullOrWhiteSpace(dto.Especialidade))
            return BadRequest(new { message = "Especialidade é obrigatória." });

        if (!dto.AceitouTermos)
            return BadRequest(new { message = "Você precisa aceitar os termos para continuar." });

        var email = dto.EmailProfissional.Trim().ToLowerInvariant();

        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == email);
        if (exists)
            return BadRequest(new { message = "Já existe uma conta cadastrada com este e-mail." });

        var tenant = new Tenant
        {
            Nome = dto.NomeCompleto.Trim()
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync();

        var user = new User
        {
            TenantId = tenant.Id,
            Nome = dto.NomeCompleto.Trim(),
            Email = email,
            Role = "Owner",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
            Ativo = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var professionalProfile = new ProfessionalProfile
        {
            UserId = user.Id,
            Especialidade = dto.Especialidade.Trim(),
            RegistroProfissional = string.IsNullOrWhiteSpace(dto.RegistroProfissional)
                ? null
                : dto.RegistroProfissional.Trim(),
            AceitouTermos = dto.AceitouTermos,
            AceitouTermosEm = DateTime.UtcNow
        };

        _db.ProfessionalProfiles.Add(professionalProfile);
        await _db.SaveChangesAsync();

        var token = GenerateJwt(user);

        return Ok(new
        {
            message = "Conta criada com sucesso.",
            token,
            user = new
            {
                user.Id,
                user.Nome,
                user.Email,
                user.Role,
                user.TenantId
            },
            tenant = new
            {
                tenant.Id,
                tenant.Nome
            },
            professionalProfile = new
            {
                professionalProfile.Id,
                professionalProfile.Especialidade,
                professionalProfile.RegistroProfissional,
                professionalProfile.AceitouTermos,
                professionalProfile.AceitouTermosEm
            }
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "E-mail é obrigatório." });

        var email = dto.Email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.Ativo);

        if (user is null)
        {
            return Ok(new
            {
                message = "Se existir uma conta com esse e-mail, enviaremos as instruções de recuperação."
            });
        }

        var activeTokens = await _db.PasswordResetTokens
            .Where(x => x.UserId == user.Id && x.Ativo && x.UtilizadoEm == null)
            .ToListAsync();

        foreach (var item in activeTokens)
        {
            item.Ativo = false;
        }

        var rawToken = GenerateSecureToken();
        var tokenHash = HashToken(rawToken);

        var resetToken = new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiraEm = DateTime.UtcNow.AddHours(2),
            CriadoEm = DateTime.UtcNow,
            Ativo = true
        };

        _db.PasswordResetTokens.Add(resetToken);
        await _db.SaveChangesAsync();

        var resetLink = $"http://localhost:5173/redefinir-senha?token={Uri.EscapeDataString(rawToken)}";

        if (_environment.IsDevelopment())
        {
            return Ok(new
            {
                message = "Solicitação de recuperação processada com sucesso.",
                resetLink,
                resetToken = rawToken
            });
        }

        return Ok(new
        {
            message = "Se existir uma conta com esse e-mail, enviaremos as instruções de recuperação."
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token))
            return BadRequest(new { message = "Token é obrigatório." });

        if (string.IsNullOrWhiteSpace(dto.NovaSenha) || dto.NovaSenha.Length < 6)
            return BadRequest(new { message = "A nova senha deve ter no mínimo 6 caracteres." });

        if (string.IsNullOrWhiteSpace(dto.ConfirmarNovaSenha))
            return BadRequest(new { message = "A confirmação da nova senha é obrigatória." });

        if (dto.NovaSenha != dto.ConfirmarNovaSenha)
            return BadRequest(new { message = "As senhas não coincidem." });

        var tokenHash = HashToken(dto.Token);

        var resetToken = await _db.PasswordResetTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x =>
                x.TokenHash == tokenHash &&
                x.Ativo &&
                x.UtilizadoEm == null);

        if (resetToken is null)
            return BadRequest(new { message = "Token inválido ou já utilizado." });

        if (resetToken.ExpiraEm < DateTime.UtcNow)
            return BadRequest(new { message = "Token expirado." });

        if (resetToken.User is null)
            return BadRequest(new { message = "Usuário não encontrado para este token." });

        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
        resetToken.Ativo = false;
        resetToken.UtilizadoEm = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Senha redefinida com sucesso."
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email é obrigatório." });

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Password é obrigatório." });

        var email = dto.Email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user is null)
            return Unauthorized(new { message = "Usuário ou senha inválidos." });

        if (!user.Ativo)
            return Unauthorized(new { message = "Usuário inativo." });

        var ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!ok)
            return Unauthorized(new { message = "Usuário ou senha inválidos." });

        var token = GenerateJwt(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.Nome,
                user.Email,
                user.Role,
                user.TenantId
            }
        });
    }

    private string GenerateJwt(User user)
    {
        var claims = new List<Claim>
        {
            new Claim("userId", user.Id.ToString()),
            new Claim("tenantId", user.TenantId.ToString()),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(ClaimTypes.Name, user.Nome),
            new Claim(ClaimTypes.Email, user.Email),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_jwt.ExpHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    private static string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes);
    }
}