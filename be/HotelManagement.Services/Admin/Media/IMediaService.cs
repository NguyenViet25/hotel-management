using HotelManagement.Services.Admin.Media.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Medias;

public interface IMediaService
{
    Task<ApiResponse<MediaUploadResponse>> UploadAsync(Stream fileStream, string originalFileName, string contentType, long size, string baseUrl, string webRootPath);
    Task<ApiResponse<MediaResponse>> GetByIdAsync(int id);
    Task<ApiResponse<List<MediaResponse>>> ListAsync(int page = 1, int pageSize = 50);
    Task<ApiResponse<MediaResponse>> UpdateAsync(int id, MediaUpdateRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}