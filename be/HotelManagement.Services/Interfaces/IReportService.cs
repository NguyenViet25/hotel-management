using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for report service operations
    /// </summary>
    public interface IReportService
    {
        /// <summary>
        /// Gets revenue reports (UC-30)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="reportType">Type of report (Daily, Weekly, Monthly)</param>
        /// <returns>Revenue report data</returns>
        Task<object> GetRevenueReportAsync(Guid propertyId, DateTime fromDate, DateTime toDate, string reportType);

        /// <summary>
        /// Gets occupancy reports with metrics like OCC, ADR, RevPAR (UC-30)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="reportType">Type of report (Daily, Weekly, Monthly)</param>
        /// <returns>Occupancy report data</returns>
        Task<object> GetOccupancyReportAsync(Guid propertyId, DateTime fromDate, DateTime toDate, string reportType);

        /// <summary>
        /// Gets F&B sales reports (UC-30)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="reportType">Type of report (Daily, Weekly, Monthly)</param>
        /// <returns>F&B sales report data</returns>
        Task<object> GetFoodAndBeverageSalesReportAsync(Guid propertyId, DateTime fromDate, DateTime toDate, string reportType);

        /// <summary>
        /// Gets daily revenue report for a specific date (UC-41)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="date">The date for the report</param>
        /// <returns>Daily revenue report data</returns>
        Task<object> GetDailyRevenueReportAsync(Guid propertyId, DateTime date);

        /// <summary>
        /// Schedules a report to be sent via email (UC-31)
        /// </summary>
        /// <param name="reportType">Type of report to schedule</param>
        /// <param name="propertyId">The property ID</param>
        /// <param name="frequency">Frequency of the report (Daily, Weekly, Monthly)</param>
        /// <param name="recipients">List of email recipients</param>
        /// <param name="format">Format of the report (PDF, Excel, CSV)</param>
        /// <param name="startDate">Date to start sending the report</param>
        /// <returns>The created report schedule</returns>
        Task<object> ScheduleReportAsync(string reportType, Guid propertyId, string frequency, List<string> recipients, string format, DateTime startDate);

        /// <summary>
        /// Gets a report schedule by ID
        /// </summary>
        /// <param name="id">The report schedule ID</param>
        /// <returns>The report schedule</returns>
        Task<object> GetReportScheduleByIdAsync(Guid id);

        /// <summary>
        /// Updates a report schedule
        /// </summary>
        /// <param name="id">The report schedule ID</param>
        /// <param name="reportType">Type of report to schedule</param>
        /// <param name="propertyId">The property ID</param>
        /// <param name="frequency">Frequency of the report (Daily, Weekly, Monthly)</param>
        /// <param name="recipients">List of email recipients</param>
        /// <param name="format">Format of the report (PDF, Excel, CSV)</param>
        /// <param name="startDate">Date to start sending the report</param>
        /// <returns>True if the schedule was updated, false otherwise</returns>
        Task<bool> UpdateReportScheduleAsync(Guid id, string reportType, Guid propertyId, string frequency, List<string> recipients, string format, DateTime startDate);

        /// <summary>
        /// Deletes a report schedule
        /// </summary>
        /// <param name="id">The report schedule ID</param>
        /// <returns>True if the schedule was deleted, false otherwise</returns>
        Task<bool> DeleteReportScheduleAsync(Guid id);

        /// <summary>
        /// Gets all report schedules
        /// </summary>
        /// <returns>A list of report schedules</returns>
        Task<IEnumerable<object>> GetAllReportSchedulesAsync();

        /// <summary>
        /// Gets dashboard data for a property (UC-46)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>Dashboard data</returns>
        Task<object> GetDashboardDataAsync(Guid propertyId);
    }
}