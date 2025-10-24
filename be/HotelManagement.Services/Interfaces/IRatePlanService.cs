using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Service interface for managing rate plans and pricing
    /// </summary>
    public interface IRatePlanService
    {
        /// <summary>
        /// Gets all rate plans
        /// </summary>
        Task<IEnumerable<RatePlan>> GetAllRatePlansAsync();

        /// <summary>
        /// Gets a rate plan by its ID
        /// </summary>
        Task<RatePlan> GetRatePlanByIdAsync(Guid id);

        /// <summary>
        /// Creates a new rate plan
        /// </summary>
        Task<RatePlan> CreateRatePlanAsync(
            string name,
            string description,
            Guid roomTypeId,
            decimal basePrice,
            decimal depositPercentage,
            string cancellationPolicy,
            string noShowPolicy,
            Guid propertyId,
            bool isActive);

        /// <summary>
        /// Updates an existing rate plan
        /// </summary>
        Task<bool> UpdateRatePlanAsync(
            Guid id,
            string name,
            string description,
            decimal basePrice,
            decimal depositPercentage,
            string cancellationPolicy,
            string noShowPolicy,
            bool isActive);

        /// <summary>
        /// Activates or deactivates a rate plan
        /// </summary>
        Task<bool> ToggleRatePlanStatusAsync(Guid id, bool isActive);

        /// <summary>
        /// Gets rate plans by property ID
        /// </summary>
        Task<IEnumerable<RatePlan>> GetRatePlansByPropertyAsync(Guid propertyId);

        /// <summary>
        /// Gets rate plans by room type ID
        /// </summary>
        Task<IEnumerable<RatePlan>> GetRatePlansByRoomTypeAsync(Guid roomTypeId);

        /// <summary>
        /// Gets active rate plans by property ID
        /// </summary>
        Task<IEnumerable<RatePlan>> GetActiveRatePlansByPropertyAsync(Guid propertyId);
    }
}