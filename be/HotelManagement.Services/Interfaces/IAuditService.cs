using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for audit service operations
    /// </summary>
    public interface IAuditService
    {
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
        Task<object> GetAuditLogsAsync(
            DateTime? fromDate,
            DateTime? toDate,
            Guid? userId,
            string actionType,
            string entityType,
            Guid? propertyId,
            int page,
            int pageSize);

        /// <summary>
        /// Gets user login history (UC-03)
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="fromDate">Start date for filtering</param>
        /// <param name="toDate">End date for filtering</param>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Paged list of login history</returns>
        Task<object> GetLoginHistoryAsync(
            Guid? userId,
            DateTime? fromDate,
            DateTime? toDate,
            int page,
            int pageSize);

        /// <summary>
        /// Gets user activity summary
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="fromDate">Start date for filtering</param>
        /// <param name="toDate">End date for filtering</param>
        /// <returns>User activity summary</returns>
        Task<object> GetUserActivitySummaryAsync(
            Guid userId,
            DateTime? fromDate,
            DateTime? toDate);

        /// <summary>
        /// Exports audit logs to a file (UC-39)
        /// </summary>
        /// <param name="fromDate">Start date for filtering</param>
        /// <param name="toDate">End date for filtering</param>
        /// <param name="userId">Filter by user ID</param>
        /// <param name="actionType">Filter by action type</param>
        /// <param name="entityType">Filter by entity type</param>
        /// <param name="propertyId">Filter by property ID</param>
        /// <param name="format">Export format ("CSV", "PDF", "Excel")</param>
        /// <returns>File download information</returns>
        Task<object> ExportAuditLogsAsync(
            DateTime? fromDate,
            DateTime? toDate,
            Guid? userId,
            string actionType,
            string entityType,
            Guid? propertyId,
            string format);

        /// <summary>
        /// Gets security audit report
        /// </summary>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <returns>Security audit report data</returns>
        Task<object> GetSecurityAuditReportAsync(
            DateTime fromDate,
            DateTime toDate);

        /// <summary>
        /// Gets audit log details by ID
        /// </summary>
        /// <param name="id">The audit log ID</param>
        /// <returns>The audit log details</returns>
        Task<AuditLog> GetAuditLogByIdAsync(Guid id);

        /// <summary>
        /// Logs an audit event
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="actionType">The action type</param>
        /// <param name="entityType">The entity type</param>
        /// <param name="entityId">The entity ID</param>
        /// <param name="propertyId">The property ID (if applicable)</param>
        /// <param name="oldValue">The old value (for updates)</param>
        /// <param name="newValue">The new value (for updates)</param>
        /// <param name="ipAddress">The IP address</param>
        /// <param name="userAgent">The user agent</param>
        /// <returns>The created audit log</returns>
        Task<AuditLog> LogAuditEventAsync(
            Guid userId,
            string actionType,
            string entityType,
            Guid? entityId,
            Guid? propertyId,
            string oldValue,
            string newValue,
            string ipAddress,
            string userAgent);
    }
}