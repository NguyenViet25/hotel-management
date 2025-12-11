namespace HotelManagement.Domain;

public class Table
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;
    public int TableStatus { get; set; }
}


public class DiningSession
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? TableId { get; set; }
    public Guid? WaiterUserId { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.Now;
    public DateTime? EndedAt { get; set; }
    public string Notes { get; set; } = string.Empty;
    public int TotalGuests { get; set; }
    public DiningSessionStatus Status { get; set; } = DiningSessionStatus.Open;
}

public class DiningSessionTable
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid DiningSessionId { get; set; }
    public Guid TableId { get; set; }
    public DateTime AttachedAt { get; set; } = DateTime.Now;
}
