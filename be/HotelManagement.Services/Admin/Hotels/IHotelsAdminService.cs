using HotelManagement.Services.Admin.Hotels.Dtos;

namespace HotelManagement.Services.Admin.Hotels;

public interface IHotelsAdminService
{
    Task<(IEnumerable<HotelSummaryDto> Items, int Total)> ListAsync(HotelsQueryDto query, Guid actorUserId, bool isAdmin);
    Task<IEnumerable<HotelSummaryDto> > ListAllAsync();
    Task<HotelDetailsDto?> GetAsync(Guid id, Guid actorUserId, bool isAdmin);
    Task<HotelDetailsDto> CreateAsync(CreateHotelDto dto, Guid actorUserId);
    Task<HotelDetailsDto?> UpdateAsync(Guid id, UpdateHotelDto dto, Guid actorUserId);
    Task<HotelDetailsDto?> ChangeStatusAsync(Guid id, ChangeHotelStatusDto dto, Guid actorUserId);
}