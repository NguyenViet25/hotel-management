using System;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    public class MaintenanceTicket : BaseEntity
    {
        public string TicketNumber { get; set; }
        public Guid RoomId { get; set; }
        public Guid HotelPropertyId { get; set; }
        public Guid? AssignedToUserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public MaintenancePriority Priority { get; set; }
        public MaintenanceStatus Status { get; set; }
        public DateTime ReportedDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        public string Notes { get; set; }
        public decimal? Cost { get; set; }
        
        // Navigation properties
        public virtual Room Room { get; set; }
        public virtual HotelProperty HotelProperty { get; set; }
        public virtual User AssignedToUser { get; set; }
    }
}