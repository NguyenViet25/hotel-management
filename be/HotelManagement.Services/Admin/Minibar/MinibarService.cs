using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Minibar.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Minibar;

public class MinibarService : IMinibarService
{
    private readonly IRepository<Domain.Minibar> _minibarRepository;

    public MinibarService(IRepository<Domain.Minibar> minibarRepository)
    {
        _minibarRepository = minibarRepository;
    }

    public async Task<ApiResponse<MinibarDto>> CreateAsync(MinibarCreateRequest request)
    {
        try
        {
            var entity = new Domain.Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = request.HotelId,
                RoomTypeId = request.RoomTypeId,
                Name = request.Name,
                Price = request.Price,
                Quantity = request.Quantity
            };

            await _minibarRepository.AddAsync(entity);
            await _minibarRepository.SaveChangesAsync();

            return ApiResponse<MinibarDto>.Ok(MapToDto(entity));
        }
        catch (Exception ex)
        {
            return ApiResponse<MinibarDto>.Fail($"Error creating minibar: {ex.Message}");
        }
    }

    public async Task<ApiResponse<MinibarDto>> UpdateAsync(Guid id, MinibarUpdateRequest request)
    {
        try
        {
            var entity = await _minibarRepository.FindAsync(id);
            if (entity == null) return ApiResponse<MinibarDto>.Fail("Minibar not found");

            entity.HotelId = request.HotelId;
            entity.RoomTypeId = request.RoomTypeId;
            entity.Name = request.Name;
            entity.Price = request.Price;
            entity.Quantity = request.Quantity;

            await _minibarRepository.UpdateAsync(entity);
            await _minibarRepository.SaveChangesAsync();

            return ApiResponse<MinibarDto>.Ok(MapToDto(entity));
        }
        catch (Exception ex)
        {
            return ApiResponse<MinibarDto>.Fail($"Error updating minibar: {ex.Message}");
        }
    }

    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        try
        {
            var entity = await _minibarRepository.FindAsync(id);
            if (entity == null) return ApiResponse<bool>.Fail("Minibar not found");

            await _minibarRepository.RemoveAsync(entity);
            await _minibarRepository.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail($"Error deleting minibar: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<MinibarDto>>> GetAllAsync(Guid? hotelId = null, Guid? roomTypeId = null, string? search = null, int page = 1, int pageSize = 50)
    {
        try
        {
            var q = _minibarRepository.Query().Where(x => true);
            if (hotelId.HasValue) q = q.Where(x => x.HotelId == hotelId.Value);
            if (roomTypeId.HasValue) q = q.Where(x => x.RoomTypeId == roomTypeId.Value);
            if (!string.IsNullOrWhiteSpace(search)) q = q.Where(x => x.Name.Contains(search));

            var total = await q.CountAsync();

            if (pageSize > 0)
            {
                q = q.Skip((page - 1) * pageSize).Take(pageSize);
            }

            var list = await q.Select(x => new MinibarDto
            {
                Id = x.Id,
                HotelId = x.HotelId,
                RoomTypeId = x.RoomTypeId,
                Name = x.Name,
                Price = x.Price,
                Quantity = x.Quantity
            }).ToListAsync();

            var meta = new { total, page, pageSize };
            return ApiResponse<List<MinibarDto>>.Success(list, meta: meta);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<MinibarDto>>.Fail($"Error listing minibars: {ex.Message}");
        }
    }

    public async Task<ApiResponse<MinibarDto>> GetByIdAsync(Guid id)
    {
        try
        {
            var entity = await _minibarRepository.FindAsync(id);
            if (entity == null) return ApiResponse<MinibarDto>.Fail("Minibar not found");
            return ApiResponse<MinibarDto>.Ok(MapToDto(entity));
        }
        catch (Exception ex)
        {
            return ApiResponse<MinibarDto>.Fail($"Error retrieving minibar: {ex.Message}");
        }
    }

    private static MinibarDto MapToDto(Domain.Minibar e)
    {
        return new MinibarDto
        {
            Id = e.Id,
            HotelId = e.HotelId,
            RoomTypeId = e.RoomTypeId,
            Name = e.Name,
            Price = e.Price,
            Quantity = e.Quantity
        };
    }
}