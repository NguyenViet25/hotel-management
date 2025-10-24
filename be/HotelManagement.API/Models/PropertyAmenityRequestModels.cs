using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating or updating a property amenity
    /// </summary>
    public class PropertyAmenityRequest
    {
        /// <summary>
        /// The ID of the property this amenity belongs to
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The name of the amenity
        /// </summary>
        [Required]
        public string Name { get; set; }

        /// <summary>
        /// The description of the amenity
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The category of the amenity (General, Room, Recreational, etc.)
        /// </summary>
        [Required]
        public string Category { get; set; }

        /// <summary>
        /// Whether the amenity is currently active
        /// </summary>
        public bool IsActive { get; set; }
    }
}