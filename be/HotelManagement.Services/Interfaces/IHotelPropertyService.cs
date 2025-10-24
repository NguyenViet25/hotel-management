using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Service for managing hotel properties
    /// </summary>
    public interface IHotelPropertyService
    {
        /// <summary>
        /// Gets all hotel properties
        /// </summary>
        /// <returns>A collection of all hotel properties</returns>
        Task<IEnumerable<HotelProperty>> GetAllPropertiesAsync();
        
        /// <summary>
        /// Gets a hotel property by its ID
        /// </summary>
        /// <param name="id">The ID of the hotel property to retrieve</param>
        /// <returns>The hotel property if found, or null if not found</returns>
        Task<HotelProperty> GetPropertyByIdAsync(Guid id);
        
        /// <summary>
        /// Creates a new hotel property
        /// </summary>
        /// <param name="property">The hotel property to create</param>
        /// <returns>True if creation was successful, false otherwise</returns>
        Task<bool> CreatePropertyAsync(HotelProperty property);
        
        /// <summary>
        /// Updates an existing hotel property
        /// </summary>
        /// <param name="property">The hotel property with updated information</param>
        /// <returns>True if update was successful, false otherwise</returns>
        Task<bool> UpdatePropertyAsync(HotelProperty property);
        
        /// <summary>
        /// Deletes a hotel property by its ID
        /// </summary>
        /// <param name="id">The ID of the hotel property to delete</param>
        /// <returns>True if deletion was successful, false otherwise</returns>
        Task<bool> DeletePropertyAsync(Guid id);
        
        /// <summary>
        /// Searches for hotel properties based on a search term
        /// </summary>
        /// <param name="searchTerm">The search term to filter properties</param>
        /// <returns>A collection of matching hotel properties</returns>
        Task<IEnumerable<HotelProperty>> SearchPropertiesAsync(string searchTerm);
        
        /// <summary>
        /// Gets hotel properties by location (city and country)
        /// </summary>
        /// <param name="city">The city to filter by</param>
        /// <param name="country">The country to filter by</param>
        /// <returns>A collection of hotel properties in the specified location</returns>
        Task<IEnumerable<HotelProperty>> GetPropertiesByLocationAsync(string city, string country);
        
        /// <summary>
        /// Adds an amenity to a hotel property
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <param name="amenityName">The name of the amenity to add</param>
        /// <param name="amenityDescription">The description of the amenity</param>
        /// <returns>True if the amenity was added successfully, false otherwise</returns>
        Task<bool> AddAmenityToPropertyAsync(Guid propertyId, string amenityName, string amenityDescription);
        
        /// <summary>
        /// Removes an amenity from a hotel property
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <param name="amenityId">The ID of the amenity to remove</param>
        /// <returns>True if the amenity was removed successfully, false otherwise</returns>
        Task<bool> RemoveAmenityFromPropertyAsync(Guid propertyId, Guid amenityId);
        
        /// <summary>
        /// Gets all amenities for a hotel property
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <returns>A collection of amenities for the specified property</returns>
        Task<IEnumerable<PropertyAmenity>> GetPropertyAmenitiesAsync(Guid propertyId);
    }
}