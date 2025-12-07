using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Repository;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.RoomTypes.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HotelManagement.Services.Admin.RoomTypes;

public class RoomTypeService : IRoomTypeService
{
    private readonly IRepository<RoomType> _roomTypeRepository;
    private readonly IRepository<Hotel> _hotelRepository;
    private readonly IRepository<HotelRoom> _roomRepository;
    private readonly IRepository<Booking> _bookingRepository;

    public RoomTypeService(
        IRepository<RoomType> roomTypeRepository,
        IRepository<Hotel> hotelRepository,
        IRepository<HotelRoom> roomRepository,
        IRepository<Booking> bookingRepository)
    {
        _roomTypeRepository = roomTypeRepository;
        _hotelRepository = hotelRepository;
        _roomRepository = roomRepository;
        _bookingRepository = bookingRepository;
    }

    public async Task<ApiResponse<RoomTypeDto>> CreateAsync(CreateRoomTypeDto dto)
    {
        try
        {
            // Validate hotel exists
            var hotel = await _hotelRepository.FindAsync(dto.HotelId);
            if (hotel == null)
            {
                return ApiResponse<RoomTypeDto>.Fail("Hotel not found");
            }

            // Check if room type name already exists in this hotel
            var existingRoomType = await _roomTypeRepository.Query()
                .FirstOrDefaultAsync(rt => rt.HotelId == dto.HotelId && rt.Name == dto.Name);

            if (existingRoomType != null)
            {
                return ApiResponse<RoomTypeDto>.Fail("Room type name already exists in this hotel");
            }



            // Create room type
            var roomType = new RoomType
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                Name = dto.Name,
                Description = dto.Description,
                BasePriceFrom = dto.PriceFrom,
                BasePriceTo = dto.PriceTo,
                Capacity = dto.Capacity,
                Prices = JsonSerializer.Serialize(dto.PriceByDates),
                ImageUrl = dto.ImageUrl ?? string.Empty
            };

            await _roomTypeRepository.AddAsync(roomType);
            await _roomTypeRepository.SaveChangesAsync();


            return ApiResponse<RoomTypeDto>.Ok(await MapToRoomTypeDto(roomType));
        }
        catch (Exception ex)
        {
            return ApiResponse<RoomTypeDto>.Fail($"Error creating room type: {ex.Message}");
        }
    }

    public async Task<ApiResponse<RoomTypeDto>> UpdateAsync(Guid id, UpdateRoomTypeDto dto)
    {
        try
        {
            var roomType = await _roomTypeRepository.Query()
                .Include(rt => rt.Hotel)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null)
            {
                return ApiResponse<RoomTypeDto>.Fail("Room type not found");
            }

            // Check if new name conflicts with existing room types
            if (roomType.Name != dto.Name)
            {
                var existingRoomType = await _roomTypeRepository.Query()
                    .FirstOrDefaultAsync(rt => rt.HotelId == roomType.HotelId && rt.Name == dto.Name && rt.Id != id);

                if (existingRoomType != null)
                {
                    return ApiResponse<RoomTypeDto>.Fail("Room type name already exists in this hotel");
                }
            }



            // Update room type
            roomType.Name = dto.Name;
            roomType.Description = dto.Description;
            roomType.Capacity = dto.Capacity;
            roomType.BasePriceFrom = dto.PriceFrom;
            roomType.BasePriceTo = dto.PriceTo;
            roomType.Prices = JsonSerializer.Serialize(dto.PriceByDates);
            roomType.ImageUrl = dto.ImageUrl ?? roomType.ImageUrl;

            await _roomTypeRepository.UpdateAsync(roomType);
            await _roomTypeRepository.SaveChangesAsync();

            return ApiResponse<RoomTypeDto>.Ok(await MapToRoomTypeDto(roomType));
        }
        catch (Exception ex)
        {
            return ApiResponse<RoomTypeDto>.Fail($"Error updating room type: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteAsync(Guid id)
    {
        try
        {
            var roomType = await _roomTypeRepository.FindAsync(id);
            if (roomType == null)
            {
                return ApiResponse.Fail("Room type not found");
            }

            // Check if room type can be deleted (no active bookings)
            var canDelete = await ValidateDeleteAsync(id);
            if (!canDelete.IsSuccess)
            {
                return canDelete;
            }

            // Remove room type
            await _roomTypeRepository.RemoveAsync(roomType);
            await _roomTypeRepository.SaveChangesAsync();

            return ApiResponse.Ok("Room type deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error deleting room type: {ex.Message}");
        }
    }

    public async Task<ApiResponse<RoomTypeDto>> GetByIdAsync(Guid id)
    {
        try
        {
            var roomType = await _roomTypeRepository.Query()
                .Include(rt => rt.Hotel)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null)
            {
                return ApiResponse<RoomTypeDto>.Fail("Room type not found");
            }

            return ApiResponse<RoomTypeDto>.Ok(await MapToRoomTypeDto(roomType));
        }
        catch (Exception ex)
        {
            return ApiResponse<RoomTypeDto>.Fail($"Error retrieving room type: {ex.Message}");
        }
    }

    public async Task<ApiResponse<RoomTypeDetailDto>> GetDetailByIdAsync(Guid id)
    {
        try
        {
            var roomType = await _roomTypeRepository.Query()
                .Include(rt => rt.Hotel)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (roomType == null)
            {
                return ApiResponse<RoomTypeDetailDto>.Fail("Room type not found");
            }

            var dto = await MapToRoomTypeDetailDto(roomType);
            return ApiResponse<RoomTypeDetailDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            return ApiResponse<RoomTypeDetailDto>.Fail($"Error retrieving room type details: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<RoomTypeDto>>> GetAllAsync(RoomTypeQueryDto query)
    {
        try
        {
            var queryable = _roomTypeRepository.Query()
                .Include(rt => rt.Hotel).Where(x => true);

            if (query.HotelId.HasValue)
            {
                queryable = queryable.Where(rt => rt.HotelId == query.HotelId.Value);
            }

            if (!string.IsNullOrEmpty(query.SearchTerm))
            {
                queryable = queryable.Where(rt => rt.Name.Contains(query.SearchTerm) ||
                                                 rt.Description.Contains(query.SearchTerm));
            }

            var roomTypes = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = new List<RoomTypeDto>();
            foreach (var roomType in roomTypes)
            {
                dtos.Add(await MapToRoomTypeDto(roomType));
            }

            return ApiResponse<List<RoomTypeDto>>.Ok(dtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<RoomTypeDto>>.Fail($"Error retrieving room types: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<RoomTypeDto>>> GetByHotelIdAsync(Guid hotelId)
    {
        try
        {
            var roomTypes = await _roomTypeRepository.Query()
                .Include(rt => rt.Hotel)
                .Where(rt => rt.HotelId == hotelId)
                .ToListAsync();

            var dtos = new List<RoomTypeDto>();
            foreach (var roomType in roomTypes)
            {
                dtos.Add(await MapToRoomTypeDto(roomType));
            }

            return ApiResponse<List<RoomTypeDto>>.Ok(dtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<RoomTypeDto>>.Fail($"Error retrieving room types: {ex.Message}");
        }
    }

    public async Task<ApiResponse> ValidateDeleteAsync(Guid id)
    {
        try
        {
            // TODO: update later
            //var hasActiveBookings = await _bookingRepository.Query()
            //        .Include(b => b.Room)
            //        .AnyAsync(b => b.Room.RoomTypeId == id &&
            //                    (b.Status == BookingRoomStatus.Confirmed ||
            //                        b.Status == BookingRoomStatus.CheckedIn));

            var hasActiveBookings = false;
            if (hasActiveBookings)
            {
                return ApiResponse.Fail("Cannot delete room type with active bookings");
            }

            return ApiResponse.Ok("Room type can be deleted");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error validating delete: {ex.Message}");
        }
    }

    private async Task<RoomTypeDto> MapToRoomTypeDto(RoomType roomType)
    {


        var roomCount = await _roomRepository.Query()
            .CountAsync(r => r.RoomTypeId == roomType.Id);

        // TODO: update later
        //var canDelete = !await _bookingRepository.Query()
        //    .Include(b => b.Room)
        //    .AnyAsync(b => b.Room!.RoomTypeId == roomType.Id &&
        //                  (b.Status == BookingRoomStatus.Confirmed ||
        //                   b.Status == BookingRoomStatus.CheckedIn));
        var canDelete = true;



        List<PriceByDate>? priceByDates = null;
        if (!string.IsNullOrWhiteSpace(roomType.Prices))
        {
            try
            {
                priceByDates = JsonSerializer.Deserialize<List<PriceByDate>>(roomType.Prices);
            }
            catch
            {
                priceByDates = new List<PriceByDate>();
            }
        }

        return new RoomTypeDto
        {
            Id = roomType.Id,
            HotelId = roomType.HotelId,
            HotelName = roomType.Hotel?.Name ?? "",
            Name = roomType.Name,
            Description = roomType.Description,
            ImageUrl = roomType.ImageUrl,
            RoomCount = roomType.Capacity,
            CanDelete = canDelete,
            PriceFrom = roomType.BasePriceFrom,
            PriceTo = roomType.BasePriceTo,
            PriceByDates = priceByDates,

        };
    }

    private async Task<RoomTypeDetailDto> MapToRoomTypeDetailDto(RoomType roomType)
    {
        var baseDto = await MapToRoomTypeDto(roomType);

        var rooms = await _roomRepository.Query()
            .Where(r => r.RoomTypeId == roomType.Id)
            .Select(r => new RoomDto
            {
                Id = r.Id,
                Number = r.Number,
                Floor = r.Floor,
                Status = r.Status.ToString()
            })
            .ToListAsync();

        return new RoomTypeDetailDto
        {
            Id = baseDto.Id,
            HotelId = baseDto.HotelId,
            HotelName = baseDto.HotelName,
            Name = baseDto.Name,
            Description = baseDto.Description,
            ImageUrl = baseDto.ImageUrl,
            RoomCount = baseDto.RoomCount,
            CanDelete = baseDto.CanDelete,
            PriceFrom = baseDto.PriceFrom,
            PriceTo = baseDto.PriceTo,
            PriceByDates = baseDto.PriceByDates,
            Rooms = rooms,
            PricingInfo = null
        };
    }
}
