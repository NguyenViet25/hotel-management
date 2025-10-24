using HotelManagement.API.Models;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing hotel guests
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GuestController : ControllerBase
    {
        private readonly IGuestService _guestService;

        public GuestController(IGuestService guestService)
        {
            _guestService = guestService;
        }

        /// <summary>
        /// Gets all guests
        /// </summary>
        /// <returns>A list of all guests</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Guest>>> GetAllGuests()
        {
            var guests = await _guestService.GetAllGuestsAsync();
            return Ok(guests);
        }

        /// <summary>
        /// Gets a guest by ID
        /// </summary>
        /// <param name="id">The guest ID</param>
        /// <returns>The guest if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Guest>> GetGuestById(Guid id)
        {
            var guest = await _guestService.GetGuestByIdAsync(id);
            if (guest == null)
            {
                return NotFound();
            }

            return Ok(guest);
        }

        /// <summary>
        /// Creates a new guest
        /// </summary>
        /// <param name="request">The guest details</param>
        /// <returns>The created guest</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<Guest>> CreateGuest([FromBody] GuestRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var guest = await _guestService.CreateGuestAsync(
                request.FirstName,
                request.LastName,
                request.Email,
                request.Phone,
                request.Address,
                request.City,
                request.State,
                request.Country,
                request.PostalCode,
                request.IdType,
                request.IdNumber,
                request.DateOfBirth,
                request.Nationality,
                request.Notes);

            return CreatedAtAction(nameof(GetGuestById), new { id = guest.Id }, guest);
        }

        /// <summary>
        /// Updates an existing guest
        /// </summary>
        /// <param name="id">The guest ID</param>
        /// <param name="request">The updated guest details</param>
        /// <returns>The updated guest</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<Guest>> UpdateGuest(Guid id, [FromBody] GuestRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var guest = await _guestService.UpdateGuestAsync(
                id,
                request.FirstName,
                request.LastName,
                request.Email,
                request.Phone,
                request.Address,
                request.City,
                request.State,
                request.Country,
                request.PostalCode,
                request.IdType,
                request.IdNumber,
                request.DateOfBirth,
                request.Nationality,
                request.Notes);

            if (guest == null)
            {
                return NotFound();
            }

            return Ok(guest);
        }

        /// <summary>
        /// Searches for guests by various criteria
        /// </summary>
        /// <param name="searchTerm">The search term (name, email, phone, ID number)</param>
        /// <returns>A list of matching guests</returns>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Guest>>> SearchGuests([FromQuery] string searchTerm)
        {
            var guests = await _guestService.SearchGuestsAsync(searchTerm);
            return Ok(guests);
        }

        /// <summary>
        /// Gets guest stay history
        /// </summary>
        /// <param name="id">The guest ID</param>
        /// <returns>A list of the guest's previous stays</returns>
        [HttpGet("{id}/stay-history")]
        public async Task<ActionResult<object>> GetGuestStayHistory(Guid id)
        {
            var stayHistory = await _guestService.GetGuestStayHistoryAsync(id);
            return Ok(stayHistory);
        }

        /// <summary>
        /// Gets guest preferences
        /// </summary>
        /// <param name="id">The guest ID</param>
        /// <returns>The guest's preferences</returns>
        [HttpGet("{id}/preferences")]
        public async Task<ActionResult<object>> GetGuestPreferences(Guid id)
        {
            var preferences = await _guestService.GetGuestPreferencesAsync(id);
            if (preferences == null)
            {
                return NotFound();
            }

            return Ok(preferences);
        }

        /// <summary>
        /// Updates guest preferences
        /// </summary>
        /// <param name="id">The guest ID</param>
        /// <param name="preferences">The updated preferences</param>
        /// <returns>The updated preferences</returns>
        [HttpPut("{id}/preferences")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<object>> UpdateGuestPreferences(Guid id, [FromBody] object preferences)
        {
            var updatedPreferences = await _guestService.UpdateGuestPreferencesAsync(id, preferences);
            if (updatedPreferences == null)
            {
                return NotFound();
            }

            return Ok(updatedPreferences);
        }

        /// <summary>
        /// Gets VIP guests for a property
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of VIP guests</returns>
        [HttpGet("vip")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<IEnumerable<Guest>>> GetVipGuests([FromQuery] Guid propertyId)
        {
            var vipGuests = await _guestService.GetVipGuestsAsync(propertyId);
            return Ok(vipGuests);
        }
    }


}