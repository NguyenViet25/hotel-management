using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Repositories.Interfaces;
using HotelManagement.Services.Interfaces;
using HotelManagement.Services.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using System.Net.Http;
using System.Net.Http.Json;

namespace HotelManagement.Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly JwtSettings _jwtSettings;
        private readonly GoogleOAuthSettings _googleSettings;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(
            IUnitOfWork unitOfWork,
            IOptions<JwtSettings> jwtSettings,
            IOptions<GoogleOAuthSettings> googleSettings,
            IHttpClientFactory httpClientFactory)
        {
            _unitOfWork = unitOfWork;
            _jwtSettings = jwtSettings.Value;
            _googleSettings = googleSettings.Value;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<(bool Success, string Token, string RefreshToken, User User)> LoginAsync(string username, string password)
        {
            // Find user by username or email
            var user = await _unitOfWork.Repository<User>().GetFirstOrDefaultAsync(
                predicate: u => u.Username == username || u.Email == username,
                disableTracking: false);

            if (user == null || !VerifyPasswordHash(password, user.PasswordHash))
            {
                return (false, null, null, null);
            }

            if (!user.IsActive)
            {
                return (false, null, null, null);
            }

            // Update last login date
            user.LastLoginDate = DateTime.UtcNow;
            await _unitOfWork.Repository<User>().UpdateAsync(user);

            // Generate JWT token and refresh token
            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            // Save refresh token to user
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);
            await _unitOfWork.Repository<User>().UpdateAsync(user);

            return (true, token, refreshToken, user);
        }

        public async Task<(bool Success, string Message)> RegisterAsync(string username, string email, string password, string firstName, string lastName)
        {
            // Check if username or email already exists
            var existingUser = await _unitOfWork.Repository<User>().GetFirstOrDefaultAsync(
                predicate: u => u.Username == username || u.Email == email);

            if (existingUser != null)
            {
                return (false, "Username or email already exists");
            }

            // Create new user
            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = HashPassword(password),
                FirstName = firstName,
                LastName = lastName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<User>().AddAsync(user);

            // Assign default user role
            var defaultRole = await _unitOfWork.Repository<Role>().GetFirstOrDefaultAsync(
                predicate: r => r.Name == UserRoleEnum.Receptionist.ToString());

            if (defaultRole == null)
            {
                // Create default role if it doesn't exist
                defaultRole = new Role
                {
                    Name = UserRoleEnum.Receptionist.ToString(),
                    Description = "Default receptionist role",
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Repository<Role>().AddAsync(defaultRole);
            }
            
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = defaultRole.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<UserRole>().AddAsync(userRole);

            return (true, "User registered successfully");
        }

        public async Task<(bool Success, string Token, string RefreshToken)> RefreshTokenAsync(string token, string refreshToken)
        {
            var principal = GetPrincipalFromExpiredToken(token);
            if (principal == null)
            {
                return (false, null, null);
            }

            var userId = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return (false, null, null);
            }

            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userGuid);
            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return (false, null, null);
            }

            var newToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);
            await _unitOfWork.Repository<User>().UpdateAsync(user);

            return (true, newToken, newRefreshToken);
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return false;
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out var validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<(bool Success, string Message)> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return (false, "Invalid user ID");
            }

            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userGuid);
            if (user == null)
            {
                return (false, "User not found");
            }

            if (!VerifyPasswordHash(currentPassword, user.PasswordHash))
            {
                return (false, "Current password is incorrect");
            }

            user.PasswordHash = HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<User>().UpdateAsync(user);

            return (true, "Password changed successfully");
        }

        public async Task<(bool Success, string Message)> ForgotPasswordAsync(string email)
        {
            var user = await _unitOfWork.Repository<User>().GetFirstOrDefaultAsync(
                predicate: u => u.Email == email);

            if (user == null)
            {
                return (false, "User not found");
            }

            // In a real application, generate a password reset token and send an email
            // For this implementation, we'll just return a success message
            return (true, "Password reset instructions sent to your email");
        }

        public async Task<(bool Success, string Message)> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _unitOfWork.Repository<User>().GetFirstOrDefaultAsync(
                predicate: u => u.Email == email);

            if (user == null)
            {
                return (false, "User not found");
            }

            // In a real application, validate the token
            // For this implementation, we'll just reset the password
            user.PasswordHash = HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<User>().UpdateAsync(user);

            return (true, "Password reset successfully");
        }

        public async Task<(bool Success, string Message)> VerifyEmailAsync(string userId, string token)
        {
            // In a real application, validate the token and mark the email as verified
            // For this implementation, we'll just return a success message
            return (true, "Email verified successfully");
        }

        public async Task<(bool Success, string Message)> SendVerificationEmailAsync(string userId)
        {
            // In a real application, generate a verification token and send an email
            // For this implementation, we'll just return a success message
            return (true, "Verification email sent");
        }

        public async Task<(bool Success, string Token, string RefreshToken)> GoogleLoginAsync(string credential)
        {
            try
            {
                // Validate the Google ID token
                // In a real application, use Google's API to validate the token
                // For this implementation, we'll assume the token is valid and extract the email

                // Parse the JWT token to get the email
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(credential) as JwtSecurityToken;
                var email = jsonToken?.Claims.FirstOrDefault(claim => claim.Type == "email")?.Value;

                if (string.IsNullOrEmpty(email))
                {
                    return (false, null, null);
                }

                // Check if user exists
                var user = await _unitOfWork.Repository<User>().GetFirstOrDefaultAsync(
                    predicate: u => u.Email == email,
                    disableTracking: false);

                if (user == null)
                {
                    // Create new user from Google account
                    var firstName = jsonToken?.Claims.FirstOrDefault(claim => claim.Type == "given_name")?.Value ?? "";
                    var lastName = jsonToken?.Claims.FirstOrDefault(claim => claim.Type == "family_name")?.Value ?? "";
                    var name = jsonToken?.Claims.FirstOrDefault(claim => claim.Type == "name")?.Value ?? "";

                    user = new User
                    {
                        Email = email,
                        Username = email,
                        FirstName = firstName,
                        LastName = lastName,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _unitOfWork.Repository<User>().AddAsync(user);

                    // Assign default user role
                    var defaultRole = await _unitOfWork.Repository<Role>().GetFirstOrDefaultAsync(
                        predicate: r => r.Name == UserRoleEnum.Receptionist.ToString());

                    if (defaultRole == null)
                    {
                        // Create default role if it doesn't exist
                        defaultRole = new Role
                        {
                            Name = UserRoleEnum.Receptionist.ToString(),
                            Description = "Default receptionist role",
                            CreatedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Repository<Role>().AddAsync(defaultRole);
                    }

                    var userRole = new UserRole
                    {
                        UserId = user.Id,
                        RoleId = defaultRole.Id,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _unitOfWork.Repository<UserRole>().AddAsync(userRole);
                }

                // Update last login date
                user.LastLoginDate = DateTime.UtcNow;
                await _unitOfWork.Repository<User>().UpdateAsync(user);

                // Generate JWT token and refresh token
                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                // Save refresh token to user
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);
                await _unitOfWork.Repository<User>().UpdateAsync(user);

                return (true, token, refreshToken);
            }
            catch (Exception)
            {
                return (false, null, null);
            }
        }

        #region Helper Methods

        private string HashPassword(string password)
        {
            using (var hmac = new HMACSHA512())
            {
                var salt = hmac.Key;
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

                // Combine salt and hash
                var hashBytes = new byte[salt.Length + hash.Length];
                Array.Copy(salt, 0, hashBytes, 0, salt.Length);
                Array.Copy(hash, 0, hashBytes, salt.Length, hash.Length);

                return Convert.ToBase64String(hashBytes);
            }
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            var hashBytes = Convert.FromBase64String(storedHash);

            // Extract salt (first 64 bytes)
            var salt = new byte[64];
            Array.Copy(hashBytes, 0, salt, 0, 64);

            // Create hash with the same salt
            using (var hmac = new HMACSHA512(salt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

                // Compare computed hash with stored hash
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != hashBytes[i + 64])
                    {
                        return false;
                    }
                }
            }

            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            // Get user roles
            var userRoles = _unitOfWork.Repository<HotelManagement.Domain.Entities.UserRole>().GetComplexAsync(
                predicate: ur => ur.UserId == user.Id,
                includes: new List<System.Linq.Expressions.Expression<Func<HotelManagement.Domain.Entities.UserRole, object>>> { ur => ur.Role }).Result;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Add roles as claims
            foreach (var userRole in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = false, // Don't validate lifetime for refresh token
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var validatedToken);
                if (validatedToken is not JwtSecurityToken jwtSecurityToken ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch
            {
                return null;
            }
        }

        #endregion
    }
}