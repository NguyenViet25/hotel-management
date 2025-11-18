using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Media.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HotelManagement.Services.Admin.Medias;

public class MediaService : IMediaService
{
    private readonly IRepository<HotelManagement.Domain.Media> _repo;
    private readonly IConfiguration _config;

    public MediaService(IRepository<HotelManagement.Domain.Media> repo, IConfiguration config)
    {
        _repo = repo;
        _config = config;
    }

    public async Task<ApiResponse<MediaUploadResponse>> UploadAsync(Stream fileStream, string originalFileName, string contentType, long size, string baseUrl, string webRootPath)
    {
        try
        {
            if (fileStream == null || size == 0)
                return ApiResponse<MediaUploadResponse>.Fail("File is required");

            var maxSizeStr = _config["Media:MaxSizeBytes"];
            long maxSize = 10 * 1024 * 1024;
            if (!string.IsNullOrWhiteSpace(maxSizeStr) && long.TryParse(maxSizeStr, out var parsed))
            {
                maxSize = parsed;
            }
            if (size > maxSize)
                return ApiResponse<MediaUploadResponse>.Fail("File exceeds maximum allowed size");

            var allowed = new[] { "image/png", "image/jpeg", "image/jpg", "image/webp" };
            if (!allowed.Contains(contentType))
                return ApiResponse<MediaUploadResponse>.Fail("Unsupported file type");

            var uploadsRoot = Path.Combine(webRootPath, "uploads", "media");
            Directory.CreateDirectory(uploadsRoot);

            var ext = Path.GetExtension(originalFileName);
            var uniqueName = $"{Guid.NewGuid():N}{ext}";
            var savePath = Path.Combine(uploadsRoot, uniqueName);

            using (var stream = new FileStream(savePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(stream);
            }

            var url = $"{baseUrl}/uploads/media/{uniqueName}";

            var entity = new HotelManagement.Domain.Media
            {
                FileName = uniqueName,
                FilePath = savePath,
                FileUrl = url,
                ContentType = contentType,
                Size = size,
                CreatedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();

            return ApiResponse<MediaUploadResponse>.Ok(new MediaUploadResponse
            {
                Id = entity.Id,
                FileName = entity.FileName,
                FileUrl = entity.FileUrl,
                ContentType = entity.ContentType,
                Size = entity.Size,
                CreatedAt = entity.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<MediaUploadResponse>.Fail($"Error uploading file: {ex.Message}");
        }
    }

    public async Task<ApiResponse<MediaResponse>> GetByIdAsync(int id)
    {
        try
        {
            var e = await _repo.FindAsync(id);
            if (e == null) return ApiResponse<MediaResponse>.Fail("Media not found");
            return ApiResponse<MediaResponse>.Ok(Map(e));
        }
        catch (Exception ex)
        {
            return ApiResponse<MediaResponse>.Fail($"Error retrieving media: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<MediaResponse>>> ListAsync(int page = 1, int pageSize = 50)
    {
        try
        {
            IQueryable<HotelManagement.Domain.Media> q = _repo.Query().OrderByDescending(x => x.CreatedAt);
            var total = await q.CountAsync();
            if (pageSize > 0) q = q.Skip((page - 1) * pageSize).Take(pageSize);
            var list = await q.Select(x => Map(x)).ToListAsync();
            var meta = new { total, page, pageSize };
            return ApiResponse<List<MediaResponse>>.Success(list, meta: meta);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<MediaResponse>>.Fail($"Error listing media: {ex.Message}");
        }
    }

    public async Task<ApiResponse<MediaResponse>> UpdateAsync(int id, MediaUpdateRequest request)
    {
        try
        {
            var e = await _repo.FindAsync(id);
            if (e == null) return ApiResponse<MediaResponse>.Fail("Media not found");

            if (!string.IsNullOrWhiteSpace(request.FileName)) e.FileName = request.FileName;
            if (!string.IsNullOrWhiteSpace(request.ContentType)) e.ContentType = request.ContentType;
            e.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(e);
            await _repo.SaveChangesAsync();
            return ApiResponse<MediaResponse>.Ok(Map(e));
        }
        catch (Exception ex)
        {
            return ApiResponse<MediaResponse>.Fail($"Error updating media: {ex.Message}");
        }
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        try
        {
            var e = await _repo.FindAsync(id);
            if (e == null) return ApiResponse<bool>.Fail("Media not found");

            try
            {
                if (File.Exists(e.FilePath)) File.Delete(e.FilePath);
            }
            catch { }

            await _repo.RemoveAsync(e);
            await _repo.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail($"Error deleting media: {ex.Message}");
        }
    }

    private static MediaResponse Map(HotelManagement.Domain.Media e) => new MediaResponse
    {
        Id = e.Id,
        FileName = e.FileName,
        FilePath = e.FilePath,
        FileUrl = e.FileUrl,
        ContentType = e.ContentType,
        Size = e.Size,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    // webRootPath is provided by the API layer to avoid coupling to ASP.NET types here
}