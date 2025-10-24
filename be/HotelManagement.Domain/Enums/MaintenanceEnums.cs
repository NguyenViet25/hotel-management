namespace HotelManagement.Domain.Enums
{
    public enum MaintenanceTicketPriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }
    
    public enum MaintenanceTicketStatus
    {
        Reported = 1,
        Assigned = 2,
        InProgress = 3,
        OnHold = 4,
        Completed = 5,
        Verified = 6,
        Cancelled = 7
    }
    
    // Keep the original enums for backward compatibility
    public enum MaintenancePriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }
    
    public enum MaintenanceStatus
    {
        Reported = 1,
        Assigned = 2,
        InProgress = 3,
        OnHold = 4,
        Completed = 5,
        Verified = 6,
        Cancelled = 7
    }
}