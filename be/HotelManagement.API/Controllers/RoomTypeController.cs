using HotelManagement.API.Models;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing room types
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoomTypeController : ControllerBase
    {
        private readonly IRoomTypeService _roomTypeService;

        public RoomTypeController(IRoomTypeService roomTypeService)
        {
            _roomTypeService = roomTypeService;
        }

        /// <summary>
        /// Gets all room types
        /// </summary>
        /// <returns>A list of all room types</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetAllRoomTypes()
        {
            var roomTypes = await _roomTypeService.GetAllRoomTypesAsync();
            return Ok(roomTypes);
        }

        /// <summary>
        /// Gets a room type by its ID
        /// </summary>
        /// <param name="id">The ID of the room type to retrieve</param>
        /// <returns>The room type if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomType>> GetRoomTypeById(Guid id)
        {
            var roomType = await _roomTypeService.GetRoomTypeByIdAsync(id);
            if (roomType == null)
            {
                return NotFound();
            }

            return Ok(roomType);
        }

        /// <summary>
        /// Creates a new room type (UC-07)
        /// </summary>
        /// <param name="request">The room type details</param>
        /// <returns>The created room type</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<RoomType>> CreateRoomType([FromBody] RoomTypeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var roomType = await _roomTypeService.CreateRoomTypeAsync(
                request.Name,
                request.Description,
                request.Capacity,
                request.BasePrice,
                request.Amenities,
                request.PropertyId);

            return CreatedAtAction(nameof(GetRoomTypeById), new { id = roomType.Id }, roomType);
        }

        /// <summary>
        /// Updates an existing room type
        /// </summary>
        /// <param name="id">The ID of the room type to update</param>
        /// <param name="request">The updated room type details</param>
        /// <returns>No content if successful</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<IActionResult> UpdateRoomType(Guid id, [FromBody] RoomTypeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _roomTypeService.UpdateRoomTypeAsync(
                id,
                request.Name,
                request.Description,
                request.Capacity,
                request.BasePrice,
                request.Amenities);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a room type
        /// </summary>
        /// <param name="id">The ID of the room type to delete</param>
        /// <returns>No content if successful</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<IActionResult> DeleteRoomType(Guid id)
        {
            var result = await _roomTypeService.DeleteRoomTypeAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Gets room types by property ID
        /// </summary>
        /// <param name="propertyId">The property ID to filter by</param>
        /// <returns>A list of room types for the specified property</returns>
        [HttpGet("by-property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetRoomTypesByProperty(Guid propertyId)
        {
            var roomTypes = await _roomTypeService.GetRoomTypesByPropertyAsync(propertyId);
            return Ok(roomTypes);
        }
    }
}