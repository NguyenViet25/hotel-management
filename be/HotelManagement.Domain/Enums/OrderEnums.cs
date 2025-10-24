namespace HotelManagement.Domain.Enums
{
    public enum OrderStatus
    {
        Placed = 1,
        InProgress = 2,
        Ready = 3,
        Served = 4,
        Completed = 5,
        Cancelled = 6
    }
    
    public enum OrderItemStatus
    {
        Pending = 1,
        InPreparation = 2,
        Ready = 3,
        Served = 4,
        Cancelled = 5
    }
    
    public enum TableStatus
    {
        Available = 1,
        Reserved = 2,
        Occupied = 3,
        Dirty = 4,
        Maintenance = 5
    }
}