using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for guest service operations
    /// </summary>
    public interface IGuestService
    {
        /// <summary>
        /// Gets all guests
        /// </summary>
        /// <returns>A list of all guests</returns>
        Task<IEnumerable<Guest>> GetAllGuestsAsync();

        /// <summary>
        /// Gets a guest by ID
        /// </summary>
        /// <param name="id">The guest ID</param>
        /// <returns>The guest if found, or null if not found</returns>
        Task<Guest> GetGuestByIdAsync(Guid id);

        /// <summary>
        /// Creates a new guest
        /// </summary>
        /// <param name="firstName">First name</param>
        /// <param name="lastName">Last name</param>
        /// <param name="email">Email address</param>
        /// <param name="phone">Phone number</param>
        /// <param name="address">Address</param>
        /// <param name="city">City</param>
        /// <param name="state">State/Province</param>
        /// <param name="country">Country</param>
        /// <param name="postalCode">Postal code</param>
        /// <param name="idType">ID type (Passport, ID Card, etc.)</param>
        /// <param name="idNumber">ID number</param>
        /// <param name="dateOfBirth">Date of birth</param>
        /// <param name="nationality">Nationality</param>
        /// <param name="notes">Additional notes</param>
        /// <returns>The created guest</returns>
        Task<Guest> CreateGuestAsync(
            string firstName,
            string lastName,
            string email,
            string phone,
            string address,
            string city,
            string state,
            string country,
            string postalCode,
            string idType,
            string idNumber,
            DateTime? dateOfBirth,
            string nationality,
            string notes);

        /// <summary>
        /// Updates an existing guest
        /// </summary>
        /// <param name="id">The guest ID</param>
        /// <param name="firstName">First name</param>
        /// <param name="lastName">Last name</param>
        /// <param name="email">Email address</param>
        /// <param name="phone">Phone number</param>
        /// <param name="address">Address</param>
        /// <param name="city">City</param>
        /// <param name="state">State/Province</param>
        /// <param name="country">Country</param>
        /// <param name="postalCode">Postal code</param>
        /// <param name="idType">ID type (Passport, ID Card, etc.)</param>
        /// <param name="idNumber">ID number</param>
        /// <param name="dateOfBirth">Date of birth</param>
        /// <param name="nationality">Nationality</param>
        /// <param name="notes">Additional notes</param>
        /// <returns>The updated guest, or null if not found</returns>
        Task<Guest> UpdateGuestAsync(
            Guid id,
            string firstName,
            string lastName,
            string email,
            string phone,
            string address,
            string city,
            string state,
            string country,
            string postalCode,
            string idType,
            string idNumber,
            DateTime? dateOfBirth,
            string nationality,
            string notes);

        /// <summary>
        /// Searches for guests by various criteria
        /// </summary>
        /// <param name="searchTerm">The search term (name, email, phone, ID number)</param>
        /// <returns>A list of matching guests</returns>
        Task<IEnumerable<Guest>> SearchGuestsAsync(string searchTerm);

        /// <summary>
        /// Gets guest stay history
        /// </summary>
        /// <param name="guestId">The guest ID</param>
        /// <returns>A list of the guest's previous stays</returns>
        Task<object> GetGuestStayHistoryAsync(Guid guestId);

        /// <summary>
        /// Gets guest preferences
        /// </summary>
        /// <param name="guestId">The guest ID</param>
        /// <returns>The guest's preferences, or null if not found</returns>
        Task<object> GetGuestPreferencesAsync(Guid guestId);

        /// <summary>
        /// Updates guest preferences
        /// </summary>
        /// <param name="guestId">The guest ID</param>
        /// <param name="preferences">The updated preferences</param>
        /// <returns>The updated preferences, or null if not found</returns>
        Task<object> UpdateGuestPreferencesAsync(Guid guestId, object preferences);

        /// <summary>
        /// Gets VIP guests for a property
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of VIP guests</returns>
        Task<IEnumerable<Guest>> GetVipGuestsAsync(Guid propertyId);
    }
}