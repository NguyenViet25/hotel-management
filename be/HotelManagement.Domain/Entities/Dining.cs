namespace HotelManagement.Domain;

public class Table
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;
}

public class DiningSession
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid TableId { get; set; }
    public Guid? WaiterUserId { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public DiningSessionStatus Status { get; set; } = DiningSessionStatus.Open;
}