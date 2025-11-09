using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HotelManagement.Services.Auth;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string CreateAccessToken(Guid userId, string userName, IEnumerable<string> roles, IEnumerable<Claim>? additionalClaims = null, TimeSpan? lifetime = null)
    {
        var key = _config["Jwt:Key"] ?? "dev-secret-key-change-me";
        var issuer = _config["Jwt:Issuer"] ?? "HotelManagement";
        var audience = _config["Jwt:Audience"] ?? "HotelManagementAudience";
        var expires = DateTime.UtcNow.Add(lifetime ?? TimeSpan.FromHours(1));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, userName),
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, userName)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
        if (additionalClaims != null) claims.AddRange(additionalClaims);

        var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}