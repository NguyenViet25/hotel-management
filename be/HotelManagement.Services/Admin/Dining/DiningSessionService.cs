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
    private readonly IRepository<Order> _orderRepository;
    private readonly IRepository<AppUser> _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DiningSessionService(
        IRepository<DiningSession> diningSessionRepository,
        IRepository<Table> tableRepository,
        IRepository<Order> orderRepository,
        IRepository<AppUser> userRepository,
        IUnitOfWork unitOfWork)
    {
        _diningSessionRepository = diningSessionRepository;
        _tableRepository = tableRepository;
        _orderRepository = orderRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<DiningSessionDto>> CreateSessionAsync(CreateDiningSessionRequest request)
    {
        var table = await _tableRepository.FindAsync(request.TableId);
        if (table == null)
        {
            return ApiResponse<DiningSessionDto>.Fail("Table not found");
        }

        // Check if table is already in use
        var activeSession = await _diningSessionRepository.Query()
            .Where(s => s.TableId == request.TableId && s.Status == DiningSessionStatus.Open)
            .FirstOrDefaultAsync();

        if (activeSession != null)
        {
            return ApiResponse<DiningSessionDto>.Fail("Table is already in use");
        }

        var session = new DiningSession
        {
            Id = Guid.NewGuid(),
            HotelId = request.HotelId,
            TableId = request.TableId,
            WaiterUserId = request.WaiterUserId,
            StartedAt = DateTime.UtcNow,
            Status = DiningSessionStatus.Open
        };

        await _diningSessionRepository.AddAsync(session);
        await _unitOfWork.SaveChangesAsync();

        // If guest ID is provided, create an order for this guest
        if (request.GuestId.HasValue)
        {
            var order = new Order
            {
                Id = Guid.NewGuid(),
                HotelId = request.HotelId,
                DiningSessionId = session.Id,
                Status = OrderStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };

            await _orderRepository.AddAsync(order);
            await _unitOfWork.SaveChangesAsync();
        }

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

        await _diningSessionRepository.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

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

        await _diningSessionRepository.UpdateAsync(session);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.Success(true);
    }

    public async Task<ApiResponse<bool>> AssignOrderToSessionAsync(Guid sessionId, Guid orderId)
    {
        var session = await _diningSessionRepository.FindAsync(sessionId);
        if (session == null)
        {
            return ApiResponse<bool>.Fail("Dining session not found");
        }

        var order = await _orderRepository.FindAsync(orderId);
        if (order == null)
        {
            return ApiResponse<bool>.Fail("Order not found");
        }

        order.DiningSessionId = sessionId;
        await _orderRepository.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.Success(true);
    }

    private async Task<DiningSessionDto> MapToDto(DiningSession session)
    {
        var table = await _tableRepository.FindAsync(session.TableId);
        string tableName = table?.Name ?? "Unknown";

        string? waiterName = null;
        if (session.WaiterUserId.HasValue)
        {
            var waiter = await _userRepository.FindAsync(session.WaiterUserId.Value);
            waiterName = waiter?.Fullname;
        }

        return new DiningSessionDto
        {
            Id = session.Id,
            HotelId = session.HotelId,
            TableId = session.TableId,
            TableName = tableName,
            WaiterUserId = session.WaiterUserId,
            WaiterName = waiterName,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt,
            Status = session.Status.ToString()
        };
    }
}