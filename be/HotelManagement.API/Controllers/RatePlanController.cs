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
    /// Controller for managing rate plans and pricing
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RatePlanController : ControllerBase
    {
        private readonly IRatePlanService _ratePlanService;

        public RatePlanController(IRatePlanService ratePlanService)
        {
            _ratePlanService = ratePlanService;
        }

        /// <summary>
        /// Gets all rate plans
        /// </summary>
        /// <returns>A list of all rate plans</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RatePlan>>> GetAllRatePlans()
        {
            var ratePlans = await _ratePlanService.GetAllRatePlansAsync();
            return Ok(ratePlans);
        }

        /// <summary>
        /// Gets a rate plan by its ID
        /// </summary>
        /// <param name="id">The ID of the rate plan to retrieve</param>
        /// <returns>The rate plan if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<RatePlan>> GetRatePlanById(Guid id)
        {
            var ratePlan = await _ratePlanService.GetRatePlanByIdAsync(id);
            if (ratePlan == null)
            {
                return NotFound();
            }

            return Ok(ratePlan);
        }

        /// <summary>
        /// Creates a new rate plan (UC-10)
        /// </summary>
        /// <param name="request">The rate plan details</param>
        /// <returns>The created rate plan</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<RatePlan>> CreateRatePlan([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ratePlan = await _ratePlanService.CreateRatePlanAsync(
                request.Name,
                request.Description,
                request.RoomTypeId,
                request.BasePrice,
                request.DepositPercentage,
                request.CancellationPolicy,
                request.NoShowPolicy,
                request.PropertyId,
                request.IsActive);

            return CreatedAtAction(nameof(GetRatePlanById), new { id = ratePlan.Id }, ratePlan);
        }

        /// <summary>
        /// Updates an existing rate plan
        /// </summary>
        /// <param name="id">The ID of the rate plan to update</param>
        /// <param name="request">The updated rate plan details</param>
        /// <returns>No content if successful</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<IActionResult> UpdateRatePlan(Guid id, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _ratePlanService.UpdateRatePlanAsync(
                id,
                request.Name,
                request.Description,
                request.BasePrice,
                request.DepositPercentage,
                request.CancellationPolicy,
                request.NoShowPolicy,
                request.IsActive);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        class RatePlanRequest { }

        /// <summary>
        /// Activates or deactivates a rate plan (UC-11)
        /// </summary>
        /// <param name="id">The ID of the rate plan to update</param>
        /// <param name="request">The activation details</param>
        /// <returns>No content if successful</returns>
        [HttpPatch("{id}/toggle-status")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<IActionResult> ToggleRatePlanStatus(Guid id, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _ratePlanService.ToggleRatePlanStatusAsync(id, request.IsActive);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        class ToggleStatusRequest { }

        /// <summary>
        /// Gets rate plans by property ID
        /// </summary>
        /// <param name="propertyId">The property ID to filter by</param>
        /// <returns>A list of rate plans for the specified property</returns>
        [HttpGet("by-property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<RatePlan>>> GetRatePlansByProperty(Guid propertyId)
        {
            var ratePlans = await _ratePlanService.GetRatePlansByPropertyAsync(propertyId);
            return Ok(ratePlans);
        }

        /// <summary>
        /// Gets rate plans by room type ID
        /// </summary>
        /// <param name="roomTypeId">The room type ID to filter by</param>
        /// <returns>A list of rate plans for the specified room type</returns>
        [HttpGet("by-room-type/{roomTypeId}")]
        public async Task<ActionResult<IEnumerable<RatePlan>>> GetRatePlansByRoomType(Guid roomTypeId)
        {
            var ratePlans = await _ratePlanService.GetRatePlansByRoomTypeAsync(roomTypeId);
            return Ok(ratePlans);
        }

        /// <summary>
        /// Gets active rate plans by property ID
        /// </summary>
        /// <param name="propertyId">The property ID to filter by</param>
        /// <returns>A list of active rate plans for the specified property</returns>
        [HttpGet("active/by-property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<RatePlan>>> GetActiveRatePlansByProperty(Guid propertyId)
        {
            var ratePlans = await _ratePlanService.GetActiveRatePlansByPropertyAsync(propertyId);
            return Ok(ratePlans);
        }
    }
}