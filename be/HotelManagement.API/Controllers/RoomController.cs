using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using HotelManagement.Domain.Enums;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing rooms
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly IRoomService _roomService;

        public RoomController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        /// <summary>
        /// Gets all rooms
        /// </summary>
        /// <returns>A list of all rooms</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Room>>> GetAllRooms()
        {
            var rooms = await _roomService.GetAllRoomsAsync();
            return Ok(rooms);
        }

        /// <summary>
        /// Gets a room by its ID
        /// </summary>
        /// <param name="id">The ID of the room to retrieve</param>
        /// <returns>The room if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Room>> GetRoomById(Guid id)
        {
            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            return Ok(room);
        }

        /// <summary>
        /// Gets all rooms for a specific hotel property
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <returns>A list of rooms for the specified property</returns>
        [HttpGet("property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<Room>>> GetRoomsByPropertyId(Guid propertyId)
        {
            var rooms = await _roomService.GetRoomsByPropertyIdAsync(propertyId);
            return Ok(rooms);
        }

        /// <summary>
        /// Gets available rooms for a specific date range
        /// </summary>
        /// <param name="propertyId">The ID of the hotel property</param>
        /// <param name="checkIn">The check-in date</param>
        /// <param name="checkOut">The check-out date</param>
        /// <returns>A list of available rooms for the specified date range</returns>
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Room>>> GetAvailableRooms([FromQuery] Guid propertyId, [FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
        {
            if (checkIn >= checkOut)
            {
                return BadRequest("Check-in date must be before check-out date");
            }

            var rooms = await _roomService.GetAvailableRoomsAsync(propertyId, checkIn, checkOut);
            return Ok(rooms);
        }

        /// <summary>
        /// Creates a new room
        /// </summary>
        /// <param name="room">The room details</param>
        /// <returns>The newly created room</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<ActionResult<Room>> CreateRoom([FromBody] Room room)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _roomService.CreateRoomAsync(room);
            if (!success)
            {
                return BadRequest("Failed to create room");
            }

            return CreatedAtAction(nameof(GetRoomById), new { id = room.Id }, room);
        }

        /// <summary>
        /// Updates an existing room
        /// </summary>
        /// <param name="id">The ID of the room to update</param>
        /// <param name="room">The updated room details</param>
        /// <returns>No content if successful</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] Room room)
        {
            if (id != room.Id)
            {
                return BadRequest("Room ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingRoom = await _roomService.GetRoomByIdAsync(id);
            if (existingRoom == null)
            {
                return NotFound();
            }

            var success = await _roomService.UpdateRoomAsync(room);
            if (!success)
            {
                return BadRequest("Failed to update room");
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a room
        /// </summary>
        /// <param name="id">The ID of the room to delete</param>
        /// <returns>No content if successful</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteRoom(Guid id)
        {
            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            var success = await _roomService.DeleteRoomAsync(id);
            if (!success)
            {
                return BadRequest("Failed to delete room");
            }

            return NoContent();
        }

        /// <summary>
        /// Updates the status of a room
        /// </summary>
        /// <param name="id">The ID of the room to update</param>
        /// <param name="request">The room status update request</param>
        /// <returns>No content if successful</returns>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Administrator,Manager,Staff")]
        public async Task<IActionResult> UpdateRoomStatus(Guid id, [FromBody] RoomStatusUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var room = await _roomService.GetRoomByIdAsync(id);
            if (room == null)
            {
                return NotFound();
            }

            var success = await _roomService.UpdateRoomStatusAsync(id, request.Status);
            if (!success)
            {
                return BadRequest("Failed to update room status");
            }

            return NoContent();
        }

        /// <summary>
        /// Gets all room types
        /// </summary>
        /// <returns>A list of all room types</returns>
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<RoomType>>> GetAllRoomTypes()
        {
            var roomTypes = await _roomService.GetAllRoomTypesAsync();
            return Ok(roomTypes);
        }

        /// <summary>
        /// Gets a room type by its ID
        /// </summary>
        /// <param name="id">The ID of the room type to retrieve</param>
        /// <returns>The room type if found, or NotFound if not found</returns>
        [HttpGet("types/{id}")]
        public async Task<ActionResult<RoomType>> GetRoomTypeById(Guid id)
        {
            var roomType = await _roomService.GetRoomTypeByIdAsync(id);
            if (roomType == null)
            {
                return NotFound();
            }

            return Ok(roomType);
        }

        /// <summary>
        /// Adds a new room type
        /// </summary>
        /// <param name="roomType">The room type details</param>
        /// <returns>The newly created room type</returns>
        [HttpPost("types")]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<ActionResult<RoomType>> AddRoomType([FromBody] RoomType roomType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _roomService.AddRoomTypeAsync(roomType);
            if (!success)
            {
                return BadRequest("Failed to add room type");
            }

            return CreatedAtAction(nameof(GetRoomTypeById), new { id = roomType.Id }, roomType);
        }

        /// <summary>
        /// Updates an existing room type
        /// </summary>
        /// <param name="id">The ID of the room type to update</param>
        /// <param name="roomType">The updated room type details</param>
        /// <returns>No content if successful</returns>
        [HttpPut("types/{id}")]
        [Authorize(Roles = "Administrator,Manager")]
        public async Task<IActionResult> UpdateRoomType(Guid id, [FromBody] RoomType roomType)
        {
            if (id != roomType.Id)
            {
                return BadRequest("Room type ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingRoomType = await _roomService.GetRoomTypeByIdAsync(id);
            if (existingRoomType == null)
            {
                return NotFound();
            }

            var success = await _roomService.UpdateRoomTypeAsync(roomType);
            if (!success)
            {
                return BadRequest("Failed to update room type");
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a room type
        /// </summary>
        /// <param name="id">The ID of the room type to delete</param>
        /// <returns>No content if successful</returns>
        [HttpDelete("types/{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteRoomType(Guid id)
        {
            var roomType = await _roomService.GetRoomTypeByIdAsync(id);
            if (roomType == null)
            {
                return NotFound();
            }

            var success = await _roomService.DeleteRoomTypeAsync(id);
            if (!success)
            {
                return BadRequest("Failed to delete room type. It may be in use by one or more rooms.");
            }

            return NoContent();
        }
    }

    /// <summary>
    /// Request model for updating a room's status
    /// </summary>
    public class RoomStatusUpdateRequest
    {
        /// <summary>
        /// The new status for the room
        /// </summary>
        public RoomStatus Status { get; set; }
    }
}