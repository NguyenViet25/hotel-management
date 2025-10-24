using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Service for managing rooms and room types
    /// </summary>
    public interface IRoomService
    {
        /// <summary>
        /// Gets all rooms
        /// </summary>
        /// <returns>A collection of all rooms</returns>
        Task<IEnumerable<Room>> GetAllRoomsAsync();
        /// <summary>
        /// Gets a room by its ID
        /// </summary>
        /// <param name="id">The ID of the room to retrieve</param>
        /// <returns>The room if found, or null if not found</returns>
        Task<Room> GetRoomByIdAsync(Guid id);
        /// <summary>
        /// Gets all rooms for a specific hotel property
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <returns>A collection of rooms for the specified property</returns>
        Task<IEnumerable<Room>> GetRoomsByPropertyIdAsync(Guid propertyId);
        /// <summary>
        /// Gets available rooms for a specific date range
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <param name="checkIn">The check-in date</param>
        /// <param name="checkOut">The check-out date</param>
        /// <returns>A collection of available rooms for the specified date range</returns>
        Task<IEnumerable<Room>> GetAvailableRoomsAsync(Guid propertyId, DateTime checkIn, DateTime checkOut);
        /// <summary>
        /// Creates a new room
        /// </summary>
        /// <param name="room">The room details</param>
        /// <returns>True if the room was created successfully, otherwise false</returns>
        Task<bool> CreateRoomAsync(Room room);
        /// <summary>
        /// Updates an existing room
        /// </summary>
        /// <param name="room">The updated room details</param>
        /// <returns>True if the room was updated successfully, otherwise false</returns>
        Task<bool> UpdateRoomAsync(Room room);
        /// <summary>
        /// Deletes a room
        /// </summary>
        /// <param name="id">The ID of the room to delete</param>
        /// <returns>True if the room was deleted successfully, otherwise false</returns>
        Task<bool> DeleteRoomAsync(Guid id);
        /// <summary>
        /// Updates the status of a room
        /// </summary>
        /// <param name="id">The ID of the room to update</param>
        /// <param name="status">The new status for the room</param>
        /// <returns>True if the room status was updated successfully, otherwise false</returns>
        Task<bool> UpdateRoomStatusAsync(Guid id, RoomStatus status);
        /// <summary>
        /// Adds a new room type
        /// </summary>
        /// <param name="roomType">The room type details</param>
        /// <returns>True if the room type was added successfully, otherwise false</returns>
        Task<bool> AddRoomTypeAsync(RoomType roomType);
        /// <summary>
        /// Updates an existing room type
        /// </summary>
        /// <param name="roomType">The updated room type details</param>
        /// <returns>True if the room type was updated successfully, otherwise false</returns>
        Task<bool> UpdateRoomTypeAsync(RoomType roomType);
        /// <summary>
        /// Deletes a room type
        /// </summary>
        /// <param name="id">The ID of the room type to delete</param>
        /// <returns>True if the room type was deleted successfully, otherwise false</returns>
        Task<bool> DeleteRoomTypeAsync(Guid id);
        /// <summary>
        /// Gets all room types
        /// </summary>
        /// <returns>A collection of all room types</returns>
        Task<IEnumerable<RoomType>> GetAllRoomTypesAsync();
        /// <summary>
        /// Gets a room type by its ID
        /// </summary>
        /// <param name="id">The ID of the room type to retrieve</param>
        /// <returns>The room type if found, or null if not found</returns>
        Task<RoomType> GetRoomTypeByIdAsync(Guid id);
    }
}