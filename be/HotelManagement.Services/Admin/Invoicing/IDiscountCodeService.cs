using HotelManagement.Services.Admin.Invoicing.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Invoicing;

public interface IDiscountCodeService
{
    Task<ApiResponse<List<PromotionDto>>> ListAsync();
    Task<ApiResponse<PromotionDto>> GetByIdAsync(Guid id);
    Task<ApiResponse<PromotionDto>> CreateAsync(PromotionDto dto, Guid userId);
    Task<ApiResponse<PromotionDto>> UpdateAsync(Guid id, PromotionDto dto, Guid userId);
    Task<ApiResponse> DeleteAsync(Guid id, Guid userId);
}