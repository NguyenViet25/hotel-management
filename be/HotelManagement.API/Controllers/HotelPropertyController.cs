using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing hotel properties
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class HotelPropertyController : ControllerBase
    {
        private readonly IHotelPropertyService _hotelPropertyService;

        public HotelPropertyController(IHotelPropertyService hotelPropertyService)
        {
            _hotelPropertyService = hotelPropertyService;
        }

        /// <summary>
        /// Gets all hotel properties
        /// </summary>
        /// <returns>A list of all hotel properties</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HotelProperty>>> GetAllProperties()
        {
            var properties = await _hotelPropertyService.GetAllPropertiesAsync();
            return Ok(properties);
        }

        /// <summary>
        /// Gets a hotel property by its ID
        /// </summary>
        /// <param name="id">The ID of the hotel property to retrieve</param>
        /// <returns>The hotel property if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<HotelProperty>> GetPropertyById(Guid id)
        {
            var property = await _hotelPropertyService.GetPropertyByIdAsync(id);
            if (property == null)
            {
                return NotFound();
            }

            return Ok(property);
        }

        /// <summary>
        /// Creates a new hotel property
        /// </summary>
        /// <param name="property">The hotel property data to create</param>
        /// <returns>The created hotel property</returns>
        /// <response code="201">Returns the newly created hotel property</response>
        /// <response code="400">If the property data is invalid</response>
        /// <response code="401">If the user is not authorized</response>
        [HttpPost]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<ActionResult<HotelProperty>> CreateProperty([FromBody] HotelProperty property)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _hotelPropertyService.CreatePropertyAsync(property);
            if (!success)
            {
                return BadRequest("Failed to create hotel property");
            }

            return CreatedAtAction(nameof(GetPropertyById), new { id = property.Id }, property);
        }

        /// <summary>
        /// Updates an existing hotel property
        /// </summary>
        /// <param name="id">The ID of the hotel property to update</param>
        /// <param name="property">The updated hotel property data</param>
        /// <returns>No content if successful, or appropriate error response</returns>
        /// <response code="204">If the property was successfully updated</response>
        /// <response code="400">If the property data is invalid or IDs don't match</response>
        /// <response code="401">If the user is not authorized</response>
        /// <response code="404">If the property is not found</response>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<IActionResult> UpdateProperty(Guid id, [FromBody] HotelProperty property)
        {
            if (id != property.Id)
            {
                return BadRequest("Property ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingProperty = await _hotelPropertyService.GetPropertyByIdAsync(id);
            if (existingProperty == null)
            {
                return NotFound();
            }

            var success = await _hotelPropertyService.UpdatePropertyAsync(property);
            if (!success)
            {
                return BadRequest("Failed to update hotel property");
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a hotel property
        /// </summary>
        /// <param name="id">The ID of the hotel property to delete</param>
        /// <returns>No content if successful, or appropriate error response</returns>
        /// <response code="204">If the property was successfully deleted</response>
        /// <response code="401">If the user is not authorized</response>
        /// <response code="404">If the property is not found</response>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteProperty(Guid id)
        {
            var property = await _hotelPropertyService.GetPropertyByIdAsync(id);
            if (property == null)
            {
                return NotFound();
            }

            var success = await _hotelPropertyService.DeletePropertyAsync(id);
            if (!success)
            {
                return BadRequest("Failed to delete hotel property");
            }

            return NoContent();
        }

        /// <summary>
        /// Searches for hotel properties based on a search term
        /// </summary>
        /// <param name="searchTerm">The search term to filter properties</param>
        /// <returns>A list of matching hotel properties</returns>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<HotelProperty>>> SearchProperties([FromQuery] string searchTerm)
        {
            var properties = await _hotelPropertyService.SearchPropertiesAsync(searchTerm);
            return Ok(properties);
        }

        /// <summary>
        /// Gets hotel properties by location (city and country)
        /// </summary>
        /// <param name="city">The city to filter by</param>
        /// <param name="country">The country to filter by</param>
        /// <returns>A list of hotel properties in the specified location</returns>
        [HttpGet("location")]
        public async Task<ActionResult<IEnumerable<HotelProperty>>> GetPropertiesByLocation([FromQuery] string city, [FromQuery] string country)
        {
            var properties = await _hotelPropertyService.GetPropertiesByLocationAsync(city, country);
            return Ok(properties);
        }

        /// <summary>
        /// Adds an amenity to a hotel property
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <param name="request">The amenity data to add</param>
        /// <returns>No content if successful, or appropriate error response</returns>
        /// <response code="204">If the amenity was successfully added</response>
        /// <response code="400">If the amenity data is invalid or already exists</response>
        /// <response code="401">If the user is not authorized</response>
        [HttpPost("{propertyId}/amenities")]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<IActionResult> AddAmenityToProperty(Guid propertyId, [FromBody] PropertyAmenityRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _hotelPropertyService.AddAmenityToPropertyAsync(propertyId, request.Name, request.Description);
            if (!success)
            {
                return BadRequest("Failed to add amenity to property");
            }

            return NoContent();
        }

        /// <summary>
        /// Removes an amenity from a hotel property
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <param name="amenityId">The ID of the amenity to remove</param>
        /// <returns>No content if successful, or appropriate error response</returns>
        /// <response code="204">If the amenity was successfully removed</response>
        /// <response code="400">If the amenity removal failed</response>
        /// <response code="401">If the user is not authorized</response>
        [HttpDelete("{propertyId}/amenities/{amenityId}")]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<IActionResult> RemoveAmenityFromProperty(Guid propertyId, Guid amenityId)
        {
            var success = await _hotelPropertyService.RemoveAmenityFromPropertyAsync(propertyId, amenityId);
            if (!success)
            {
                return BadRequest("Failed to remove amenity from property");
            }

            return NoContent();
        }

        /// <summary>
        /// Gets all amenities for a hotel property
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <returns>A list of amenities for the specified property</returns>
        [HttpGet("{propertyId}/amenities")]
        public async Task<ActionResult<IEnumerable<PropertyAmenity>>> GetPropertyAmenities(Guid propertyId)
        {
            var amenities = await _hotelPropertyService.GetPropertyAmenitiesAsync(propertyId);
            return Ok(amenities);
        }
    }

    /// <summary>
    /// Request model for adding an amenity to a property
    /// </summary>
    public class PropertyAmenityRequest
    {
        /// <summary>
        /// Gets or sets the name of the amenity
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// Gets or sets the description of the amenity
        /// </summary>
        public string Description { get; set; }
    }
}