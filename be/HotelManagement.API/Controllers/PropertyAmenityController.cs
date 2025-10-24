using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing property amenities
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PropertyAmenityController : ControllerBase
    {
        private readonly IPropertyAmenityService _propertyAmenityService;

        public PropertyAmenityController(IPropertyAmenityService propertyAmenityService)
        {
            _propertyAmenityService = propertyAmenityService;
        }

        /// <summary>
        /// Gets all amenities for a property
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of amenities for the property</returns>
        [HttpGet("by-property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<PropertyAmenity>>> GetAmenitiesByProperty(Guid propertyId)
        {
            var amenities = await _propertyAmenityService.GetAmenitiesByPropertyAsync(propertyId);
            return Ok(amenities);
        }

        /// <summary>
        /// Gets an amenity by ID
        /// </summary>
        /// <param name="id">The amenity ID</param>
        /// <returns>The amenity if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<PropertyAmenity>> GetAmenityById(Guid id)
        {
            var amenity = await _propertyAmenityService.GetAmenityByIdAsync(id);
            if (amenity == null)
            {
                return NotFound();
            }

            return Ok(amenity);
        }

        /// <summary>
        /// Creates a new property amenity
        /// </summary>
        /// <param name="request">The amenity details</param>
        /// <returns>The created amenity</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<PropertyAmenity>> CreateAmenity([FromBody] PropertyAmenityRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var amenity = await _propertyAmenityService.CreateAmenityAsync(
                Guid.NewGuid(),
                request.Name,
                request.Description,
                "request.Category",
              true);

            return CreatedAtAction(nameof(GetAmenityById), new { id = amenity.Id }, amenity);
        }

        /// <summary>
        /// Updates an existing property amenity
        /// </summary>
        /// <param name="id">The amenity ID</param>
        /// <param name="request">The updated amenity details</param>
        /// <returns>The updated amenity</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<PropertyAmenity>> UpdateAmenity(Guid id, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var amenity = await _propertyAmenityService.UpdateAmenityAsync(
                id,
                request.PropertyId,
                request.Name,
                request.Description,
                request.Category,
                request.IsActive);

            if (amenity == null)
            {
                return NotFound();
            }

            return Ok(amenity);
        }

        /// <summary>
        /// Deletes a property amenity
        /// </summary>
        /// <param name="id">The amenity ID</param>
        /// <returns>NoContent if successful</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult> DeleteAmenity(Guid id)
        {
            var result = await _propertyAmenityService.DeleteAmenityAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Gets amenities by category
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="category">The amenity category</param>
        /// <returns>A list of amenities in the specified category</returns>
        [HttpGet("by-category")]
        public async Task<ActionResult<IEnumerable<PropertyAmenity>>> GetAmenitiesByCategory(
            [FromQuery] Guid propertyId,
            [FromQuery] string category)
        {
            var amenities = await _propertyAmenityService.GetAmenitiesByCategoryAsync(propertyId, category);
            return Ok(amenities);
        }

        /// <summary>
        /// Updates the status of a property amenity
        /// </summary>
        /// <param name="id">The amenity ID</param>
        /// <param name="isActive">The new active status</param>
        /// <returns>The updated amenity</returns>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<PropertyAmenity>> UpdateAmenityStatus(Guid id, [FromBody] bool isActive)
        {
            var amenity = await _propertyAmenityService.UpdateAmenityStatusAsync(id, isActive);
            if (amenity == null)
            {
                return NotFound();
            }

            return Ok(amenity);
        }
    }


}