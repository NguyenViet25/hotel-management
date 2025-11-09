using System;

namespace HotelManagement.Services.Admin.Dining.Dtos;

public class TableDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; }
    public bool IsOccupied { get; set; }
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
    public bool IsActive { get; set; }
}

public class MergeTablesRequest
{
    public Guid HotelId { get; set; }
    public List<Guid> TableIds { get; set; } = new List<Guid>();
    public string NewTableName { get; set; } = string.Empty;
}

public class SplitTableRequest
{
    public Guid HotelId { get; set; }
    public Guid TableId { get; set; }
    public List<CreateTableRequest> NewTables { get; set; } = new List<CreateTableRequest>();
}

public class MoveSessionRequest
{
    public Guid SessionId { get; set; }
    public Guid NewTableId { get; set; }
}

public class TableListResponse
{
    public List<TableDto> Tables { get; set; } = new List<TableDto>();
    public int TotalCount { get; set; }
}