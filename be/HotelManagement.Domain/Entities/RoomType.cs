using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities
{
    /// <summary>
    /// Represents a room type in a hotel property
    /// </summary>
    public class RoomType : BaseEntity
    {
        /// <summary>
        /// The name of the room type
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// A description of the room type
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// The maximum number of occupants allowed in this room type
        /// </summary>
        public int MaxOccupancy { get; set; }
        
        /// <summary>
        /// The maximum number of adults allowed in this room type
        /// </summary>
        public int MaxAdults { get; set; }
        
        /// <summary>
        /// The maximum number of children allowed in this room type
        /// </summary>
        public int MaxChildren { get; set; }
        
        /// <summary>
        /// The base price for this room type
        /// </summary>
        public decimal BasePrice { get; set; }
        
        /// <summary>
        /// A comma-separated list of amenities available in this room type
        /// </summary>
        public string Amenities { get; set; }
        
        /// <summary>
        /// The ID of the hotel property this room type belongs to
        /// </summary>
        public Guid HotelPropertyId { get; set; }
        
        /// <summary>
        /// The hotel property this room type belongs to
        /// </summary>
        public virtual HotelProperty HotelProperty { get; set; }
        
        /// <summary>
        /// The rooms of this room type
        /// </summary>
        public virtual ICollection<Room> Rooms { get; set; }
        
        /// <summary>
        /// The rate plans associated with this room type
        /// </summary>
        public virtual ICollection<RatePlan> RatePlans { get; set; }
    }
}