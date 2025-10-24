using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Service interface for managing room types
    /// </summary>
    public interface IRoomTypeService
    {
        /// <summary>
        /// Gets all room types
        /// </summary>
        Task<IEnumerable<RoomType>> GetAllRoomTypesAsync();

        /// <summary>
        /// Gets a room type by its ID
        /// </summary>
        Task<RoomType> GetRoomTypeByIdAsync(Guid id);

        /// <summary>
        /// Creates a new room type
        /// </summary>
        Task<RoomType> CreateRoomTypeAsync(
            string name,
            string description,
            int capacity,
            decimal basePrice,
            List<string> amenities,
            Guid propertyId);

        /// <summary>
        /// Updates an existing room type
        /// </summary>
        Task<bool> UpdateRoomTypeAsync(
            Guid id,
            string name,
            string description,
            int capacity,
            decimal basePrice,
            List<string> amenities);

        /// <summary>
        /// Deletes a room type
        /// </summary>
        Task<bool> DeleteRoomTypeAsync(Guid id);

        /// <summary>
        /// Gets room types by property ID
        /// </summary>
        Task<IEnumerable<RoomType>> GetRoomTypesByPropertyAsync(Guid propertyId);
    }
}