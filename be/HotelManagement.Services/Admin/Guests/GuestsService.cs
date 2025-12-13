using HotelManagement.Domain;
using HotelManagement.Repository;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Guests;

public interface IGuestsService
{
    Task<(IEnumerable<GuestDetailsDto> Items, int Total)> ListAsync(GuestsQueryDto query);
    Task<GuestDetailsDto?> GetAsync(Guid id);
    Task<ApiResponse<GuestDetailsDto>> CreateAsync(CreateGuestDto dto);
    Task<ApiResponse<GuestDetailsDto>> UpdateAsync(Guid id, UpdateGuestDto dto);
}

public class GuestsService : IGuestsService
{
    private readonly ApplicationDbContext _db;
    public GuestsService(ApplicationDbContext db) { _db = db; }

    public async Task<(IEnumerable<GuestDetailsDto> Items, int Total)> ListAsync(GuestsQueryDto query)
    {
        var baseQuery = _db.Guests.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            var s = query.Name.ToLower();
            baseQuery = baseQuery.Where(g => g.FullName.ToLower().Contains(s));
        }
        if (!string.IsNullOrWhiteSpace(query.Phone))
        {
            baseQuery = baseQuery.Where(g => g.Phone.Contains(query.Phone));
        }
        if (!string.IsNullOrWhiteSpace(query.Email))
        {
            var e = query.Email.ToLower();
            baseQuery = baseQuery.Where(g => (g.Email ?? "").ToLower().Contains(e));
        }
        if (!string.IsNullOrWhiteSpace(query.IdCard))
        {
            baseQuery = baseQuery.Where(g => g.IdCard.Contains(query.IdCard));
        }

        baseQuery = (query.SortBy?.ToLower(), query.SortDir?.ToLower()) switch
        {
            ("fullname", "asc") => baseQuery.OrderBy(g => g.FullName),
            ("fullname", "desc") => baseQuery.OrderByDescending(g => g.FullName),
            ("phone", "asc") => baseQuery.OrderBy(g => g.Phone),
            ("phone", "desc") => baseQuery.OrderByDescending(g => g.Phone),
            _ => baseQuery.OrderBy(g => g.FullName)
        };

        var total = await baseQuery.CountAsync();
        var items = await baseQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(g => new GuestDetailsDto
            {
                Id = g.Id,
                FullName = g.FullName,
                Phone = g.Phone,
                Email = g.Email,
                IdCard = g.IdCard,
                IdCardBackImageUrl = g.IdCardBackImageUrl,
                IdCardFrontImageUrl = g.IdCardFrontImageUrl,
            })
            .ToListAsync();

        return (items, total);
    }

    public async Task<GuestDetailsDto?> GetAsync(Guid id)
    {
        var g = await _db.Guests.FirstOrDefaultAsync(x => x.Id == id);
        if (g == null) return null;
        return new GuestDetailsDto
        {
            Id = g.Id,
            FullName = g.FullName,
            Phone = g.Phone,
            Email = g.Email,
            IdCard = g.IdCard,
            IdCardFrontImageUrl = g.IdCardFrontImageUrl,
            IdCardBackImageUrl = g.IdCardBackImageUrl
        };
    }

    public async Task<ApiResponse<GuestDetailsDto>> CreateAsync(CreateGuestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName)) return ApiResponse<GuestDetailsDto>.Fail("FullName is required");
        if (string.IsNullOrWhiteSpace(dto.Phone)) return ApiResponse<GuestDetailsDto>.Fail("Phone is required");
        if (string.IsNullOrWhiteSpace(dto.IdCard)) return ApiResponse<GuestDetailsDto>.Fail("IdCard is required");

        var exists = await _db.Guests.AnyAsync(g => g.Phone == dto.Phone && g.IdCard == dto.IdCard);
        if (exists) return ApiResponse<GuestDetailsDto>.Fail("Duplicate guest");

        var entity = new Guest
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName,
            Phone = dto.Phone,
            IdCard = dto.IdCard,
            Email = dto.Email,
            IdCardFrontImageUrl = dto.IdCardFrontImageUrl,
            IdCardBackImageUrl = dto.IdCardBackImageUrl
        };
        _db.Guests.Add(entity);
        await _db.SaveChangesAsync();

        var created = await GetAsync(entity.Id);
        return ApiResponse<GuestDetailsDto>.Ok(created);
    }

    public async Task<ApiResponse<GuestDetailsDto>> UpdateAsync(Guid id, UpdateGuestDto dto)
    {
        var g = await _db.Guests.FirstOrDefaultAsync(x => x.Id == id);
        if (g == null) return ApiResponse<GuestDetailsDto>.Fail("Guest not found");

        if (dto.FullName != null) g.FullName = dto.FullName;
        if (dto.Phone != null) g.Phone = dto.Phone;
        if (dto.IdCard != null) g.IdCard = dto.IdCard;
        g.Email = dto.Email;
        g.IdCardFrontImageUrl = dto.IdCardFrontImageUrl;
        g.IdCardBackImageUrl = dto.IdCardBackImageUrl;

        await _db.SaveChangesAsync();
        var updated = await GetAsync(id);
        return ApiResponse<GuestDetailsDto>.Ok(updated);
    }
}
