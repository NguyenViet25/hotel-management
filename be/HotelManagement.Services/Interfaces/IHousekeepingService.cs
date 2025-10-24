using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Service interface for managing housekeeping operations
    /// </summary>
    public interface IHousekeepingService
    {
        /// <summary>
        /// Updates the cleaning status of a room
        /// </summary>
        Task<Room> UpdateRoomCleaningStatusAsync(
            Guid roomId,
            RoomCleaningStatus cleaningStatus,
            string notes);

        /// <summary>
        /// Records minibar consumption for a room
        /// </summary>
        Task<object> RecordMinibarConsumptionAsync(
            Guid roomId,
            List<MinibarItem> items,
            string notes);

        /// <summary>
        /// Gets rooms by cleaning status
        /// </summary>
        Task<IEnumerable<Room>> GetRoomsByCleaningStatusAsync(
            Guid propertyId,
            RoomCleaningStatus status);

        /// <summary>
        /// Gets housekeeping tasks for a specific date
        /// </summary>
        Task<IEnumerable<object>> GetHousekeepingTasksAsync(
            Guid propertyId,
            DateTime date);

        /// <summary>
        /// Assigns housekeeping tasks to staff
        /// </summary>
        Task<IEnumerable<object>> AssignHousekeepingTasksAsync(
            Guid propertyId,
            DateTime date,
            List<TaskAssignment> assignments);

        /// <summary>
        /// Gets housekeeping statistics for a property
        /// </summary>
        Task<object> GetHousekeepingStatisticsAsync(
            Guid propertyId,
            DateTime date);
    }

    /// <summary>
    /// Represents a minibar item consumed by a guest
    /// </summary>
    public class MinibarItem
    {
        /// <summary>
        /// The name of the item
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The quantity consumed
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// The price per unit
        /// </summary>
        public decimal Price { get; set; }
    }

    /// <summary>
    /// Represents a housekeeping task assignment
    /// </summary>
    public class TaskAssignment
    {
        /// <summary>
        /// The ID of the staff member
        /// </summary>
        public Guid StaffId { get; set; }

        /// <summary>
        /// The IDs of the rooms assigned to the staff member
        /// </summary>
        public List<Guid> RoomIds { get; set; }
    }
}