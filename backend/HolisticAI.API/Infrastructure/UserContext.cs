using System.Security.Claims;

namespace HolisticAI.API.Infrastructure;

public static class UserContext
{
    public static Guid GetTenantId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst("tenantId");
        if (claim == null)
            throw new Exception("TenantId não encontrado no token.");

        return Guid.Parse(claim.Value);
    }
}
