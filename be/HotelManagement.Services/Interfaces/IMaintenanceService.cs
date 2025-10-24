using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Service interface for managing maintenance tickets and schedules
    /// </summary>
    public interface IMaintenanceService
    {
        /// <summary>
        /// Creates a new maintenance ticket
        /// </summary>
        Task<MaintenanceTicket> CreateMaintenanceTicketAsync(
            Guid propertyId,
            Guid? roomId,
            string title,
            string description,
            MaintenanceTicketPriority priority,
            Guid reportedBy,
            List<string> imageUrls);

        /// <summary>
        /// Gets a maintenance ticket by its ID
        /// </summary>
        Task<MaintenanceTicket> GetMaintenanceTicketByIdAsync(Guid id);

        /// <summary>
        /// Gets maintenance tickets with optional filtering
        /// </summary>
        Task<IEnumerable<MaintenanceTicket>> GetMaintenanceTicketsAsync(
            Guid? propertyId = null,
            MaintenanceTicketStatus? status = null,
            MaintenanceTicketPriority? priority = null);

        /// <summary>
        /// Updates the status of a maintenance ticket
        /// </summary>
        Task<MaintenanceTicket> UpdateMaintenanceTicketStatusAsync(
            Guid id,
            MaintenanceTicketStatus status,
            string notes,
            Guid? assignedToId);

        /// <summary>
        /// Adds a comment to a maintenance ticket
        /// </summary>
        Task<MaintenanceTicket> AddCommentToMaintenanceTicketAsync(
            Guid id,
            string comment,
            Guid userId);

        /// <summary>
        /// Schedules preventive maintenance for equipment
        /// </summary>
        Task<object> SchedulePreventiveMaintenanceAsync(
            Guid propertyId,
            string equipmentName,
            string description,
            DateTime maintenanceDate,
            string recurrencePattern,
            Guid assignedToId);

        /// <summary>
        /// Gets a maintenance schedule by its ID
        /// </summary>
        Task<object> GetMaintenanceScheduleByIdAsync(Guid id);

        /// <summary>
        /// Gets maintenance schedules with optional filtering
        /// </summary>
        Task<IEnumerable<object>> GetMaintenanceSchedulesAsync(
            Guid? propertyId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null);

        /// <summary>
        /// Confirms completion of a scheduled maintenance
        /// </summary>
        Task<object> CompleteMaintenanceScheduleAsync(
            Guid id,
            string completionNotes,
            Guid completedById,
            DateTime completionDate,
            decimal cost);

        /// <summary>
        /// Gets equipment maintenance report
        /// </summary>
        Task<object> GetEquipmentMaintenanceReportAsync(
            Guid propertyId,
            DateTime? fromDate = null,
            DateTime? toDate = null);
    }
}