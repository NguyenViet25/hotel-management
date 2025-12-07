using HotelManagement.Domain;
using HotelManagement.Domain.Repositories;
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
    Task<ApiResponse<TableListResponse>> GetTablesAsync(Guid hotelId, string? search = null, bool? isActive = null, int? status = null, int page = 1, int pageSize = 50);
    Task<ApiResponse<bool>> DeleteTableAsync(Guid id);
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
        await _tableRepository.SaveChangesAsync();

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
        table.TableStatus =  request.TableStatus;

        await _tableRepository.UpdateAsync(table);
        await _tableRepository.SaveChangesAsync();

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

    public async Task<ApiResponse<TableListResponse>> GetTablesAsync(Guid hotelId, string? search = null, bool? isActive = null, int? status = null, int page = 1, int pageSize = 50)
    {
        var query = _tableRepository.Query()
            .Where(t => t.HotelId == hotelId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => t.Name.Contains(search));
        }

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

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

        if (status.HasValue)
        {
            dtos = dtos.Where(d => d.Status == status.Value).ToList();
        }

        return ApiResponse<TableListResponse>.Success(new TableListResponse
        {
            Tables = dtos,
            TotalCount = totalCount
        });
    }

    private async Task<TableDto> MapToDto(Table table)
    {
    
        return new TableDto
        {
            Id = table.Id,
            HotelId = table.HotelId,
            Name = table.Name,
            Capacity = table.Capacity,
            Status = table.TableStatus,

        };
    }

    public async Task<ApiResponse<bool>> DeleteTableAsync(Guid id)
    {
        var table = await _tableRepository.FindAsync(id);
        if (table is null)
        {
            return ApiResponse<bool>.Fail("Table not found");
        }

        var isOccupied = await _diningSessionRepository.Query()
            .AnyAsync(s => s.TableId == id && s.Status == DiningSessionStatus.Open);

        if (isOccupied)
        {
            return ApiResponse<bool>.Fail("Cannot delete an occupied table");
        }

        await _tableRepository.RemoveAsync(table);
        await _tableRepository.SaveChangesAsync();
        return ApiResponse<bool>.Success(true);
    }
}