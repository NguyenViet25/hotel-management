using HotelManagement.Domain;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Room.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Room;

public interface IMinibarService
{
    Task<ApiResponse<MinibarItemDto>> CreateMinibarItemAsync(CreateMinibarItemRequest request);
    Task<ApiResponse<MinibarItemDto>> UpdateMinibarItemAsync(Guid id, UpdateMinibarItemRequest request);
    Task<ApiResponse<MinibarItemDto>> GetMinibarItemAsync(Guid id);
    Task<ApiResponse<MinibarListResponse>> GetMinibarItemsByRoomAsync(Guid roomId);
    Task<ApiResponse<MinibarItemDto>> RecordConsumptionAsync(RecordConsumptionRequest request);
    Task<ApiResponse<List<MinibarItemDto>>> RestockMinibarAsync(RestockMinibarRequest request);
}

public class MinibarService : IMinibarService
{
    private readonly IRepository<MinibarItem> _minibarItemRepository;
    private readonly IRepository<Domain.HotelRoom> _roomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MinibarService(
        IRepository<MinibarItem> minibarItemRepository,
        IRepository<Domain.HotelRoom> roomRepository,
        IUnitOfWork unitOfWork)
    {
        _minibarItemRepository = minibarItemRepository;
        _roomRepository = roomRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<MinibarItemDto>> CreateMinibarItemAsync(CreateMinibarItemRequest request)
    {
        var room = await _roomRepository.FindAsync(request.RoomId);
        if (room == null)
        {
            return ApiResponse<MinibarItemDto>.Fail("Room not found");
        }

        var minibarItem = new MinibarItem
        {
            Id = Guid.NewGuid(),
            HotelId = request.HotelId,
            RoomId = request.RoomId,
            Name = request.Name,
            Price = request.Price,
            Quantity = request.Quantity,
            Consumed = 0,
            LastRestockedAt = DateTime.UtcNow
        };

        await _minibarItemRepository.AddAsync(minibarItem);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<MinibarItemDto>.Success(await MapToDto(minibarItem));
    }

    public async Task<ApiResponse<MinibarItemDto>> UpdateMinibarItemAsync(Guid id, UpdateMinibarItemRequest request)
    {
        var minibarItem = await _minibarItemRepository.FindAsync(id);
        if (minibarItem == null)
        {
            return ApiResponse<MinibarItemDto>.Fail("Minibar item not found");
        }

        minibarItem.Name = request.Name;
        minibarItem.Price = request.Price;
        
        // If quantity is increased, update the last restocked timestamp
        if (request.Quantity > minibarItem.Quantity)
        {
            minibarItem.LastRestockedAt = DateTime.UtcNow;
        }
        
        minibarItem.Quantity = request.Quantity;

        await _minibarItemRepository.UpdateAsync(minibarItem);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<MinibarItemDto>.Success(await MapToDto(minibarItem));
    }

    public async Task<ApiResponse<MinibarItemDto>> GetMinibarItemAsync(Guid id)
    {
        var minibarItem = await _minibarItemRepository.FindAsync(id);
        if (minibarItem == null)
        {
            return ApiResponse<MinibarItemDto>.Fail("Minibar item not found");
        }

        return ApiResponse<MinibarItemDto>.Success(await MapToDto(minibarItem));
    }

    public async Task<ApiResponse<MinibarListResponse>> GetMinibarItemsByRoomAsync(Guid roomId)
    {
        var room = await _roomRepository.FindAsync(roomId);
        if (room == null)
        {
            return ApiResponse<MinibarListResponse>.Fail("Room not found");
        }

        var items = await _minibarItemRepository.Query()
            .Where(item => item.RoomId == roomId)
            .ToListAsync();

        var dtos = new List<MinibarItemDto>();
        foreach (var item in items)
        {
            dtos.Add(await MapToDto(item));
        }

        return ApiResponse<MinibarListResponse>.Success(new MinibarListResponse
        {
            Items = dtos,
            TotalCount = dtos.Count
        });
    }

    public async Task<ApiResponse<MinibarItemDto>> RecordConsumptionAsync(RecordConsumptionRequest request)
    {
        var minibarItem = await _minibarItemRepository.FindAsync(request.MinibarItemId);
        if (minibarItem == null)
        {
            return ApiResponse<MinibarItemDto>.Fail("Minibar item not found");
        }

        if (minibarItem.Consumed + request.ConsumedQuantity > minibarItem.Quantity)
        {
            return ApiResponse<MinibarItemDto>.Fail("Consumed quantity exceeds available quantity");
        }

        minibarItem.Consumed += request.ConsumedQuantity;
        minibarItem.LastConsumedAt = DateTime.UtcNow;
        
        if (request.BookingId.HasValue)
        {
            minibarItem.BookingId = request.BookingId;
        }

        await _minibarItemRepository.UpdateAsync(minibarItem);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<MinibarItemDto>.Success(await MapToDto(minibarItem));
    }

    public async Task<ApiResponse<List<MinibarItemDto>>> RestockMinibarAsync(RestockMinibarRequest request)
    {
        var room = await _roomRepository.FindAsync(request.RoomId);
        if (room == null)
        {
            return ApiResponse<List<MinibarItemDto>>.Fail("Room not found");
        }

        var updatedItems = new List<MinibarItem>();
        foreach (var itemRestock in request.Items)
        {
            var minibarItem = await _minibarItemRepository.FindAsync(itemRestock.MinibarItemId);
            if (minibarItem == null)
            {
                continue;
            }

            minibarItem.Quantity = itemRestock.NewQuantity;
            minibarItem.Consumed = 0;
            minibarItem.LastRestockedAt = DateTime.UtcNow;
            minibarItem.BookingId = null;

            await _minibarItemRepository.UpdateAsync(minibarItem);
            updatedItems.Add(minibarItem);
        }

        await _unitOfWork.SaveChangesAsync();

        var dtos = new List<MinibarItemDto>();
        foreach (var item in updatedItems)
        {
            dtos.Add(await MapToDto(item));
        }

        return ApiResponse<List<MinibarItemDto>>.Success(dtos);
    }

    private async Task<MinibarItemDto> MapToDto(MinibarItem item)
    {
        var room = await _roomRepository.FindAsync(item.RoomId);
        
        return new MinibarItemDto
        {
            Id = item.Id,
            RoomId = item.RoomId,
            RoomNumber = room?.Number ?? "Unknown",
            BookingId = item.BookingId,
            Name = item.Name,
            Price = item.Price,
            Quantity = item.Quantity,
            Consumed = item.Consumed,
            LastRestockedAt = item.LastRestockedAt,
            LastConsumedAt = item.LastConsumedAt
        };
    }
}