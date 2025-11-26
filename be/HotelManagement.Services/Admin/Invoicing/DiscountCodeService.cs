using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Domain.Repositories;
using HotelManagement.Services.Admin.Invoicing.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Invoicing;

public class DiscountCodeService : IDiscountCodeService
{
    private readonly IRepository<Promotion> _promotionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DiscountCodeService(
        IRepository<Promotion> promotionRepository,
        IUnitOfWork unitOfWork)
    {
        _promotionRepository = promotionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<PromotionDto>>> ListAsync(Guid? hotelId)
    {
        try
        {
            var items = await _promotionRepository.Query()
                .Where(x => x.HotelId == hotelId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var dtos = items.Select(MapToDto).ToList();
            return ApiResponse<List<PromotionDto>>.Ok(dtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<PromotionDto>>.Fail($"Failed to list discount codes: {ex.Message}");
        }
    }

    public async Task<ApiResponse<PromotionDto>> GetByIdAsync(Guid id)
    {
        try
        {
            var entity = await _promotionRepository.FindAsync(id);
            if (entity is null) return ApiResponse<PromotionDto>.Fail("Discount code not found");
            return ApiResponse<PromotionDto>.Ok(MapToDto(entity));
        }
        catch (Exception ex)
        {
            return ApiResponse<PromotionDto>.Fail($"Failed to get discount code: {ex.Message}");
        }
    }

    public async Task<ApiResponse<PromotionDto>> CreateAsync(PromotionDto dto, Guid userId)
    {
        var errors = Validate(dto, isUpdate: false);
        if (errors is not null)
            return ApiResponse<PromotionDto>.Fail("Validation failed", errors);

        try
        {
            var hotelId = dto.HotelId ?? Guid.Empty;
            var exists = await _promotionRepository.Query()
                .AnyAsync(p => p.Code == dto.Code && p.HotelId == hotelId);
            if (exists) return ApiResponse<PromotionDto>.Fail("Duplicate code for this hotel");

            var entity = new Promotion
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                Code = dto.Code,
                Description = dto.Description,
                Value = dto.Value!.Value,
                IsActive = dto.IsActive ?? true,
                StartDate = dto.StartDate!.Value,
                EndDate = dto.EndDate!.Value,
                CreatedAt = DateTime.UtcNow
            };

            await _promotionRepository.AddAsync(entity);
            await _promotionRepository.SaveChangesAsync();
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<PromotionDto>.Ok(MapToDto(entity), "Created");
        }
        catch (Exception ex)
        {
            return ApiResponse<PromotionDto>.Fail($"Failed to create discount code: {ex.Message}");
        }
    }

    public async Task<ApiResponse<PromotionDto>> UpdateAsync(Guid id, PromotionDto dto, Guid userId)
    {
        var errors = Validate(dto, isUpdate: true);
        if (errors is not null)
            return ApiResponse<PromotionDto>.Fail("Validation failed", errors);

        try
        {
            var entity = await _promotionRepository.Query()
                .FirstOrDefaultAsync(p => p.Id == id);
            if (entity is null) return ApiResponse<PromotionDto>.Fail("Discount code not found");

            if (!string.IsNullOrWhiteSpace(dto.Code) && dto.Code != entity.Code)
            {
                var duplicate = await _promotionRepository.Query()
                    .AnyAsync(p => p.HotelId == entity.HotelId && p.Code == dto.Code);
                if (duplicate) return ApiResponse<PromotionDto>.Fail("Duplicate code for this hotel");
                entity.Code = dto.Code;
            }

            if (dto.Description != null) entity.Description = dto.Description;
            if (dto.Value.HasValue) entity.Value = dto.Value.Value;
            if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;
            if (dto.StartDate.HasValue) entity.StartDate = dto.StartDate.Value;
            if (dto.EndDate.HasValue) entity.EndDate = dto.EndDate.Value;

            await _promotionRepository.UpdateAsync(entity);
            await _promotionRepository.SaveChangesAsync();
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<PromotionDto>.Ok(MapToDto(entity), "Updated");
        }
        catch (Exception ex)
        {
            return ApiResponse<PromotionDto>.Fail($"Failed to update discount code: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteAsync(Guid id, Guid userId)
    {
        try
        {
            var entity = await _promotionRepository.FindAsync(id);
            if (entity is null) return ApiResponse.Fail("Discount code not found");

            await _promotionRepository.RemoveAsync(entity);
            await _promotionRepository.SaveChangesAsync();
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse.Ok("Deleted");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Failed to delete discount code: {ex.Message}");
        }
    }

    private PromotionDto MapToDto(Promotion e)
    {
        return new PromotionDto
        {
            Id = e.Id,
            Code = e.Code,
            Description = e.Description,
            Value = e.Value,
            IsActive = e.IsActive,
            StartDate = e.StartDate,
            EndDate = e.EndDate
        };
    }

    private IDictionary<string, string[]>? Validate(PromotionDto dto, bool isUpdate)
    {
        var errors = new Dictionary<string, List<string>>();

        if (!isUpdate)
        {
            if (string.IsNullOrWhiteSpace(dto.Code)) AddError(errors, "Code", "Code is required");
            if (!dto.Value.HasValue || dto.Value.Value <= 0) AddError(errors, "Value", "Value must be greater than 0");
            if (!dto.StartDate.HasValue) AddError(errors, "StartDate", "Start date is required");
            if (!dto.EndDate.HasValue) AddError(errors, "EndDate", "End date is required");
        }

        if (dto.Value.HasValue && dto.Value.Value < 0) AddError(errors, "Value", "Value must be non-negative");
        if (dto.StartDate.HasValue && dto.EndDate.HasValue && dto.StartDate > dto.EndDate)
            AddError(errors, "EndDate", "End date must be after start date");

        if (!isUpdate && (!dto.HotelId.HasValue || dto.HotelId == Guid.Empty))
            AddError(errors, "HotelId", "HotelId is required");

        return errors.Count == 0 ? null : errors.ToDictionary(k => k.Key, v => v.Value.ToArray());
    }

    private static void AddError(Dictionary<string, List<string>> dict, string key, string message)
    {
        if (!dict.TryGetValue(key, out var list))
        {
            list = new List<string>();
            dict[key] = list;
        }
        list.Add(message);
    }
}