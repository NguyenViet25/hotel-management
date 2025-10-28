using System.Security.Claims;

namespace HotelManagement.Services.Auth;

public interface ITokenService
{
    string CreateAccessToken(Guid userId, string userName, IEnumerable<string> roles, IEnumerable<Claim>? additionalClaims = null, TimeSpan? lifetime = null);
}