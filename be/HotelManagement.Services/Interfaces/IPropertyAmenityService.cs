using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for property amenity service operations
    /// </summary>
    public interface IPropertyAmenityService
    {
        /// <summary>
        /// Gets all amenities for a property
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of amenities for the property</returns>
        Task<IEnumerable<PropertyAmenity>> GetAmenitiesByPropertyAsync(Guid propertyId);

        /// <summary>
        /// Gets an amenity by ID
        /// </summary>
        /// <param name="id">The amenity ID</param>
        /// <returns>The amenity if found, or null if not found</returns>
        Task<PropertyAmenity> GetAmenityByIdAsync(Guid id);

        /// <summary>
        /// Creates a new property amenity
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="name">The amenity name</param>
        /// <param name="description">The amenity description</param>
        /// <param name="category">The amenity category</param>
        /// <param name="isActive">Whether the amenity is active</param>
        /// <returns>The created amenity</returns>
        Task<PropertyAmenity> CreateAmenityAsync(
            Guid propertyId,
            string name,
            string description,
            string category,
            bool isActive);

        /// <summary>
        /// Updates an existing property amenity
        /// </summary>
        /// <param name="id">The amenity ID</param>
        /// <param name="propertyId">The property ID</param>
        /// <param name="name">The amenity name</param>
        /// <param name="description">The amenity description</param>
        /// <param name="category">The amenity category</param>
        /// <param name="isActive">Whether the amenity is active</param>
        /// <returns>The updated amenity, or null if not found</returns>
        Task<PropertyAmenity> UpdateAmenityAsync(
            Guid id,
            Guid propertyId,
            string name,
            string description,
            string category,
            bool isActive);

        /// <summary>
        /// Deletes a property amenity
        /// </summary>
        /// <param name="id">The amenity ID</param>
        /// <returns>True if successful, false if not found</returns>
        Task<bool> DeleteAmenityAsync(Guid id);

        /// <summary>
        /// Gets amenities by category
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="category">The amenity category</param>
        /// <returns>A list of amenities in the specified category</returns>
        Task<IEnumerable<PropertyAmenity>> GetAmenitiesByCategoryAsync(Guid propertyId, string category);

        /// <summary>
        /// Updates the status of a property amenity
        /// </summary>
        /// <param name="id">The amenity ID</param>
        /// <param name="isActive">The new active status</param>
        /// <returns>The updated amenity, or null if not found</returns>
        Task<PropertyAmenity> UpdateAmenityStatusAsync(Guid id, bool isActive);
    }
}