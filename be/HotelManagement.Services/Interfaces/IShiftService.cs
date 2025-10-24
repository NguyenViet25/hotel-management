using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for shift service operations
    /// </summary>
    public interface IShiftService
    {
        /// <summary>
        /// Gets all shift templates for a property (UC-32)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of shift templates</returns>
        Task<IEnumerable<object>> GetShiftTemplatesAsync(Guid propertyId);

        /// <summary>
        /// Creates a new shift template (UC-32)
        /// </summary>
        /// <param name="name">The name of the shift template</param>
        /// <param name="propertyId">The property ID</param>
        /// <param name="startTime">The start time of the shift</param>
        /// <param name="endTime">The end time of the shift</param>
        /// <param name="department">The department the shift belongs to</param>
        /// <param name="description">The description of the shift</param>
        /// <returns>The created shift template</returns>
        Task<object> CreateShiftTemplateAsync(string name, Guid propertyId, TimeSpan startTime, TimeSpan endTime, string department, string description);

        /// <summary>
        /// Gets a shift template by ID
        /// </summary>
        /// <param name="id">The shift template ID</param>
        /// <returns>The shift template</returns>
        Task<object> GetShiftTemplateByIdAsync(Guid id);

        /// <summary>
        /// Updates a shift template
        /// </summary>
        /// <param name="id">The shift template ID</param>
        /// <param name="name">The updated name of the shift template</param>
        /// <param name="startTime">The updated start time of the shift</param>
        /// <param name="endTime">The updated end time of the shift</param>
        /// <param name="department">The updated department the shift belongs to</param>
        /// <param name="description">The updated description of the shift</param>
        /// <returns>True if the template was updated, false otherwise</returns>
        Task<bool> UpdateShiftTemplateAsync(Guid id, string name, TimeSpan startTime, TimeSpan endTime, string department, string description);

        /// <summary>
        /// Gets shift schedule for a property (UC-32)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the schedule</param>
        /// <param name="toDate">End date for the schedule</param>
        /// <param name="department">Optional department filter</param>
        /// <returns>Shift schedule data</returns>
        Task<object> GetShiftScheduleAsync(Guid propertyId, DateTime fromDate, DateTime toDate, string department);

        /// <summary>
        /// Creates shift assignments for multiple staff (UC-33)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="shiftDate">The date of the shift</param>
        /// <param name="shiftTemplateId">The shift template ID</param>
        /// <param name="staffIds">List of staff IDs to assign to the shift</param>
        /// <param name="notes">Any notes about the shift assignments</param>
        /// <returns>The created shift assignments</returns>
        Task<IEnumerable<object>> CreateShiftAssignmentsAsync(Guid propertyId, DateTime shiftDate, Guid shiftTemplateId, List<Guid> staffIds, string notes);

        /// <summary>
        /// Updates a shift assignment
        /// </summary>
        /// <param name="id">The shift assignment ID</param>
        /// <param name="shiftTemplateId">The updated shift template ID</param>
        /// <param name="staffId">The updated staff ID</param>
        /// <param name="notes">The updated notes about the shift assignment</param>
        /// <returns>The updated shift assignment</returns>
        Task<object> UpdateShiftAssignmentAsync(Guid id, Guid shiftTemplateId, Guid staffId, string notes);

        /// <summary>
        /// Requests a shift change or time off (UC-33)
        /// </summary>
        /// <param name="staffId">The staff ID requesting the change</param>
        /// <param name="shiftAssignmentId">The shift assignment ID to change</param>
        /// <param name="requestType">The type of request ("Change" or "TimeOff")</param>
        /// <param name="requestedDate">The requested date for the change</param>
        /// <param name="reason">The reason for the request</param>
        /// <returns>The created shift change request</returns>
        Task<object> RequestShiftChangeAsync(Guid staffId, Guid shiftAssignmentId, string requestType, DateTime requestedDate, string reason);

        /// <summary>
        /// Gets a shift change request by ID
        /// </summary>
        /// <param name="id">The shift change request ID</param>
        /// <returns>The shift change request</returns>
        Task<object> GetShiftChangeRequestByIdAsync(Guid id);

        /// <summary>
        /// Approves or rejects a shift change request (UC-33)
        /// </summary>
        /// <param name="id">The shift change request ID</param>
        /// <param name="isApproved">Whether the request is approved</param>
        /// <param name="approvedById">The ID of the user who approved/rejected the request</param>
        /// <param name="comments">Any comments about the approval/rejection</param>
        /// <returns>The updated shift change request</returns>
        Task<object> ApproveShiftChangeRequestAsync(Guid id, bool isApproved, Guid approvedById, string comments);

        /// <summary>
        /// Records staff attendance for a shift (UC-34)
        /// </summary>
        /// <param name="shiftAssignmentId">The shift assignment ID</param>
        /// <param name="clockInTime">The time the staff clocked in</param>
        /// <param name="clockOutTime">The time the staff clocked out (if applicable)</param>
        /// <param name="recordedById">The ID of the user who recorded the attendance</param>
        /// <param name="notes">Any notes about the attendance</param>
        /// <returns>The created attendance record</returns>
        Task<object> RecordShiftAttendanceAsync(Guid shiftAssignmentId, DateTime clockInTime, DateTime? clockOutTime, Guid recordedById, string notes);

        /// <summary>
        /// Records shift handover (UC-34)
        /// </summary>
        /// <param name="fromShiftAssignmentId">The shift assignment ID of the outgoing staff</param>
        /// <param name="toShiftAssignmentId">The shift assignment ID of the incoming staff</param>
        /// <param name="handoverTime">The time of the handover</param>
        /// <param name="cashAmount">The cash amount being handed over</param>
        /// <param name="notes">Any notes about the handover</param>
        /// <param name="recordedById">The ID of the user who recorded the handover</param>
        /// <returns>The created shift handover record</returns>
        Task<object> RecordShiftHandoverAsync(Guid fromShiftAssignmentId, Guid toShiftAssignmentId, DateTime handoverTime, decimal cashAmount, string notes, Guid recordedById);

        /// <summary>
        /// Gets staff shifts for a date range
        /// </summary>
        /// <param name="staffId">The staff ID</param>
        /// <param name="fromDate">Start date</param>
        /// <param name="toDate">End date</param>
        /// <returns>A list of shift assignments for the staff</returns>
        Task<IEnumerable<object>> GetStaffShiftsAsync(Guid staffId, DateTime fromDate, DateTime toDate);
    }
}