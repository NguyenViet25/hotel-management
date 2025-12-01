using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Dining;

public class DiningSessionService : IDiningSessionService
{
    private readonly IRepository<DiningSession> _diningSessionRepository;
    private readonly IRepository<Table> _tableRepository;
    private readonly IRepository<DiningSessionTable> _diningSessionTableRepository;
    private readonly IRepository<AppUser> _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DiningSessionService(
        IRepository<DiningSession> diningSessionRepository,
        IRepository<Table> tableRepository,
        IRepository<DiningSessionTable> diningSessionTableRepository,
        IRepository<AppUser> userRepository,
        IUnitOfWork unitOfWork)
    {
        _diningSessionRepository = diningSessionRepository;
        _tableRepository = tableRepository;
        _diningSessionTableRepository = diningSessionTableRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<DiningSessionDto>> CreateSessionAsync(CreateDiningSessionRequest request)
    {
        var session = new DiningSession
        {
            Id = Guid.NewGuid(),
            HotelId = request.HotelId,
            TableId = null,
            WaiterUserId = request.WaiterUserId,
            StartedAt = request.StartedAt ?? DateTime.UtcNow,
            Notes = request.Notes ?? string.Empty,
            TotalGuests = request.TotalGuests ?? 0,
            Status = DiningSessionStatus.Open
        };

        await _diningSessionRepository.AddAsync(session);
        await _diningSessionRepository.SaveChangesAsync();

        return ApiResponse<DiningSessionDto>.Success(await MapToDto(session));
    }

    public async Task<ApiResponse<DiningSessionDto>> GetSessionAsync(Guid id)
    {
        var session = await _diningSessionRepository.FindAsync(id);
        if (session == null)
        {
            return ApiResponse<DiningSessionDto>.Fail("Dining session not found");
        }

        return ApiResponse<DiningSessionDto>.Success(await MapToDto(session));
    }

    public async Task<ApiResponse<DiningSessionListResponse>> GetSessionsAsync(Guid hotelId, int page = 1, int pageSize = 10, string? status = null)
    {
        var query = _diningSessionRepository.Query()
            .Where(s => s.HotelId == hotelId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<DiningSessionStatus>(status, true, out var sessionStatus))
        {
            query = query.Where(s => s.Status == sessionStatus);
        }

        var totalCount = await query.CountAsync();
        var sessions = await query
            .OrderByDescending(s => s.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<DiningSessionDto>();
        foreach (var session in sessions)
        {
            dtos.Add(await MapToDto(session));
        }

        return ApiResponse<DiningSessionListResponse>.Success(new DiningSessionListResponse
        {
            Sessions = dtos,
            TotalCount = totalCount
        });
    }

    public async Task<ApiResponse<DiningSessionDto>> UpdateSessionAsync(Guid id, UpdateDiningSessionRequest request)
    {
        var session = await _diningSessionRepository.FindAsync(id);
        if (session == null)
        {
            return ApiResponse<DiningSessionDto>.Fail("Dining session not found");
        }

        if (request.WaiterUserId.HasValue)
        {
            var waiter = await _userRepository.FindAsync(request.WaiterUserId.Value);
            if (waiter == null)
            {
                return ApiResponse<DiningSessionDto>.Fail("Waiter not found");
            }
            session.WaiterUserId = request.WaiterUserId;
        }

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<DiningSessionStatus>(request.Status, true, out var status))
        {
            session.Status = status;
            if (status == DiningSessionStatus.Closed)
            {
                session.EndedAt = DateTime.UtcNow;
            }
        }

        if (request.Notes != null)
        {
            session.Notes = request.Notes;
        }
        if (request.TotalGuests.HasValue)
        {
            session.TotalGuests = request.TotalGuests.Value;
        }

        await _diningSessionRepository.UpdateAsync(session);
        await _diningSessionRepository.SaveChangesAsync();

        return ApiResponse<DiningSessionDto>.Success(await MapToDto(session));
    }

    public async Task<ApiResponse<bool>> EndSessionAsync(Guid id)
    {
        var session = await _diningSessionRepository.FindAsync(id);
        if (session == null)
        {
            return ApiResponse<bool>.Fail("Dining session not found");
        }

        session.Status = DiningSessionStatus.Closed;
        session.EndedAt = DateTime.UtcNow;

        var linkedTables = await _diningSessionTableRepository.Query()
            .Where(x => x.DiningSessionId == id)
            .ToListAsync();
        foreach (var link in linkedTables)
        {
            var table = await _tableRepository.FindAsync(link.TableId);
            if (table != null)
            {
                table.TableStatus = 0;
                await _tableRepository.UpdateAsync(table);
            }
            await _diningSessionTableRepository.RemoveAsync(link);
        }

        await _diningSessionRepository.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.Success(true);
    }

    public async Task<ApiResponse<bool>> AttachTableAsync(Guid sessionId, Guid tableId)
    {
        var session = await _diningSessionRepository.FindAsync(sessionId);
        if (session == null || session.Status != DiningSessionStatus.Open)
        {
            return ApiResponse<bool>.Fail("Session not found or not open");
        }
        var table = await _tableRepository.FindAsync(tableId);
        if (table == null || table.TableStatus == 1)
        {
            return ApiResponse<bool>.Fail("Table not available");
        }

        var existing = await _diningSessionTableRepository.Query()
            .Where(x => x.TableId == tableId)
            .FirstOrDefaultAsync();
        if (existing != null)
        {
            return ApiResponse<bool>.Fail("Table is already attached");
        }

        var link = new DiningSessionTable
        {
            Id = Guid.NewGuid(),
            HotelId = session.HotelId,
            DiningSessionId = sessionId,
            TableId = tableId,
            AttachedAt = DateTime.UtcNow,
        };
        await _diningSessionTableRepository.AddAsync(link);
        table.TableStatus = 1;
        await _tableRepository.UpdateAsync(table);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.Success(true);
    }

    public async Task<ApiResponse<bool>> DetachTableAsync(Guid sessionId, Guid tableId)
    {
        var session = await _diningSessionRepository.FindAsync(sessionId);
        if (session == null)
        {
            return ApiResponse<bool>.Fail("Session not found");
        }
        var link = await _diningSessionTableRepository.Query()
            .Where(x => x.DiningSessionId == sessionId && x.TableId == tableId)
            .FirstOrDefaultAsync();
        if (link == null)
        {
            return ApiResponse<bool>.Fail("Link not found");
        }
        await _diningSessionTableRepository.RemoveAsync(link);
        var table = await _tableRepository.FindAsync(tableId);
        if (table != null)
        {
            table.TableStatus = 0;
            await _tableRepository.UpdateAsync(table);
        }
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.Success(true);
    }

    public async Task<ApiResponse<bool>> DeleteSessionAsync(Guid id)
    {
        var session = await _diningSessionRepository.FindAsync(id);
        if (session == null)
        {
            return ApiResponse<bool>.Fail("Dining session not found");
        }

        var links = await _diningSessionTableRepository.Query()
            .Where(x => x.DiningSessionId == id)
            .ToListAsync();
        foreach (var link in links)
        {
            var table = await _tableRepository.FindAsync(link.TableId);
            if (table != null)
            {
                table.TableStatus = 0;
                await _tableRepository.UpdateAsync(table);
            }
            await _diningSessionTableRepository.RemoveAsync(link);
        }

        await _diningSessionRepository.RemoveAsync(session);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.Success(true);
    }

    public async Task<ApiResponse<bool>> UpdateSessionTablesAsync(Guid sessionId, UpdateSessionTablesRequest request)
    {
        var session = await _diningSessionRepository.FindAsync(sessionId);
        if (session == null || session.Status != DiningSessionStatus.Open)
        {
            return ApiResponse<bool>.Fail("Session not found or not open");
        }

        var attachIds = (request.AttachTableIds ?? new List<Guid>()).Distinct().ToList();
        var detachIds = (request.DetachTableIds ?? new List<Guid>()).Distinct().ToList();

        int changes = 0;

        foreach (var tableId in detachIds)
        {
            var link = await _diningSessionTableRepository.Query()
                .Where(x => x.DiningSessionId == sessionId && x.TableId == tableId)
                .FirstOrDefaultAsync();
            if (link != null)
            {
                await _diningSessionTableRepository.RemoveAsync(link);
                var table = await _tableRepository.FindAsync(tableId);
                if (table != null)
                {
                    table.TableStatus = 0;
                    await _tableRepository.UpdateAsync(table);
                }
                changes++;
            }
        }

        foreach (var tableId in attachIds)
        {
            var table = await _tableRepository.FindAsync(tableId);
            if (table == null || table.TableStatus == 1)
            {
                continue;
            }
            var existingLink = await _diningSessionTableRepository.Query()
                .Where(x => x.TableId == tableId)
                .FirstOrDefaultAsync();
            if (existingLink != null)
            {
                continue;
            }
            var link = new DiningSessionTable
            {
                Id = Guid.NewGuid(),
                HotelId = session.HotelId,
                DiningSessionId = sessionId,
                TableId = tableId,
                AttachedAt = DateTime.UtcNow,
            };
            await _diningSessionTableRepository.AddAsync(link);
            table.TableStatus = 1;
            await _tableRepository.UpdateAsync(table);
            changes++;
        }

        await _unitOfWork.SaveChangesAsync();
        if (changes == 0)
        {
            return ApiResponse<bool>.Fail("No changes applied");
        }
        return ApiResponse<bool>.Success(true);
    }

    private async Task<DiningSessionDto> MapToDto(DiningSession session)
    {
        string? waiterName = null;
        if (session.WaiterUserId.HasValue)
        {
            var waiter = await _userRepository.FindAsync(session.WaiterUserId.Value);
            waiterName = waiter?.Fullname;
        }

        var links = await _diningSessionTableRepository.Query()
            .Where(x => x.DiningSessionId == session.Id)
            .ToListAsync();
        var tableDtos = new List<SessionTableDto>();
        foreach (var link in links)
        {
            var table = await _tableRepository.FindAsync(link.TableId);
            if (table != null)
            {
                tableDtos.Add(new SessionTableDto
                {
                    TableId = table.Id,
                    TableName = table.Name,
                    Capacity = table.Capacity,
                    AttachedAt = link.AttachedAt,
                });
            }
        }

        return new DiningSessionDto
        {
            Id = session.Id,
            HotelId = session.HotelId,
            WaiterUserId = session.WaiterUserId,
            WaiterName = waiterName,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            Status = session.Status.ToString(),
            Notes = session.Notes,
            TotalGuests = session.TotalGuests,
            Tables = tableDtos,
        };
    }
}
