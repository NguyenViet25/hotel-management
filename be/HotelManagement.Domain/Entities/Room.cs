using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    /// <summary>
    /// Represents a room in a hotel property
    /// </summary>
    public class Room : BaseEntity
    {
        /// <summary>
        /// The room number
        /// </summary>
        public string RoomNumber { get; set; } = null!;
        
        /// <summary>
        /// The floor the room is on
        /// </summary>
        public int Floor { get; set; }
        
        /// <summary>
        /// The ID of the room type
        /// </summary>
        public Guid RoomTypeId { get; set; }
        
        /// <summary>
        /// The ID of the hotel property the room belongs to
        /// </summary>
        public Guid PropertyId { get; set; }
        
        /// <summary>
        /// The current status of the room
        /// </summary>
        public RoomStatus Status { get; set; }
        
        /// <summary>
        /// The current cleaning status of the room
        /// </summary>
        public RoomCleaningStatus CleaningStatus { get; set; }
        
        /// <summary>
        /// A description of the room
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// Additional notes about the room
        /// </summary>
        public string Notes { get; set; }
        
        /// <summary>
        /// The room type
        /// </summary>
        public virtual RoomType RoomType { get; set; }
        
        /// <summary>
        /// The hotel property the room belongs to
        /// </summary>
        public virtual HotelProperty Property { get; set; }
        
        /// <summary>
        /// The bookings associated with this room
        /// </summary>
        public virtual ICollection<Booking> Bookings { get; set; }
        
        /// <summary>
        /// The maintenance tickets associated with this room
        /// </summary>
        public virtual ICollection<MaintenanceTicket> MaintenanceTickets { get; set; }
    }
}