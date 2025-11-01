using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Rooms.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Rooms;

public class RoomsService : IRoomsService
{
    private readonly IRepository<HotelRoom> _roomRepository;
    private readonly IRepository<RoomType> _roomTypeRepository;
    private readonly IRepository<Hotel> _hotelRepository;
    private readonly IRepository<Booking> _bookingRepository;
    private readonly IRepository<RoomStatusLog> _roomStatusLogRepository;

    public RoomsService(
        IRepository<HotelRoom> roomRepository,
        IRepository<RoomType> roomTypeRepository,
        IRepository<Hotel> hotelRepository,
        IRepository<Booking> bookingRepository,
        IRepository<RoomStatusLog> roomStatusLogRepository)
    {
        _roomRepository = roomRepository;
        _roomTypeRepository = roomTypeRepository;
        _hotelRepository = hotelRepository;
        _bookingRepository = bookingRepository;
        _roomStatusLogRepository = roomStatusLogRepository;
    }

    public async Task<ApiResponse<List<RoomSummaryDto>>> ListAsync(RoomsQueryDto query)
    {
        try
        {
            var q = _roomRepository.Query()
                .Include(r => r.RoomType)
                .Where(x => true);

            if (query.HotelId.HasValue)
            {
                q = q.Where(r => r.HotelId == query.HotelId.Value);
            }

            if (query.Status.HasValue)
            {
                q = q.Where(r => r.Status == query.Status.Value);
            }

            if (query.RoomTypeId.HasValue)
            {
                q = q.Where(r => r.RoomTypeId == query.RoomTypeId.Value);
            }

            if (query.Floor.HasValue)
            {
                q = q.Where(r => r.Floor == query.Floor.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                q = q.Where(r => r.Number.Contains(query.Search!));
            }

            var items = await q
                .OrderBy(r => r.Floor)
                .ThenBy(r => r.Number)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = items.Select(r => new RoomSummaryDto
            {
                Id = r.Id,
                HotelId = r.HotelId,
                RoomTypeId = r.RoomTypeId,
                RoomTypeName = r.RoomType?.Name ?? string.Empty,
                Number = r.Number,
                Floor = r.Floor,
                Status = r.Status
            }).ToList();

            return ApiResponse<List<RoomSummaryDto>>.Ok(dtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<RoomSummaryDto>>.Fail($"Error listing rooms: {ex.Message}");
        }
    }

    public async Task<ApiResponse<RoomSummaryDto>> CreateAsync(CreateRoomDto dto)
    {
        try
        {
            var hotel = await _hotelRepository.FindAsync(dto.HotelId);
            if (hotel == null) return ApiResponse<RoomSummaryDto>.Fail("Hotel not found");

            var roomType = await _roomTypeRepository.Query()
                .FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId && rt.HotelId == dto.HotelId);
            if (roomType == null) return ApiResponse<RoomSummaryDto>.Fail("Room type not found in hotel");

            var existing = await _roomRepository.Query()
                .AnyAsync(r => r.HotelId == dto.HotelId && r.Number == dto.Number);
            if (existing) return ApiResponse<RoomSummaryDto>.Fail("Room number already exists in this hotel");

            var room = new HotelRoom
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                RoomTypeId = dto.RoomTypeId,
                Number = dto.Number,
                Floor = dto.Floor,
                Status = RoomStatus.Available
            };

            await _roomRepository.AddAsync(room);
            await _roomRepository.SaveChangesAsync();

            return ApiResponse<RoomSummaryDto>.Ok(new RoomSummaryDto
            {
                Id = room.Id,
                HotelId = room.HotelId,
                RoomTypeId = room.RoomTypeId,
                RoomTypeName = roomType.Name,
                Number = room.Number,
                Floor = room.Floor,
                Status = room.Status
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<RoomSummaryDto>.Fail($"Error creating room: {ex.Message}");
        }
    }

    public async Task<ApiResponse<RoomSummaryDto>> UpdateAsync(Guid id, UpdateRoomDto dto)
    {
        try
        {
            var room = await _roomRepository.Query().Include(r => r.RoomType).FirstOrDefaultAsync(r => r.Id == id);
            if (room == null) return ApiResponse<RoomSummaryDto>.Fail("Room not found");

            if (dto.Number != null && dto.Number != room.Number)
            {
                var exists = await _roomRepository.Query()
                    .AnyAsync(r => r.HotelId == room.HotelId && r.Number == dto.Number);
                if (exists) return ApiResponse<RoomSummaryDto>.Fail("Another room with this number already exists");
                room.Number = dto.Number;
            }

            if (dto.Floor.HasValue)
            {
                room.Floor = dto.Floor.Value;
            }

            if (dto.RoomTypeId.HasValue && dto.RoomTypeId.Value != room.RoomTypeId)
            {
                var roomType = await _roomTypeRepository.Query()
                    .FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId.Value && rt.HotelId == room.HotelId);
                if (roomType == null) return ApiResponse<RoomSummaryDto>.Fail("Room type not found in hotel");
                room.RoomTypeId = dto.RoomTypeId.Value;
                room.RoomType = roomType;
            }

            if (dto.Status.HasValue && dto.Status.Value != room.Status)
            {
                room.Status = dto.Status.Value;
                await _roomStatusLogRepository.AddAsync(new RoomStatusLog
                {
                    Id = Guid.NewGuid(),
                    HotelId = room.HotelId,
                    RoomId = room.Id,
                    Status = room.Status,
                    Timestamp = DateTime.UtcNow
                });
            }

            await _roomRepository.UpdateAsync(room);
            await _roomRepository.SaveChangesAsync();

            return ApiResponse<RoomSummaryDto>.Ok(new RoomSummaryDto
            {
                Id = room.Id,
                HotelId = room.HotelId,
                RoomTypeId = room.RoomTypeId,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
                Number = room.Number,
                Floor = room.Floor,
                Status = room.Status
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<RoomSummaryDto>.Fail($"Error updating room: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteAsync(Guid id)
    {
        try
        {
            var room = await _roomRepository.FindAsync(id);
            if (room == null) return ApiResponse.Fail("Room not found");

            // UC-26: Delete only if no booking history exists for this room
            var hasAnyBookings = await _bookingRepository.Query().AnyAsync(b => b.RoomId == id);
            if (hasAnyBookings) return ApiResponse.Fail("Cannot delete room with booking history");

            await _roomRepository.RemoveAsync(room);
            await _roomRepository.SaveChangesAsync();
            return ApiResponse.Ok("Room deleted");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error deleting room: {ex.Message}");
        }
    }

    public async Task<ApiResponse<RoomSummaryDto>> GetByIdAsync(Guid id)
    {
        try
        {
            var room = await _roomRepository.Query()
                .Include(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (room == null) return ApiResponse<RoomSummaryDto>.Fail("Room not found");

            return ApiResponse<RoomSummaryDto>.Ok(new RoomSummaryDto
            {
                Id = room.Id,
                HotelId = room.HotelId,
                RoomTypeId = room.RoomTypeId,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
                Number = room.Number,
                Floor = room.Floor,
                Status = room.Status
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<RoomSummaryDto>.Fail($"Error retrieving room: {ex.Message}");
        }
    }

    public async Task<ApiResponse<RoomSummaryDto>> SetOutOfServiceAsync(Guid id, SetOutOfServiceDto dto)
    {
        try
        {
            var room = await _roomRepository.FindAsync(id);
            if (room == null) return ApiResponse<RoomSummaryDto>.Fail("Room not found");

            if (room.Status != RoomStatus.OutOfService)
            {
                room.Status = RoomStatus.OutOfService;
                await _roomStatusLogRepository.AddAsync(new RoomStatusLog
                {
                    Id = Guid.NewGuid(),
                    HotelId = room.HotelId,
                    RoomId = room.Id,
                    Status = RoomStatus.OutOfService,
                    Timestamp = DateTime.UtcNow
                });
                await _roomRepository.UpdateAsync(room);
                await _roomRepository.SaveChangesAsync();
            }

            var roomType = await _roomTypeRepository.FindAsync(room.RoomTypeId);
            return ApiResponse<RoomSummaryDto>.Ok(new RoomSummaryDto
            {
                Id = room.Id,
                HotelId = room.HotelId,
                RoomTypeId = room.RoomTypeId,
                RoomTypeName = roomType?.Name ?? string.Empty,
                Number = room.Number,
                Floor = room.Floor,
                Status = room.Status
            }, meta: new { reason = dto.Reason });
        }
        catch (Exception ex)
        {
            return ApiResponse<RoomSummaryDto>.Fail($"Error setting room out of service: {ex.Message}");
        }
    }
}