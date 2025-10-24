using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for user login
    /// </summary>
    public class LoginRequest
    {
        /// <summary>
        /// The username for login
        /// </summary>
        [Required]
        public string Username { get; set; }

        /// <summary>
        /// The password for login
        /// </summary>
        [Required]
        public string Password { get; set; }
    }

    /// <summary>
    /// Request model for user registration
    /// </summary>
    public class RegisterRequest
    {
        /// <summary>
        /// The username for the new user
        /// </summary>
        [Required]
        public string Username { get; set; }

        /// <summary>
        /// The email address for the new user
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        /// <summary>
        /// The password for the new user
        /// </summary>
        [Required]
        public string Password { get; set; }

        /// <summary>
        /// The first name of the new user
        /// </summary>
        [Required]
        public string FirstName { get; set; }

        /// <summary>
        /// The last name of the new user
        /// </summary>
        [Required]
        public string LastName { get; set; }
    }

    /// <summary>
    /// Request model for refreshing an authentication token
    /// </summary>
    public class RefreshTokenRequest
    {
        /// <summary>
        /// The JWT token to refresh
        /// </summary>
        [Required]
        public string Token { get; set; }

        /// <summary>
        /// The refresh token
        /// </summary>
        [Required]
        public string RefreshToken { get; set; }
    }

    /// <summary>
    /// Request model for Google OAuth login
    /// </summary>
    public class GoogleLoginRequest
    {
        /// <summary>
        /// The Google credential token
        /// </summary>
        [Required]
        public string Credential { get; set; }
    }

    /// <summary>
    /// Request model for changing a user's password
    /// </summary>
    public class ChangePasswordRequest
    {
        /// <summary>
        /// The user's current password
        /// </summary>
        [Required]
        public string CurrentPassword { get; set; }

        /// <summary>
        /// The user's new password
        /// </summary>
        [Required]
        public string NewPassword { get; set; }
    }

    /// <summary>
    /// Request model for initiating a forgot password process
    /// </summary>
    public class ForgotPasswordRequest
    {
        /// <summary>
        /// The email address of the user who forgot their password
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    /// <summary>
    /// Request model for resetting a password
    /// </summary>
    public class ResetPasswordRequest
    {
        /// <summary>
        /// The email address of the user
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        /// <summary>
        /// The password reset token
        /// </summary>
        [Required]
        public string Token { get; set; }

        /// <summary>
        /// The new password
        /// </summary>
        [Required]
        public string NewPassword { get; set; }
    }
}