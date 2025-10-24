namespace HotelManagement.Domain.Enums
{
    public enum RoomStatus
    {
        Available = 1,
        Occupied = 2,
        Reserved = 3,
        OutOfService = 4,
        OutOfOrder = 5
    }
    
    public enum RoomCleaningStatus
    {
        Dirty = 1,
        Cleaning = 2,
        Cleaned = 3,
        Inspected = 4
    }
}