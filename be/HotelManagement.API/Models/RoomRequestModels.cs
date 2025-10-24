using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HotelManagement.Domain.Enums;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating or updating a room
    /// </summary>
    public class RoomRequest
    {
        /// <summary>
        /// The room number or identifier
        /// </summary>
        [Required]
        public string RoomNumber { get; set; }

        /// <summary>
        /// The ID of the room type
        /// </summary>
        [Required]
        public Guid RoomTypeId { get; set; }

        /// <summary>
        /// The ID of the property this room belongs to
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The floor the room is on
        /// </summary>
        [Required]
        public int Floor { get; set; }

        /// <summary>
        /// The current status of the room
        /// </summary>
        [Required]
        public RoomStatus Status { get; set; }

        /// <summary>
        /// Any special features or notes about the room
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Whether the room is accessible for disabled guests
        /// </summary>
        public bool IsAccessible { get; set; }

        /// <summary>
        /// The maximum number of guests allowed in the room
        /// </summary>
        public int MaxOccupancy { get; set; }
    }

    /// <summary>
    /// Request model for updating a room's status
    /// </summary>
    public class RoomStatusUpdateRequest
    {
        /// <summary>
        /// The new status for the room
        /// </summary>
        [Required]
        public RoomStatus Status { get; set; }
    }

    /// <summary>
    /// Request model for creating or updating a room type
    /// </summary>
    public class RoomTypeRequest
    {
        /// <summary>
        /// The name of the room type
        /// </summary>
        [Required]
        public string Name { get; set; }

        /// <summary>
        /// The description of the room type
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The maximum number of guests for this room type
        /// </summary>
        [Required]
        public int Capacity { get; set; }

        /// <summary>
        /// The base price per night for this room type
        /// </summary>
        [Required]
        public decimal BasePrice { get; set; }

        /// <summary>
        /// List of amenities available in this room type
        /// </summary>
        public List<string> Amenities { get; set; }

        /// <summary>
        /// The ID of the property this room type belongs to
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }
    }
}