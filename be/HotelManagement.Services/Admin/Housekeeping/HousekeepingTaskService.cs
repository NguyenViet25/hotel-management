using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Repository.Common;
using HotelManagement.Domain.Repositories;
using HotelManagement.Services.Admin.Housekeeping.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Housekeeping;

public interface IHousekeepingTaskService
{
    Task<ApiResponse<HousekeepingTaskDto>> CreateAsync(CreateHousekeepingTaskRequest request);
    Task<ApiResponse<HousekeepingTaskDto>> AssignAsync(AssignHousekeeperRequest request);
    Task<ApiResponse<HousekeepingTaskDto>> UpdateNotesAsync(UpdateHousekeepingTaskNotesRequest request);
    Task<ApiResponse<List<HousekeepingTaskDto>>> ListAsync(ListHousekeepingTasksQuery query);
    Task<ApiResponse<HousekeepingTaskDto>> StartAsync(StartTaskRequest request);
    Task<ApiResponse<HousekeepingTaskDto>> CompleteAsync(CompleteTaskRequest request);
    Task<ApiResponse<HousekeepingTaskDto>> GetByIdAsync(Guid id);
}

public class HousekeepingTaskService : IHousekeepingTaskService
{
    private readonly IRepository<HousekeepingTask> _taskRepo;
    private readonly IRepository<HotelRoom> _roomRepo;
    private readonly IRepository<RoomStatusLog> _statusLogRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IUnitOfWork _uow;
    private readonly IRepository<HotelManagement.Domain.MinibarBooking> _minibarBookingRepo;

    public HousekeepingTaskService(
        IRepository<HousekeepingTask> taskRepo,
        IRepository<HotelRoom> roomRepo,
        IRepository<RoomStatusLog> statusLogRepo,
        IRepository<AppUser> userRepo,
        IRepository<HotelManagement.Domain.MinibarBooking> minibarBookingRepo,
        IUnitOfWork uow)
    {
        _taskRepo = taskRepo;
        _roomRepo = roomRepo;
        _statusLogRepo = statusLogRepo;
        _userRepo = userRepo;
        _uow = uow;
        _minibarBookingRepo = minibarBookingRepo;
    }

    public async Task<ApiResponse<HousekeepingTaskDto>> CreateAsync(CreateHousekeepingTaskRequest request)
    {
        var room = await _roomRepo.FindAsync(request.RoomId);
        if (room == null) return ApiResponse<HousekeepingTaskDto>.Fail("Room not found");
        if (room.HotelId != request.HotelId) return ApiResponse<HousekeepingTaskDto>.Fail("Room does not belong to hotel");

        var task = new HousekeepingTask
        {
            Id = Guid.NewGuid(),
            HotelId = request.HotelId,
            RoomId = request.RoomId,
            AssignedToUserId = request.AssignedToUserId,
            Notes = request.Notes,
            CreatedAt = DateTime.Now
        };

        await _taskRepo.AddAsync(task);
        await _taskRepo.SaveChangesAsync();

        var dto = await ToDto(task);
        return ApiResponse<HousekeepingTaskDto>.Success(dto);
    }

    public async Task<ApiResponse<HousekeepingTaskDto>> AssignAsync(AssignHousekeeperRequest request)
    {
        var task = await _taskRepo.FindAsync(request.TaskId);
        if (task == null) return ApiResponse<HousekeepingTaskDto>.Fail("Task not found");
        task.AssignedToUserId = request.AssignedToUserId;
        await _taskRepo.UpdateAsync(task);
        await _taskRepo.SaveChangesAsync();
        return ApiResponse<HousekeepingTaskDto>.Success(await ToDto(task));
    }

    public async Task<ApiResponse<HousekeepingTaskDto>> UpdateNotesAsync(UpdateHousekeepingTaskNotesRequest request)
    {
        var task = await _taskRepo.FindAsync(request.TaskId);
        if (task == null) return ApiResponse<HousekeepingTaskDto>.Fail("Task not found");
        task.Notes = request.Notes;
        await _taskRepo.UpdateAsync(task);
        await _taskRepo.SaveChangesAsync();
        return ApiResponse<HousekeepingTaskDto>.Success(await ToDto(task));
    }

