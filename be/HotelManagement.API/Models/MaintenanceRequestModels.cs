using System;
using System.Collections.Generic;
using HotelManagement.Domain.Enums;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating a maintenance ticket
    /// </summary>
    public class MaintenanceTicketRequest
    {
        public Guid PropertyId { get; set; }
        public Guid? RoomId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public MaintenanceTicketPriority Priority { get; set; }
        public Guid ReportedBy { get; set; }
        public List<string> ImageUrls { get; set; }
    }

    /// <summary>
    /// Request model for updating the status of a maintenance ticket
    /// </summary>
    public class UpdateTicketStatusRequest
    {
        public MaintenanceTicketStatus Status { get; set; }
        public string Notes { get; set; }
        public Guid? AssignedToId { get; set; }
    }

    /// <summary>
    /// Request model for adding a comment to a maintenance ticket
    /// </summary>
    public class AddCommentRequest
    {
        public string Comment { get; set; }
        public Guid UserId { get; set; }
    }

    /// <summary>
    /// Request model for scheduling preventive maintenance
    /// </summary>
    public class PreventiveMaintenanceRequest
    {
        public Guid PropertyId { get; set; }
        public string EquipmentName { get; set; }
        public string Description { get; set; }
        public DateTime MaintenanceDate { get; set; }
        public string RecurrencePattern { get; set; } // Daily, Weekly, Monthly, Quarterly, Yearly
        public Guid AssignedToId { get; set; }
    }

    /// <summary>
    /// Request model for completing a scheduled maintenance
    /// </summary>
    public class CompleteMaintenanceRequest
    {
        public string CompletionNotes { get; set; }
        public Guid CompletedById { get; set; }
        public DateTime CompletionDate { get; set; }
        public decimal Cost { get; set; }
    }
}