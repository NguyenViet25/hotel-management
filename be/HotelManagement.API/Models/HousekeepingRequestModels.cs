using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HotelManagement.Domain.Enums;
using HotelManagement.Services.Interfaces;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for updating room cleaning status
    /// </summary>
    public class UpdateRoomStatusRequest
    {
        /// <summary>
        /// The new cleaning status for the room
        /// </summary>
        [Required]
        public RoomCleaningStatus CleaningStatus { get; set; }

        /// <summary>
        /// Optional notes about the cleaning status update
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// Request model for recording minibar consumption
    /// </summary>
    public class MinibarConsumptionRequest
    {
        /// <summary>
        /// List of minibar items consumed
        /// </summary>
        [Required]
        public List<MinibarItem> Items { get; set; }

        /// <summary>
        /// Optional notes about the minibar consumption
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// Request model for assigning housekeeping tasks
    /// </summary>
    public class AssignTasksRequest
    {
        /// <summary>
        /// The ID of the property where tasks are being assigned
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The date for which tasks are being assigned
        /// </summary>
        [Required]
        public DateTime Date { get; set; }

        /// <summary>
        /// The list of task assignments
        /// </summary>
        [Required]
        public List<TaskAssignment> Assignments { get; set; }
    }
}