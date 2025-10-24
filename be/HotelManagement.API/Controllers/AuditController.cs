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
    /// Controller for managing audit logs
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrator")]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        /// <summary>
        /// Gets audit logs with filtering options (UC-03, UC-38)
        /// </summary>
        /// <param name="fromDate">Start date for filtering</param>
        /// <param name="toDate">End date for filtering</param>
        /// <param name="userId">Filter by user ID</param>
        /// <param name="actionType">Filter by action type</param>
        /// <param name="entityType">Filter by entity type</param>
        /// <param name="propertyId">Filter by property ID</param>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Paged list of audit logs</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogs(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] Guid? userId = null,
            [FromQuery] string actionType = null,
            [FromQuery] string entityType = null,
            [FromQuery] Guid? propertyId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var auditLogs = await _auditService.GetAuditLogsAsync(
                fromDate,
                toDate,
                userId,
                actionType,
                entityType,
                propertyId,
                page,
                pageSize);

            return Ok(auditLogs);
        }

        /// <summary>
        /// Gets user login history (UC-03)
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="fromDate">Start date for filtering</param>
        /// <param name="toDate">End date for filtering</param>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Paged list of login history</returns>
        [HttpGet("login-history")]
        public async Task<ActionResult<IEnumerable<object>>> GetLoginHistory(
            [FromQuery] Guid? userId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var loginHistory = await _auditService.GetLoginHistoryAsync(
                userId,
                fromDate,
                toDate,
                page,
                pageSize);

            return Ok(loginHistory);
        }

        /// <summary>
        /// Gets user activity summary
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="fromDate">Start date for filtering</param>
        /// <param name="toDate">End date for filtering</param>
        /// <returns>User activity summary</returns>
        [HttpGet("user-activity/{userId}")]
        public async Task<ActionResult<object>> GetUserActivitySummary(
            Guid userId,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var activitySummary = await _auditService.GetUserActivitySummaryAsync(userId, fromDate, toDate);
            return Ok(activitySummary);
        }

        /// <summary>
        /// Exports audit logs to a file (UC-39)
        /// </summary>
        /// <param name="request">Export parameters</param>
        /// <returns>File download information</returns>
        [HttpPost("export")]
        public async Task<ActionResult<object>> ExportAuditLogs([FromBody] ExportAuditLogsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var exportResult = await _auditService.ExportAuditLogsAsync(
                request.FromDate,
                request.ToDate,
                request.UserId,
                request.ActionType,
                request.EntityType,
                request.PropertyId,
                request.Format);

            return Ok(exportResult);
        }

        /// <summary>
        /// Gets security audit report
        /// </summary>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <returns>Security audit report data</returns>
        [HttpGet("security-report")]
        public async Task<ActionResult<object>> GetSecurityAuditReport(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var report = await _auditService.GetSecurityAuditReportAsync(fromDate, toDate);
            return Ok(report);
        }

        /// <summary>
        /// Gets audit log details by ID
        /// </summary>
        /// <param name="id">The audit log ID</param>
        /// <returns>The audit log details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<AuditLog>> GetAuditLogById(Guid id)
        {
            var auditLog = await _auditService.GetAuditLogByIdAsync(id);
            if (auditLog == null)
            {
                return NotFound();
            }

            return Ok(auditLog);
        }
    }

    /// <summary>
    /// Request model for exporting audit logs
    /// </summary>
    public class ExportAuditLogsRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public Guid? UserId { get; set; }
        public string ActionType { get; set; }
        public string EntityType { get; set; }
        public Guid? PropertyId { get; set; }
        public string Format { get; set; } // "CSV", "PDF", "Excel"
    }
}