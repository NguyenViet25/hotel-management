using System;
using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities
{
    /// <summary>
    /// Represents an amenity associated with a hotel property
    /// </summary>
    public class PropertyAmenity : BaseEntity
    {
        /// <summary>
        /// Gets or sets the name of the amenity
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// Gets or sets the description of the amenity
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// Gets or sets the ID of the hotel property this amenity belongs to
        /// </summary>
        public Guid PropertyId { get; set; }
        
        /// <summary>
        /// Navigation property for the associated hotel property
        /// </summary>
        public virtual HotelProperty Property { get; set; }
    }
}