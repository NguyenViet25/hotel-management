using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.Services.Interfaces;
using HotelManagement.API.Models;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing work shifts
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ShiftController : ControllerBase
    {
        private readonly IShiftService _shiftService;

        public ShiftController(IShiftService shiftService)
        {
            _shiftService = shiftService;
        }

        /// <summary>
        /// Gets all shift templates for a property (UC-32)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of shift templates</returns>
        [HttpGet("templates")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<IEnumerable<object>>> GetShiftTemplates([FromQuery] Guid propertyId)
        {
            var templates = await _shiftService.GetShiftTemplatesAsync(propertyId);
            return Ok(templates);
        }

        /// <summary>
        /// Creates a new shift template (UC-32)
        /// </summary>
        /// <param name="request">The shift template details</param>
        /// <returns>The created shift template</returns>
        [HttpPost("templates")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> CreateShiftTemplate([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var template = await _shiftService.CreateShiftTemplateAsync(
                request.Name,
                request.PropertyId,
                request.StartTime,
                request.EndTime,
                request.Department,
                request.Description);

            return CreatedAtAction(nameof(GetShiftTemplateById), new { id = template.Id }, template);
        }

        /// <summary>
        /// Gets a shift template by ID
        /// </summary>
        /// <param name="id">The shift template ID</param>
        /// <returns>The shift template</returns>
        [HttpGet("templates/{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> GetShiftTemplateById(Guid id)
        {
            var template = await _shiftService.GetShiftTemplateByIdAsync(id);
            if (template == null)
            {
                return NotFound();
            }

            return Ok(template);
        }

        /// <summary>
        /// Updates a shift template
        /// </summary>
        /// <param name="id">The shift template ID</param>
        /// <param name="request">The updated shift template details</param>
        /// <returns>No content if successful</returns>
        [HttpPut("templates/{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<IActionResult> UpdateShiftTemplate(Guid id, [FromBody] ShiftTemplateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _shiftService.UpdateShiftTemplateAsync(
                id,
                request.Name,
                request.StartTime,
                request.EndTime,
                request.Department,
                request.Description);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Gets shift schedule for a property (UC-32)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the schedule</param>
        /// <param name="toDate">End date for the schedule</param>
        /// <param name="department">Optional department filter</param>
        /// <returns>Shift schedule data</returns>
        [HttpGet("schedule")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> GetShiftSchedule(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string department = null)
        {
            var schedule = await _shiftService.GetShiftScheduleAsync(propertyId, fromDate, toDate, department);
            return Ok(schedule);
        }

        /// <summary>
        /// Creates shift assignments for multiple staff (UC-33)
        /// </summary>
        /// <param name="request">The shift assignment details</param>
        /// <returns>The created shift assignments</returns>
        [HttpPost("assignments")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<IEnumerable<object>>> CreateShiftAssignments([FromBody] ShiftAssignmentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var assignments = await _shiftService.CreateShiftAssignmentsAsync(
                request.PropertyId,
                request.ShiftDate,
                request.ShiftTemplateId,
                request.StaffIds,
                request.Notes);

            return Ok(assignments);
        }

        /// <summary>
        /// Updates a shift assignment
        /// </summary>
        /// <param name="id">The shift assignment ID</param>
        /// <param name="request">The updated shift assignment details</param>
        /// <returns>The updated shift assignment</returns>
        [HttpPut("assignments/{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> UpdateShiftAssignment(Guid id, [FromBody] UpdateShiftAssignmentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var assignment = await _shiftService.UpdateShiftAssignmentAsync(
                id,
                request.ShiftTemplateId,
                request.StaffId,
                request.Notes);

            if (assignment == null)
            {
                return NotFound();
            }

            return Ok(assignment);
        }

        /// <summary>
        /// Requests a shift change or time off (UC-33)
        /// </summary>
        /// <param name="request">The shift change request details</param>
        /// <returns>The created shift change request</returns>
        [HttpPost("change-requests")]
        public async Task<ActionResult<object>> RequestShiftChange([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var changeRequest = await _shiftService.RequestShiftChangeAsync(
                request.StaffId,
                request.ShiftAssignmentId,
                request.RequestType,
                request.RequestedDate,
                request.Reason);

            return CreatedAtAction(nameof(GetShiftChangeRequestById), new { id = changeRequest.Id }, changeRequest);
        }

        /// <summary>
        /// Gets a shift change request by ID
        /// </summary>
        /// <param name="id">The shift change request ID</param>
        /// <returns>The shift change request</returns>
        [HttpGet("change-requests/{id}")]
        public async Task<ActionResult<object>> GetShiftChangeRequestById(Guid id)
        {
            var changeRequest = await _shiftService.GetShiftChangeRequestByIdAsync(id);
            if (changeRequest == null)
            {
                return NotFound();
            }

            return Ok(changeRequest);
        }

        /// <summary>
        /// Approves or rejects a shift change request (UC-33)
        /// </summary>
        /// <param name="id">The shift change request ID</param>
        /// <param name="request">The approval details</param>
        /// <returns>The updated shift change request</returns>
        [HttpPut("change-requests/{id}/approval")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> ApproveShiftChangeRequest(Guid id, [FromBody] ShiftChangeApprovalRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var changeRequest = await _shiftService.ApproveShiftChangeRequestAsync(
                id,
                request.IsApproved,
                request.ApprovedById,
                request.Comments);

            if (changeRequest == null)
            {
                return NotFound();
            }

            return Ok(changeRequest);
        }

        /// <summary>
        /// Records staff attendance for a shift (UC-34)
        /// </summary>
        /// <param name="request">The attendance record details</param>
        /// <returns>The created attendance record</returns>
        [HttpPost("attendance")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<object>> RecordShiftAttendance([FromBody] ShiftAttendanceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var attendance = await _shiftService.RecordShiftAttendanceAsync(
                request.ShiftAssignmentId,
                request.ClockInTime,
                request.ClockOutTime,
                request.RecordedById,
                request.Notes);

            return Ok(attendance);
        }

        /// <summary>
        /// Records shift handover (UC-34)
        /// </summary>
        /// <param name="request">The shift handover details</param>
        /// <returns>The created shift handover record</returns>
        [HttpPost("handovers")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<object>> RecordShiftHandover([FromBody] ShiftHandoverRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var handover = await _shiftService.RecordShiftHandoverAsync(
                request.FromShiftAssignmentId,
                request.ToShiftAssignmentId,
                request.HandoverTime,
                request.CashAmount,
                request.Notes,
                request.RecordedById);

            return Ok(handover);
        }

        /// <summary>
        /// Gets staff shifts for a date range
        /// </summary>
        /// <param name="staffId">The staff ID</param>
        /// <param name="fromDate">Start date</param>
        /// <param name="toDate">End date</param>
        /// <returns>A list of shift assignments for the staff</returns>
        [HttpGet("staff/{staffId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetStaffShifts(
            Guid staffId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var shifts = await _shiftService.GetStaffShiftsAsync(staffId, fromDate, toDate);
            return Ok(shifts);
        }
    }


}