using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Dining;

public interface IServiceRequestService
{
    Task<ApiResponse<ServiceRequestDto>> CreateRequestAsync(CreateServiceRequestRequest request);
    Task<ApiResponse<ServiceRequestDto>> UpdateRequestAsync(Guid id, UpdateServiceRequestRequest request);
    Task<ApiResponse<ServiceRequestDto>> GetRequestAsync(Guid id);
    Task<ApiResponse<ServiceRequestListResponse>> GetRequestsBySessionAsync(Guid sessionId, int page = 1, int pageSize = 10);
    Task<ApiResponse<bool>> CompleteRequestAsync(Guid id);
}

public class ServiceRequestService : IServiceRequestService
{
    private readonly IRepository<ServiceRequest> _serviceRequestRepository;
    private readonly IRepository<AppUser> _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ServiceRequestService(
        IRepository<ServiceRequest> serviceRequestRepository,
        IRepository<AppUser> userRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceRequestRepository = serviceRequestRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<ServiceRequestDto>> CreateRequestAsync(CreateServiceRequestRequest request)
    {
        var serviceRequest = new ServiceRequest
        {
            Id = Guid.NewGuid(),
            HotelId = request.HotelId,
            DiningSessionId = request.DiningSessionId,
            RequestType = request.RequestType,
            Description = request.Description,
            Status = ServiceRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _serviceRequestRepository.AddAsync(serviceRequest);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<ServiceRequestDto>.Success(await MapToDto(serviceRequest));
    }

    public async Task<ApiResponse<ServiceRequestDto>> UpdateRequestAsync(Guid id, UpdateServiceRequestRequest request)
    {
        var serviceRequest = await _serviceRequestRepository.FindAsync(id);
        if (serviceRequest == null)
        {
            return ApiResponse<ServiceRequestDto>.Fail("Service request not found");
        }

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<ServiceRequestStatus>(request.Status, true, out var status))
        {
            serviceRequest.Status = status;
            if (status == ServiceRequestStatus.Completed)
            {
                serviceRequest.CompletedAt = DateTime.UtcNow;
            }
        }

        if (request.AssignedToUserId.HasValue)
        {
            var user = await _userRepository.FindAsync(request.AssignedToUserId.Value);
            if (user == null)
            {
                return ApiResponse<ServiceRequestDto>.Fail("Assigned user not found");
            }
            serviceRequest.AssignedToUserId = request.AssignedToUserId;
        }

        await _serviceRequestRepository.UpdateAsync(serviceRequest);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<ServiceRequestDto>.Success(await MapToDto(serviceRequest));
    }

    public async Task<ApiResponse<ServiceRequestDto>> GetRequestAsync(Guid id)
    {
        var serviceRequest = await _serviceRequestRepository.FindAsync(id);
        if (serviceRequest == null)
        {
            return ApiResponse<ServiceRequestDto>.Fail("Service request not found");
        }

        return ApiResponse<ServiceRequestDto>.Success(await MapToDto(serviceRequest));
    }

    public async Task<ApiResponse<ServiceRequestListResponse>> GetRequestsBySessionAsync(Guid sessionId, int page = 1, int pageSize = 10)
    {
        var query = _serviceRequestRepository.Query()
            .Where(sr => sr.DiningSessionId == sessionId);

        var totalCount = await query.CountAsync();
        var requests = await query
            .OrderByDescending(sr => sr.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<ServiceRequestDto>();
        foreach (var request in requests)
        {
            dtos.Add(await MapToDto(request));
        }

        return ApiResponse<ServiceRequestListResponse>.Success(new ServiceRequestListResponse
        {
            Requests = dtos,
            TotalCount = totalCount
        });
    }

    public async Task<ApiResponse<bool>> CompleteRequestAsync(Guid id)
    {
        var serviceRequest = await _serviceRequestRepository.FindAsync(id);
        if (serviceRequest == null)
        {
            return ApiResponse<bool>.Fail("Service request not found");
        }

        serviceRequest.Status = ServiceRequestStatus.Completed;
        serviceRequest.CompletedAt = DateTime.UtcNow;

        await _serviceRequestRepository.UpdateAsync(serviceRequest);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.Success(true);
    }

    private async Task<ServiceRequestDto> MapToDto(ServiceRequest serviceRequest)
    {
        string? assignedToName = null;
        if (serviceRequest.AssignedToUserId.HasValue)
        {
            var user = await _userRepository.FindAsync(serviceRequest.AssignedToUserId.Value);
            assignedToName = user?.FullName;
        }

        return new ServiceRequestDto
        {
            Id = serviceRequest.Id,
            HotelId = serviceRequest.HotelId,
            DiningSessionId = serviceRequest.DiningSessionId,
            RequestType = serviceRequest.RequestType,
            Description = serviceRequest.Description,
            Status = serviceRequest.Status.ToString(),
            AssignedToUserId = serviceRequest.AssignedToUserId,
            AssignedToName = assignedToName,
            CreatedAt = serviceRequest.CreatedAt,
            CompletedAt = serviceRequest.CompletedAt
        };
    }
}