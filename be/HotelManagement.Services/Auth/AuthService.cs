using HotelManagement.Domain.Entities;
using HotelManagement.Repository;
using HotelManagement.Services.Admin.Users.Dtos;
using HotelManagement.Services.Auth.Dtos;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelManagement.Services.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ApplicationDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly Email.IEmailService _emailService;

    public AuthService(UserManager<AppUser> userManager, ITokenService tokenService, ApplicationDbContext dbContext, Email.IEmailService emailService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _db = dbContext;
        _emailService = emailService;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByNameAsync(request.Username) ?? await _userManager.FindByEmailAsync(request.Username);
        if (user is null) return new LoginResponseDto(false, null, null, null);


        if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.Now)
        {
            return new LoginResponseDto(false, null, user.LockoutEnd, null);
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid) return new LoginResponseDto(false, null, null, null);

        var requires2fa = await _userManager.GetTwoFactorEnabledAsync(user);
        if (requires2fa && string.IsNullOrEmpty(request.TwoFactorCode))
        {
            // Typically we would generate & send OTP here if provider is email/sms
            return new LoginResponseDto(true, null, null, null);
        }

        if (requires2fa && !string.IsNullOrEmpty(request.TwoFactorCode))
        {
            var provider = request.TwoFactorProvider ?? TokenOptions.DefaultAuthenticatorProvider;
            var valid2fa = await _userManager.VerifyTwoFactorTokenAsync(user, provider, request.TwoFactorCode);
            if (!valid2fa) return new LoginResponseDto(true, null, null, null);
        }


        var propertyRoles = await _db.UserPropertyRoles.AsNoTracking()
            .Select(pr => new UserPropertyRoleDto(pr.UserId, pr.HotelId, pr.Role, "")).ToListAsync();

        var hotel = propertyRoles.Where(x => x.Id == user.Id).FirstOrDefault();
        var hotelId = hotel?.HotelId.ToString() ?? string.Empty;
        var roles = await _userManager.GetRolesAsync(user);

        var extraClaims = new[]
        {
            new Claim("twoFactor", (await _userManager.GetTwoFactorEnabledAsync(user)).ToString()),
            new Claim("hotelId", hotelId)    
        };

        var token = _tokenService.CreateAccessToken(
            user.Id,
            user.UserName!,
            roles,
            extraClaims
        );

        return new LoginResponseDto(false, token, null, UserMapper.MapToResponseAsync(user, roles.ToList(), hotel?.HotelId));
    }



    public Task LogoutAsync(string userName)
    {
        // Stateless JWT logout is generally client-side; here we could add audit log or token blacklist.
        return Task.CompletedTask;
    }

    public async Task<bool> SendForgotPasswordOtpAsync(ForgotPasswordRequestDto request)
    {
        var user = await _userManager.FindByNameAsync(request.UsernameOrEmail) ?? await _userManager.FindByEmailAsync(request.UsernameOrEmail);
        if (user is null) return false;

        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        if (string.IsNullOrWhiteSpace(code)) return false;
        var sent = await _emailService.SendForgotPasswordEmailAsync(user.Email!, user.UserName, code);
        return sent;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        var user = await _userManager.FindByNameAsync(request.Username) ?? await _userManager.FindByEmailAsync(request.Username);
        if (user is null) return false;
        var result = await _userManager.ResetPasswordAsync(user, request.OtpCode, request.NewPassword);
        return result.Succeeded;
    }
}
