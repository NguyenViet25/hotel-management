using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.API.Models;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using HotelManagement.Domain.Enums;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing maintenance tickets
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceService _maintenanceService;

        public MaintenanceController(IMaintenanceService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        /// <summary>
        /// Creates a new maintenance ticket (UC-23)
        /// </summary>
        /// <param name="request">The maintenance ticket details</param>
        /// <returns>The created maintenance ticket</returns>
        [HttpPost("tickets")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Housekeeper")]
        public async Task<ActionResult<MaintenanceTicket>> CreateMaintenanceTicket([FromBody] MaintenanceTicketRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ticket = await _maintenanceService.CreateMaintenanceTicketAsync(
                request.PropertyId,
                request.RoomId,
                request.Title,
                request.Description,
                request.Priority,
                request.ReportedBy,
                request.ImageUrls);

            return CreatedAtAction(nameof(GetMaintenanceTicketById), new { id = ticket.Id }, ticket);
        }

        /// <summary>
        /// Gets a maintenance ticket by its ID
        /// </summary>
        /// <param name="id">The ID of the maintenance ticket to retrieve</param>
        /// <returns>The maintenance ticket if found, or NotFound if not found</returns>
        [HttpGet("tickets/{id}")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Housekeeper")]
        public async Task<ActionResult<MaintenanceTicket>> GetMaintenanceTicketById(Guid id)
        {
            var ticket = await _maintenanceService.GetMaintenanceTicketByIdAsync(id);
            if (ticket == null)
            {
                return NotFound();
            }

            return Ok(ticket);
        }

        /// <summary>
        /// Gets all maintenance tickets with optional filtering
        /// </summary>
        /// <param name="propertyId">Optional property ID filter</param>
        /// <param name="status">Optional ticket status filter</param>
        /// <param name="priority">Optional priority filter</param>
        /// <returns>A list of maintenance tickets matching the criteria</returns>
        [HttpGet("tickets")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Housekeeper")]
        public async Task<ActionResult<IEnumerable<MaintenanceTicket>>> GetMaintenanceTickets(
            [FromQuery] Guid? propertyId = null,
            [FromQuery] MaintenanceTicketStatus? status = null,
            [FromQuery] MaintenanceTicketPriority? priority = null)
        {
            var tickets = await _maintenanceService.GetMaintenanceTicketsAsync(propertyId, status, priority);
            return Ok(tickets);
        }

        /// <summary>
        /// Updates the status of a maintenance ticket (UC-24)
        /// </summary>
        /// <param name="id">The ID of the maintenance ticket to update</param>
        /// <param name="request">The status update details</param>
        /// <returns>The updated maintenance ticket</returns>
        [HttpPatch("tickets/{id}/status")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<MaintenanceTicket>> UpdateMaintenanceTicketStatus(Guid id, [FromBody] UpdateTicketStatusRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ticket = await _maintenanceService.UpdateMaintenanceTicketStatusAsync(
                id,
                request.Status,
                request.Notes,
                request.AssignedToId);

            if (ticket == null)
            {
                return NotFound();
            }

            return Ok(ticket);
        }

        /// <summary>
        /// Adds a comment to a maintenance ticket
        /// </summary>
        /// <param name="id">The ID of the maintenance ticket</param>
        /// <param name="request">The comment details</param>
        /// <returns>The updated maintenance ticket</returns>
        [HttpPost("tickets/{id}/comments")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Housekeeper")]
        public async Task<ActionResult<MaintenanceTicket>> AddCommentToMaintenanceTicket(Guid id, [FromBody] AddCommentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ticket = await _maintenanceService.AddCommentToMaintenanceTicketAsync(
                id,
                request.Comment,
                request.UserId);

            if (ticket == null)
            {
                return NotFound();
            }

            return Ok(ticket);
        }

        /// <summary>
        /// Schedules preventive maintenance for equipment (UC-48)
        /// </summary>
        /// <param name="request">The preventive maintenance schedule details</param>
        /// <returns>The created maintenance schedule</returns>
        [HttpPost("schedules")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> SchedulePreventiveMaintenance([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var schedule = await _maintenanceService.SchedulePreventiveMaintenanceAsync(
                request.PropertyId,
                request.EquipmentName,
                request.Description,
                request.MaintenanceDate,
                request.RecurrencePattern,
                request.AssignedToId);

            return CreatedAtAction(nameof(GetMaintenanceScheduleById), new { id = schedule.Id }, schedule);
        }

        /// <summary>
        /// Gets a maintenance schedule by its ID
        /// </summary>
        /// <param name="id">The ID of the maintenance schedule to retrieve</param>
        /// <returns>The maintenance schedule if found, or NotFound if not found</returns>
        [HttpGet("schedules/{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> GetMaintenanceScheduleById(Guid id)
        {
            var schedule = await _maintenanceService.GetMaintenanceScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            return Ok(schedule);
        }

        /// <summary>
        /// Gets all maintenance schedules with optional filtering
        /// </summary>
        /// <param name="propertyId">Optional property ID filter</param>
        /// <param name="fromDate">Optional from date filter</param>
        /// <param name="toDate">Optional to date filter</param>
        /// <returns>A list of maintenance schedules matching the criteria</returns>
        [HttpGet("schedules")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<IEnumerable<object>>> GetMaintenanceSchedules(
            [FromQuery] Guid? propertyId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var schedules = await _maintenanceService.GetMaintenanceSchedulesAsync(propertyId, fromDate, toDate);
            return Ok(schedules);
        }

        /// <summary>
        /// Confirms completion of a scheduled maintenance (UC-49)
        /// </summary>
        /// <param name="id">The ID of the maintenance schedule</param>
        /// <param name="request">The completion details</param>
        /// <returns>The updated maintenance schedule</returns>
        [HttpPost("schedules/{id}/complete")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> CompleteMaintenanceSchedule(Guid id, [FromBody] CompleteMaintenanceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var schedule = await _maintenanceService.CompleteMaintenanceScheduleAsync(
                id,
                request.CompletionNotes,
                request.CompletedById,
                request.CompletionDate,
                request.Cost);

            if (schedule == null)
            {
                return NotFound();
            }

            return Ok(schedule);
        }

        /// <summary>
        /// Gets equipment maintenance report (UC-50)
        /// </summary>
        /// <param name="propertyId">The property ID to filter by</param>
        /// <param name="fromDate">Optional from date filter</param>
        /// <param name="toDate">Optional to date filter</param>
        /// <returns>Equipment maintenance report</returns>
        [HttpGet("reports/equipment")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> GetEquipmentMaintenanceReport(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var report = await _maintenanceService.GetEquipmentMaintenanceReportAsync(propertyId, fromDate, toDate);
            return Ok(report);
        }
    }
}