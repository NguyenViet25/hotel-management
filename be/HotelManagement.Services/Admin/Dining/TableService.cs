using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Dining;

public interface ITableService
{
    Task<ApiResponse<TableDto>> CreateTableAsync(CreateTableRequest request);
    Task<ApiResponse<TableDto>> UpdateTableAsync(Guid id, UpdateTableRequest request);
    Task<ApiResponse<TableDto>> GetTableAsync(Guid id);
    Task<ApiResponse<TableListResponse>> GetTablesAsync(Guid hotelId, int page = 1, int pageSize = 50);
    Task<ApiResponse<TableDto>> MergeTablesAsync(MergeTablesRequest request);
    Task<ApiResponse<List<TableDto>>> SplitTableAsync(SplitTableRequest request);
    Task<ApiResponse<bool>> MoveSessionAsync(MoveSessionRequest request);
}

public class TableService : ITableService
{
    private readonly IRepository<Table> _tableRepository;
    private readonly IRepository<DiningSession> _diningSessionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TableService(
        IRepository<Table> tableRepository,
        IRepository<DiningSession> diningSessionRepository,
        IUnitOfWork unitOfWork)
    {
        _tableRepository = tableRepository;
        _diningSessionRepository = diningSessionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<TableDto>> CreateTableAsync(CreateTableRequest request)
    {
        var table = new Table
        {
            Id = Guid.NewGuid(),
            HotelId = request.HotelId,
            Name = request.Name,
            Capacity = request.Capacity,
            IsActive = true
        };

        await _tableRepository.AddAsync(table);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<TableDto>.Success(await MapToDto(table));
    }

    public async Task<ApiResponse<TableDto>> UpdateTableAsync(Guid id, UpdateTableRequest request)
    {
        var table = await _tableRepository.FindAsync(id);
        if (table == null)
        {
            return ApiResponse<TableDto>.Fail("Table not found");
        }

        table.Name = request.Name;
        table.Capacity = request.Capacity;
        table.IsActive = request.IsActive;

        await _tableRepository.UpdateAsync(table);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<TableDto>.Success(await MapToDto(table));
    }

    public async Task<ApiResponse<TableDto>> GetTableAsync(Guid id)
    {
        var table = await _tableRepository.FindAsync(id);
        if (table == null)
        {
            return ApiResponse<TableDto>.Fail("Table not found");
        }

        return ApiResponse<TableDto>.Success(await MapToDto(table));
    }

    public async Task<ApiResponse<TableListResponse>> GetTablesAsync(Guid hotelId, int page = 1, int pageSize = 50)
    {
        var query = _tableRepository.Query()
            .Where(t => t.HotelId == hotelId);

        var totalCount = await query.CountAsync();
        var tables = await query
            .OrderBy(t => t.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<TableDto>();
        foreach (var table in tables)
        {
            dtos.Add(await MapToDto(table));
        }

        return ApiResponse<TableListResponse>.Success(new TableListResponse
        {
            Tables = dtos,
            TotalCount = totalCount
        });
    }

    public async Task<ApiResponse<TableDto>> MergeTablesAsync(MergeTablesRequest request)
    {
        if (request.TableIds.Count < 2)
        {
            return ApiResponse<TableDto>.Fail("At least two tables are required for merging");
        }

        // Check if all tables exist and are not occupied
        var tables = new List<Table>();
        foreach (var tableId in request.TableIds)
        {
            var table = await _tableRepository.FindAsync(tableId);
            if (table == null)
            {
                return ApiResponse<TableDto>.Fail($"Table with ID {tableId} not found");
            }

            var isOccupied = await _diningSessionRepository.Query()
                .AnyAsync(s => s.TableId == tableId && s.Status == DiningSessionStatus.Open);

            if (isOccupied)
            {
                return ApiResponse<TableDto>.Fail($"Table {table.Name} is currently occupied");
            }

            tables.Add(table);
        }

        // Create a new merged table
        var totalCapacity = tables.Sum(t => t.Capacity);
        var newTable = new Table
        {
            Id = Guid.NewGuid(),
            HotelId = request.HotelId,
            Name = request.NewTableName,
            Capacity = totalCapacity,
            IsActive = true
        };

        await _tableRepository.AddAsync(newTable);

        // Deactivate the merged tables
        foreach (var table in tables)
        {
            table.IsActive = false;
            await _tableRepository.UpdateAsync(table);
        }

        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<TableDto>.Success(await MapToDto(newTable));
    }

    public async Task<ApiResponse<List<TableDto>>> SplitTableAsync(SplitTableRequest request)
    {
        var table = await _tableRepository.FindAsync(request.TableId);
        if (table == null)
        {
            return ApiResponse<List<TableDto>>.Fail("Table not found");
        }

        var isOccupied = await _diningSessionRepository.Query()
            .AnyAsync(s => s.TableId == request.TableId && s.Status == DiningSessionStatus.Open);

        if (isOccupied)
        {
            return ApiResponse<List<TableDto>>.Fail("Cannot split an occupied table");
        }

        // Create new tables
        var newTables = new List<Table>();
        foreach (var newTableRequest in request.NewTables)
        {
            var newTable = new Table
            {
                Id = Guid.NewGuid(),
                HotelId = request.HotelId,
                Name = newTableRequest.Name,
                Capacity = newTableRequest.Capacity,
                IsActive = true
            };

            await _tableRepository.AddAsync(newTable);
            newTables.Add(newTable);
        }

        // Deactivate the original table
        table.IsActive = false;
        await _tableRepository.UpdateAsync(table);

        await _unitOfWork.SaveChangesAsync();

        var dtos = new List<TableDto>();
        foreach (var newTable in newTables)
        {
            dtos.Add(await MapToDto(newTable));
        }

        return ApiResponse<List<TableDto>>.Success(dtos);
    }

    public async Task<ApiResponse<bool>> MoveSessionAsync(MoveSessionRequest request)
    {
        var session = await _diningSessionRepository.FindAsync(request.SessionId);
        if (session == null)
        {
            return ApiResponse<bool>.Fail("Dining session not found");
        }

        var newTable = await _tableRepository.FindAsync(request.NewTableId);
        if (newTable == null)
        {
            return ApiResponse<bool>.Fail("Target table not found");
        }

        // Check if target table is already occupied
        var isOccupied = await _diningSessionRepository.Query()
            .AnyAsync(s => s.TableId == request.NewTableId && s.Status == DiningSessionStatus.Open);

        if (isOccupied)
        {
            return ApiResponse<bool>.Fail("Target table is already occupied");
        }

        // Move the session to the new table
        session.TableId = request.NewTableId;
        await _diningSessionRepository.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.Success(true);
    }

    private async Task<TableDto> MapToDto(Table table)
    {
        var isOccupied = await _diningSessionRepository.Query()
            .AnyAsync(s => s.TableId == table.Id && s.Status == DiningSessionStatus.Open);

        return new TableDto
        {
            Id = table.Id,
            HotelId = table.HotelId,
            Name = table.Name,
            Capacity = table.Capacity,
            IsActive = table.IsActive,
            IsOccupied = isOccupied
        };
    }
}