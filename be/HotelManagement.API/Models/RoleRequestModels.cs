using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating a new role
    /// </summary>
    public class CreateRoleRequest
    {
        /// <summary>
        /// The name of the role
        /// </summary>
        [Required]
        public string Name { get; set; }

        /// <summary>
        /// The description of the role
        /// </summary>
        public string? Description { get; set; }
    }

    /// <summary>
    /// Request model for updating an existing role
    /// </summary>
    public class UpdateRoleRequest
    {
        /// <summary>
        /// The updated description of the role
        /// </summary>
        public string? Description { get; set; }
    }
}