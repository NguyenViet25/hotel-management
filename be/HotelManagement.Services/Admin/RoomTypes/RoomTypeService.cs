using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Repository;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.RoomTypes.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.RoomTypes;

public class RoomTypeService : IRoomTypeService
{
    private readonly IRepository<RoomType> _roomTypeRepository;
    private readonly IRepository<Hotel> _hotelRepository;
    private readonly IRepository<Amenity> _amenityRepository;
    private readonly IRepository<RoomTypeAmenity> _roomTypeAmenityRepository;
    private readonly IRepository<Room> _roomRepository;
    private readonly IRepository<Booking> _bookingRepository;
    private readonly IRepository<RoomBasePrice> _basePriceRepository;

    public RoomTypeService(
        IRepository<RoomType> roomTypeRepository,
        IRepository<Hotel> hotelRepository,
        IRepository<Amenity> amenityRepository,
        IRepository<RoomTypeAmenity> roomTypeAmenityRepository,
        IRepository<Room> roomRepository,
        IRepository<Booking> bookingRepository,
        IRepository<RoomBasePrice> basePriceRepository)
    {
        _roomTypeRepository = roomTypeRepository;
        _hotelRepository = hotelRepository;
        _amenityRepository = amenityRepository;
        _roomTypeAmenityRepository = roomTypeAmenityRepository;
        _roomRepository = roomRepository;
        _bookingRepository = bookingRepository;
        _basePriceRepository = basePriceRepository;
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

            // Validate amenities exist
            if (dto.AmenityIds.Any())
            {
                var amenities = await _amenityRepository.Query()
                    .Where(a => dto.AmenityIds.Contains(a.Id) && a.HotelId == dto.HotelId)
                    .ToListAsync();

                if (amenities.Count != dto.AmenityIds.Count)
                {
                    return ApiResponse<RoomTypeDto>.Fail("One or more amenities not found or don't belong to this hotel");
                }
            }

            // Create room type
            var roomType = new RoomType
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                Name = dto.Name,
                Description = dto.Description
            };

            await _roomTypeRepository.AddAsync(roomType);
            await _roomTypeRepository.SaveChangesAsync();

            // Add amenities
            if (dto.AmenityIds.Any())
            {
                var roomTypeAmenities = dto.AmenityIds.Select(amenityId => new RoomTypeAmenity
                {
                    RoomTypeId = roomType.Id,
                    AmenityId = amenityId
                }).ToList();

                foreach (var rta in roomTypeAmenities)
                {
                    await _roomTypeAmenityRepository.AddAsync(rta);
                }
                await _roomTypeAmenityRepository.SaveChangesAsync();
            }

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

            // Validate amenities exist
            if (dto.AmenityIds.Any())
            {
                var amenities = await _amenityRepository.Query()
                    .Where(a => dto.AmenityIds.Contains(a.Id) && a.HotelId == roomType.HotelId)
                    .ToListAsync();

                if (amenities.Count != dto.AmenityIds.Count)
                {
                    return ApiResponse<RoomTypeDto>.Fail("One or more amenities not found or don't belong to this hotel");
                }
            }

            // Update room type
            roomType.Name = dto.Name;
            roomType.Description = dto.Description;

            await _roomTypeRepository.UpdateAsync(roomType);

            // Update amenities - remove existing and add new ones
            var existingAmenities = await _roomTypeAmenityRepository.Query()
                .Where(rta => rta.RoomTypeId == id)
                .ToListAsync();

            foreach (var existing in existingAmenities)
            {
                await _roomTypeAmenityRepository.RemoveAsync(existing);
            }

            if (dto.AmenityIds.Any())
            {
                var newAmenities = dto.AmenityIds.Select(amenityId => new RoomTypeAmenity
                {
                    RoomTypeId = id,
                    AmenityId = amenityId
                }).ToList();

                foreach (var amenity in newAmenities)
                {
                    await _roomTypeAmenityRepository.AddAsync(amenity);
                }
            }

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
            if (!canDelete.Success)
            {
                return canDelete;
            }

            // Remove amenity associations
            var amenityAssociations = await _roomTypeAmenityRepository.Query()
                .Where(rta => rta.RoomTypeId == id)
                .ToListAsync();

            foreach (var association in amenityAssociations)
            {
                await _roomTypeAmenityRepository.RemoveAsync(association);
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
            // Check if there are any rooms of this type with active bookings
            var hasActiveBookings = await _bookingRepository.Query()
                .Include(b => b.Room)
                .AnyAsync(b => b.Room.RoomTypeId == id &&
                              (b.Status == BookingStatus.Confirmed ||
                               b.Status == BookingStatus.CheckedIn));

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
        var amenities = await _amenityRepository.Query()
            .Where(a => a.RoomTypeAmenities.Any(rta => rta.RoomTypeId == roomType.Id))
            .Select(a => new AmenityDto
            {
                Id = a.Id,
                Name = a.Name
            })
            .ToListAsync();

        var roomCount = await _roomRepository.Query()
            .CountAsync(r => r.RoomTypeId == roomType.Id);

        var canDelete = !await _bookingRepository.Query()
            .Include(b => b.Room)
            .AnyAsync(b => b.Room!.RoomTypeId == roomType.Id &&
                          (b.Status == BookingStatus.Confirmed ||
                           b.Status == BookingStatus.CheckedIn));

        var basePrice = await _basePriceRepository.Query()
            .Where(bp => bp.RoomTypeId == roomType.Id)
            .Select(bp => bp.Price)
            .FirstOrDefaultAsync();

        return new RoomTypeDto
        {
            Id = roomType.Id,
            HotelId = roomType.HotelId,
            HotelName = roomType.Hotel?.Name ?? "",
            Name = roomType.Name,
            Description = roomType.Description,
            Amenities = amenities,
            Images = new List<string>(), // TODO: Implement image storage
            RoomCount = roomCount,
            CanDelete = canDelete,
            BasePrice = basePrice == 0 ? null : basePrice
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
            Amenities = baseDto.Amenities,
            Images = baseDto.Images,
            RoomCount = baseDto.RoomCount,
            CanDelete = baseDto.CanDelete,
            BasePrice = baseDto.BasePrice,
            Rooms = rooms,
            PricingInfo = null // TODO: Implement pricing info mapping
        };
    }
}