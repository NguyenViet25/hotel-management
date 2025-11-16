namespace HotelManagement.Services.Admin.Dining.Dtos;

public class TableDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public int Status { get; set; }
}

public class CreateTableRequest
{
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
}

public class UpdateTableRequest
{
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public int TableStatus { get; set; } 
}


public class TableListResponse
{
    public List<TableDto> Tables { get; set; } = new List<TableDto>();
    public int TotalCount { get; set; }
}