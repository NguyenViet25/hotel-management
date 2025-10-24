using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating a new user
    /// </summary>
    public class CreateUserRequest
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

        /// <summary>
        /// The role to assign to the new user
        /// </summary>
        [Required]
        public string Role { get; set; }
    }

    /// <summary>
    /// Request model for updating an existing user
    /// </summary>
    public class UpdateUserRequest
    {
        /// <summary>
        /// The updated email address for the user
        /// </summary>
        [EmailAddress]
        public string Email { get; set; }

        /// <summary>
        /// The updated first name for the user
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// The updated last name for the user
        /// </summary>
        public string LastName { get; set; }
    }

    /// <summary>
    /// Request model for assigning a role to a user
    /// </summary>
    public class AssignRoleRequest
    {
        /// <summary>
        /// The role to assign to the user
        /// </summary>
        [Required]
        public string Role { get; set; }
    }
}