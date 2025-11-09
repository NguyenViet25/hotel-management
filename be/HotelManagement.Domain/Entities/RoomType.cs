namespace HotelManagement.Domain;

public class RoomType
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public int Capacity { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePriceFrom { get; set; }
    public decimal BasePriceTo { get; set; }
    public Hotel? Hotel { get; set; }
    public string Prices { get; set; } = string.Empty;
    public ICollection<HotelRoom> Rooms { get; set; } = new List<HotelRoom>();
}