    public async Task<ApiResponse<List<HousekeepingTaskDto>>> ListAsync(ListHousekeepingTasksQuery query)
    {
        var q = _taskRepo.Query().Where(t => t.HotelId == query.HotelId);
        if (query.AssignedToUserId.HasValue)
        {
            q = q.Where(t => t.AssignedToUserId == query.AssignedToUserId);
        }
        if (query.OnlyActive)
        {
            q = q.Where(t => t.CompletedAt == null);
        }

        var tasks = await q.ToListAsync();
        var dtos = new List<HousekeepingTaskDto>();
        foreach (var t in tasks)
        {
            dtos.Add(await ToDto(t));
        }
        return ApiResponse<List<HousekeepingTaskDto>>.Success(dtos);
    }

    public async Task<ApiResponse<HousekeepingTaskDto>> StartAsync(StartTaskRequest request)
    {
        var task = await _taskRepo.FindAsync(request.TaskId);
        if (task == null) return ApiResponse<HousekeepingTaskDto>.Fail("Task not found");
        var room = await _roomRepo.FindAsync(task.RoomId);
        if (room == null) return ApiResponse<HousekeepingTaskDto>.Fail("Room not found");
        task.StartedAt = task.StartedAt ?? DateTime.Now;

        // Update room to Cleaning and log
        if (room.Status != RoomStatus.Cleaning)
        {
            room.Status = RoomStatus.Cleaning;
            await _statusLogRepo.AddAsync(new RoomStatusLog
            {
                Id = Guid.NewGuid(),
                HotelId = room.HotelId,
                RoomId = room.Id,
                Status = RoomStatus.Cleaning,
                Timestamp = DateTime.Now,
                Notes = request.Notes
            });
            await _roomRepo.UpdateAsync(room);
        }

        await _taskRepo.UpdateAsync(task);
        await _taskRepo.SaveChangesAsync();
        return ApiResponse<HousekeepingTaskDto>.Success(await ToDto(task));
    }

    public async Task<ApiResponse<HousekeepingTaskDto>> CompleteAsync(CompleteTaskRequest request)
    {
        var task = await _taskRepo.FindAsync(request.TaskId);
        if (task == null) return ApiResponse<HousekeepingTaskDto>.Fail("Task not found");
        var room = await _roomRepo.FindAsync(task.RoomId);
        if (room == null) return ApiResponse<HousekeepingTaskDto>.Fail("Room not found");

        task.CompletedAt = DateTime.Now;

        // Build notes with evidence
        var notes = request.Notes;
        room.Status = RoomStatus.Clean;
        await _statusLogRepo.AddAsync(new RoomStatusLog
        {
            Id = Guid.NewGuid(),
            TaskId = request.TaskId,
            HotelId = room.HotelId,
            RoomId = room.Id,
            Status = RoomStatus.Clean,
            Timestamp = DateTime.Now,
            Notes = notes,
            EvidenceUrls = request.EvidenceUrls
        });

        await _roomRepo.UpdateAsync(room);
        await _taskRepo.UpdateAsync(task);
        await _taskRepo.SaveChangesAsync();

        return ApiResponse<HousekeepingTaskDto>.Success(await ToDto(task));
    }

    public async Task<ApiResponse<HousekeepingTaskDto>> GetByIdAsync(Guid id)
    {
        var task = await _taskRepo.FindAsync(id);
        if (task == null) return ApiResponse<HousekeepingTaskDto>.Fail("Task not found");
        var dto = await ToDto(task);

        dto.RoomStatusLogs = await _statusLogRepo.Query().Where(x => x.TaskId == id).ToListAsync();
        dto.MinibarBookings = await _minibarBookingRepo.Query().Where(x => x.HouseKeepingTaskId == id).ToListAsync();
        return ApiResponse<HousekeepingTaskDto>.Success(dto);
    }

    private async Task<HousekeepingTaskDto> ToDto(HousekeepingTask t)
    {
        var room = await _roomRepo.Query().Include(r => r.RoomType).FirstOrDefaultAsync(r => r.Id == t.RoomId);
        string? assigneeName = null;
        if (t.AssignedToUserId.HasValue)
        {
            var u = await _userRepo.FindAsync(t.AssignedToUserId.Value);
            assigneeName = u?.Fullname ?? u?.UserName ?? null;
        }
        return new HousekeepingTaskDto
        {
            Id = t.Id,
            HotelId = t.HotelId,
            RoomId = t.RoomId,
            RoomNumber = room?.Number ?? string.Empty,
            Floor = room?.Floor ?? 0,
            ImageSrc = room?.RoomType?.ImageUrl ?? string.Empty,
            AssignedToUserId = t.AssignedToUserId,
            AssignedToName = assigneeName,
            Notes = t.Notes,
            CreatedAt = t.CreatedAt,
            StartedAt = t.StartedAt,
            CompletedAt = t.CompletedAt
        };
    }
}
