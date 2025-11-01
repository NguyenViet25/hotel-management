using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Housekeeping.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Housekeeping;

public interface IRoomStatusService
{
    Task<ApiResponse<RoomStatusDto>> UpdateRoomStatusAsync(UpdateRoomStatusRequest request);
    Task<ApiResponse<RoomStatusListResponse>> GetRoomStatusHistoryAsync(Guid roomId, int page = 1, int pageSize = 20);
    Task<ApiResponse<List<RoomWithStatusDto>>> GetRoomsByStatusAsync(Guid hotelId, RoomStatus? status = null);
    Task<ApiResponse<RoomStatusSummaryDto>> GetRoomStatusSummaryAsync(Guid hotelId);
}

public class RoomStatusService : IRoomStatusService
{
    private readonly IRepository<Room> _roomRepository;
    private readonly IRepository<RoomStatusLog> _roomStatusLogRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RoomStatusService(
        IRepository<Room> roomRepository,
        IRepository<RoomStatusLog> roomStatusLogRepository,
        IUnitOfWork unitOfWork)
    {
        _roomRepository = roomRepository;
        _roomStatusLogRepository = roomStatusLogRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<RoomStatusDto>> UpdateRoomStatusAsync(UpdateRoomStatusRequest request)
    {
        var room = await _roomRepository.Query()
            .Include(r => r.StatusLogs)
            .FirstOrDefaultAsync(r => r.Id == request.RoomId);

        if (room == null)
        {
            return ApiResponse<RoomStatusDto>.Fail("Room not found");
        }

        // Create a new status log entry
        var statusLog = new RoomStatusLog
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            Status = request.Status,
            Timestamp = DateTime.UtcNow,
            Notes = request.Notes
        };

        // Update the room's current status
        room.Status = request.Status;

        await _roomStatusLogRepository.AddAsync(statusLog);
        await _roomRepository.UpdateAsync(room);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<RoomStatusDto>.Success(new RoomStatusDto
        {
            Id = statusLog.Id,
            RoomId = statusLog.RoomId,
            RoomNumber = room.Number,
            Floor = room.Floor,
            Status = statusLog.Status,
            Timestamp = statusLog.Timestamp,
            Notes = statusLog.Notes
        });
    }

    public async Task<ApiResponse<RoomStatusListResponse>> GetRoomStatusHistoryAsync(Guid roomId, int page = 1, int pageSize = 20)
    {
        var room = await _roomRepository.FindAsync(roomId);
        if (room == null)
        {
            return ApiResponse<RoomStatusListResponse>.Fail("Room not found");
        }

        var query = _roomStatusLogRepository.Query()
            .Where(log => log.RoomId == roomId);

        var totalCount = await query.CountAsync();
        var logs = await query
            .OrderByDescending(log => log.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = logs.Select(log => new RoomStatusDto
        {
            Id = log.Id,
            RoomId = log.RoomId,
            RoomNumber = room.Number,
            Floor = room.Floor,
            Status = log.Status,
            Timestamp = log.Timestamp,
            Notes = log.Notes
        }).ToList();

        return ApiResponse<RoomStatusListResponse>.Success(new RoomStatusListResponse
        {
            RoomStatuses = dtos,
            TotalCount = totalCount
        });
    }

    public async Task<ApiResponse<List<RoomWithStatusDto>>> GetRoomsByStatusAsync(Guid hotelId, RoomStatus? status = null)
    {
        var query = _roomRepository.Query()
            .Include(r => r.RoomType)
            .Include(r => r.StatusLogs.OrderByDescending(log => log.Timestamp).Take(1))
            .Where(r => r.HotelId == hotelId);

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        var rooms = await query.ToListAsync();

        var dtos = rooms.Select(room => new RoomWithStatusDto
        {
            Id = room.Id,
            Number = room.Number,
            Floor = room.Floor,
            Status = room.Status,
            LastUpdated = room.StatusLogs.FirstOrDefault()?.Timestamp ?? DateTime.MinValue,
            RoomTypeName = room.RoomType?.Name ?? "Unknown"
        }).ToList();

        return ApiResponse<List<RoomWithStatusDto>>.Success(dtos);
    }

    public async Task<ApiResponse<RoomStatusSummaryDto>> GetRoomStatusSummaryAsync(Guid hotelId)
    {
        var rooms = await _roomRepository.Query()
            .Where(r => r.HotelId == hotelId)
            .ToListAsync();

        var summary = new RoomStatusSummaryDto
        {
            TotalRooms = rooms.Count,
            CleanRooms = rooms.Count(r => r.Status == RoomStatus.Clean),
            DirtyRooms = rooms.Count(r => r.Status == RoomStatus.Dirty),
            MaintenanceRooms = rooms.Count(r => r.Status == RoomStatus.Maintenance),
            OccupiedRooms = rooms.Count(r => r.Status == RoomStatus.Occupied),
            OutOfServiceRooms = rooms.Count(r => r.Status == RoomStatus.OutOfService)
        };

        return ApiResponse<RoomStatusSummaryDto>.Success(summary);
    }
}