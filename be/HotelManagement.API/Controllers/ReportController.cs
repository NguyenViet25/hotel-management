using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.API.Models;
using HotelManagement.Services.Interfaces;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for generating and managing reports
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrator,PropertyManager,Accountant")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        /// <summary>
        /// Gets revenue reports (UC-30)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="reportType">Type of report (Daily, Weekly, Monthly)</param>
        /// <returns>Revenue report data</returns>
        [HttpGet("revenue")]
        public async Task<ActionResult<object>> GetRevenueReport(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string reportType = "Daily")
        {
            var report = await _reportService.GetRevenueReportAsync(propertyId, fromDate, toDate, reportType);
            return Ok(report);
        }

        /// <summary>
        /// Gets occupancy reports with metrics like OCC, ADR, RevPAR (UC-30)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="reportType">Type of report (Daily, Weekly, Monthly)</param>
        /// <returns>Occupancy report data</returns>
        [HttpGet("occupancy")]
        public async Task<ActionResult<object>> GetOccupancyReport(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string reportType = "Daily")
        {
            var report = await _reportService.GetOccupancyReportAsync(propertyId, fromDate, toDate, reportType);
            return Ok(report);
        }

        /// <summary>
        /// Gets F&B sales reports (UC-30)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="reportType">Type of report (Daily, Weekly, Monthly)</param>
        /// <returns>F&B sales report data</returns>
        [HttpGet("fb-sales")]
        public async Task<ActionResult<object>> GetFoodAndBeverageSalesReport(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string reportType = "Daily")
        {
            var report = await _reportService.GetFoodAndBeverageSalesReportAsync(propertyId, fromDate, toDate, reportType);
            return Ok(report);
        }

        /// <summary>
        /// Gets daily revenue report for a specific date (UC-41)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="date">The date for the report</param>
        /// <returns>Daily revenue report data</returns>
        [HttpGet("daily-revenue")]
        public async Task<ActionResult<object>> GetDailyRevenueReport(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime date)
        {
            var report = await _reportService.GetDailyRevenueReportAsync(propertyId, date);
            return Ok(report);
        }

        /// <summary>
        /// Schedules a report to be sent via email (UC-31)
        /// </summary>
        /// <param name="request">The report schedule details</param>
        /// <returns>The created report schedule</returns>
        [HttpPost("schedule")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<object>> ScheduleReport([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var schedule = await _reportService.ScheduleReportAsync(
                request.ReportType,
                request.PropertyId,
                request.Frequency,
                request.Recipients,
                request.Format,
                request.StartDate);

            return CreatedAtAction(nameof(GetReportSchedule), new { id = schedule.Id }, schedule);
        }

        /// <summary>
        /// Gets a report schedule by ID
        /// </summary>
        /// <param name="id">The report schedule ID</param>
        /// <returns>The report schedule</returns>
        [HttpGet("schedule/{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<object>> GetReportSchedule(Guid id)
        {
            var schedule = await _reportService.GetReportScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            return Ok(schedule);
        }

        /// <summary>
        /// Updates a report schedule
        /// </summary>
        /// <param name="id">The report schedule ID</param>
        /// <param name="request">The updated report schedule details</param>
        /// <returns>No content if successful</returns>
        [HttpPut("schedule/{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> UpdateReportSchedule(Guid id, [FromBody] ReportScheduleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _reportService.UpdateReportScheduleAsync(
                id,
                request.ReportType,
                request.PropertyId,
                request.Frequency,
                request.Recipients,
                request.Format,
                request.StartDate);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a report schedule
        /// </summary>
        /// <param name="id">The report schedule ID</param>
        /// <returns>No content if successful</returns>
        [HttpDelete("schedule/{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteReportSchedule(Guid id)
        {
            var result = await _reportService.DeleteReportScheduleAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Gets all report schedules
        /// </summary>
        /// <returns>A list of report schedules</returns>
        [HttpGet("schedules")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllReportSchedules()
        {
            var schedules = await _reportService.GetAllReportSchedulesAsync();
            return Ok(schedules);
        }

        /// <summary>
        /// Gets dashboard data for a property (UC-46)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>Dashboard data</returns>
        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboardData([FromQuery] Guid propertyId)
        {
            var dashboardData = await _reportService.GetDashboardDataAsync(propertyId);
            return Ok(dashboardData);
        }
    }


}