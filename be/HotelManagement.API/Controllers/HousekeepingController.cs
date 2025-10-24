using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using HotelManagement.Domain.Enums;
using HotelManagement.API.Models;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing housekeeping operations
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HousekeepingController : ControllerBase
    {
        private readonly IHousekeepingService _housekeepingService;

        public HousekeepingController(IHousekeepingService housekeepingService)
        {
            _housekeepingService = housekeepingService;
        }

        /// <summary>
        /// Updates the cleaning status of a room (UC-21)
        /// </summary>
        /// <param name="roomId">The ID of the room to update</param>
        /// <param name="request">The cleaning status update details</param>
        /// <returns>The updated room status</returns>
        [HttpPatch("rooms/{roomId}/status")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Housekeeper")]
        public async Task<ActionResult<Room>> UpdateRoomCleaningStatus(Guid roomId, [FromBody] UpdateRoomStatusRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var room = await _housekeepingService.UpdateRoomCleaningStatusAsync(
                roomId,
                request.CleaningStatus,
                request.Notes);

            if (room == null)
            {
                return NotFound();
            }

            return Ok(room);
        }

        /// <summary>
        /// Records minibar consumption for a room (UC-22)
        /// </summary>
        /// <param name="roomId">The ID of the room</param>
        /// <param name="request">The minibar consumption details</param>
        /// <returns>The created charge record</returns>
        [HttpPost("rooms/{roomId}/minibar")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Housekeeper")]
        public async Task<ActionResult<object>> RecordMinibarConsumption(Guid roomId, [FromBody] MinibarConsumptionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _housekeepingService.RecordMinibarConsumptionAsync(
                roomId,
                request.Items,
                request.Notes);

            if (result == null)
            {
                return NotFound(new { message = "Room not found or not occupied" });
            }

            return Ok(result);
        }

        /// <summary>
        /// Gets rooms by cleaning status
        /// </summary>
        /// <param name="propertyId">The property ID to filter by</param>
        /// <param name="status">The cleaning status to filter by</param>
        /// <returns>A list of rooms with the specified cleaning status</returns>
        [HttpGet("rooms/by-status")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Housekeeper")]
        public async Task<ActionResult<IEnumerable<Room>>> GetRoomsByCleaningStatus(
            [FromQuery] Guid propertyId,
            [FromQuery] RoomCleaningStatus status)
        {
            var rooms = await _housekeepingService.GetRoomsByCleaningStatusAsync(propertyId, status);
            return Ok(rooms);
        }

        /// <summary>
        /// Gets housekeeping tasks for a specific date
        /// </summary>
        /// <param name="propertyId">The property ID to filter by</param>
        /// <param name="date">The date to get tasks for</param>
        /// <returns>A list of housekeeping tasks for the specified date</returns>
        [HttpGet("tasks")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Housekeeper")]
        public async Task<ActionResult<IEnumerable<object>>> GetHousekeepingTasks(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime date)
        {
            var tasks = await _housekeepingService.GetHousekeepingTasksAsync(propertyId, date);
            return Ok(tasks);
        }

        /// <summary>
        /// Assigns housekeeping tasks to staff
        /// </summary>
        /// <param name="request">The task assignment details</param>
        /// <returns>The assigned tasks</returns>
        [HttpPost("tasks/assign")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<IEnumerable<object>>> AssignHousekeepingTasks([FromBody] AssignTasksRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var tasks = await _housekeepingService.AssignHousekeepingTasksAsync(
                request.PropertyId,
                request.Date,
                request.Assignments);

            return Ok(tasks);
        }

        /// <summary>
        /// Gets housekeeping statistics for a property
        /// </summary>
        /// <param name="propertyId">The property ID to get statistics for</param>
        /// <param name="date">The date to get statistics for</param>
        /// <returns>Housekeeping statistics for the specified property and date</returns>
        [HttpGet("statistics")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> GetHousekeepingStatistics(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime date)
        {
            var statistics = await _housekeepingService.GetHousekeepingStatisticsAsync(propertyId, date);
            return Ok(statistics);
        }
    }
}