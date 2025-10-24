using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating or updating a shift template
    /// </summary>
    public class ShiftTemplateRequest
    {
        /// <summary>
        /// The name of the shift template
        /// </summary>
        [Required]
        public string Name { get; set; }

        /// <summary>
        /// The ID of the property this shift template belongs to
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The start time of the shift
        /// </summary>
        [Required]
        public TimeSpan StartTime { get; set; }

        /// <summary>
        /// The end time of the shift
        /// </summary>
        [Required]
        public TimeSpan EndTime { get; set; }

        /// <summary>
        /// The department this shift template is for
        /// </summary>
        [Required]
        public string Department { get; set; }

        /// <summary>
        /// Description of the shift template
        /// </summary>
        public string Description { get; set; }
    }

    /// <summary>
    /// Request model for creating shift assignments
    /// </summary>
    public class ShiftAssignmentRequest
    {
        /// <summary>
        /// The ID of the property where the shifts are being assigned
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The date of the shift
        /// </summary>
        [Required]
        public DateTime ShiftDate { get; set; }

        /// <summary>
        /// The ID of the shift template to use
        /// </summary>
        [Required]
        public Guid ShiftTemplateId { get; set; }

        /// <summary>
        /// The IDs of the staff members to assign to the shift
        /// </summary>
        [Required]
        public List<Guid> StaffIds { get; set; }

        /// <summary>
        /// Additional notes about the shift assignment
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// Request model for updating a shift assignment
    /// </summary>
    public class UpdateShiftAssignmentRequest
    {
        /// <summary>
        /// The ID of the shift template to use
        /// </summary>
        [Required]
        public Guid ShiftTemplateId { get; set; }

        /// <summary>
        /// The ID of the staff member to assign to the shift
        /// </summary>
        [Required]
        public Guid StaffId { get; set; }

        /// <summary>
        /// Additional notes about the shift assignment
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// Request model for requesting a shift change
    /// </summary>
    public class ShiftChangeRequest
    {
        /// <summary>
        /// The ID of the staff member requesting the change
        /// </summary>
        [Required]
        public Guid StaffId { get; set; }

        /// <summary>
        /// The ID of the shift assignment to change
        /// </summary>
        [Required]
        public Guid ShiftAssignmentId { get; set; }

        /// <summary>
        /// The type of request ("Change" or "TimeOff")
        /// </summary>
        [Required]
        public string RequestType { get; set; }

        /// <summary>
        /// The requested date for the shift change
        /// </summary>
        [Required]
        public DateTime RequestedDate { get; set; }

        /// <summary>
        /// The reason for the shift change request
        /// </summary>
        [Required]
        public string Reason { get; set; }
    }

    /// <summary>
    /// Request model for approving a shift change request
    /// </summary>
    public class ShiftChangeApprovalRequest
    {
        /// <summary>
        /// Whether the request is approved
        /// </summary>
        [Required]
        public bool IsApproved { get; set; }

        /// <summary>
        /// The ID of the staff member who approved/rejected the request
        /// </summary>
        [Required]
        public Guid ApprovedById { get; set; }

        /// <summary>
        /// Comments about the approval/rejection
        /// </summary>
        public string Comments { get; set; }
    }

    /// <summary>
    /// Request model for recording shift attendance
    /// </summary>
    public class ShiftAttendanceRequest
    {
        /// <summary>
        /// The ID of the shift assignment
        /// </summary>
        [Required]
        public Guid ShiftAssignmentId { get; set; }

        /// <summary>
        /// The time the staff member clocked in
        /// </summary>
        [Required]
        public DateTime ClockInTime { get; set; }

        /// <summary>
        /// The time the staff member clocked out
        /// </summary>
        public DateTime? ClockOutTime { get; set; }

        /// <summary>
        /// The ID of the staff member who recorded the attendance
        /// </summary>
        [Required]
        public Guid RecordedById { get; set; }

        /// <summary>
        /// Additional notes about the attendance
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// Request model for recording shift handover
    /// </summary>
    public class ShiftHandoverRequest
    {
        /// <summary>
        /// The ID of the shift assignment being handed over from
        /// </summary>
        [Required]
        public Guid FromShiftAssignmentId { get; set; }

        /// <summary>
        /// The ID of the shift assignment being handed over to
        /// </summary>
        [Required]
        public Guid ToShiftAssignmentId { get; set; }

        /// <summary>
        /// The time of the handover
        /// </summary>
        [Required]
        public DateTime HandoverTime { get; set; }

        /// <summary>
        /// The cash amount being handed over
        /// </summary>
        [Required]
        public decimal CashAmount { get; set; }

        /// <summary>
        /// Additional notes about the handover
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// The ID of the staff member who recorded the handover
        /// </summary>
        [Required]
        public Guid RecordedById { get; set; }
    }
}