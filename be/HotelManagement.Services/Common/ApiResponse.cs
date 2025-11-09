namespace HotelManagement.Services.Common;

public class ApiResponse<T>
{
    public bool IsSuccess { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }
    public object? Meta { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null, object? meta = null)
        => new() { IsSuccess = true, Data = data, Message = message, Meta = meta };
    public static ApiResponse<T> Success(T data, string? message = null, object? meta = null)
    => new() { IsSuccess = true, Data = data, Message = message, Meta = meta };


    public static ApiResponse<T> Fail(string message, IDictionary<string, string[]>? errors = null, object? meta = null)
        => new() { IsSuccess = false, Message = message, Errors = errors, Meta = meta };
}

public class ApiResponse
{
    public bool IsSuccess { get; set; }
    public string? Message { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }
    public object? Meta { get; set; }

    public static ApiResponse Ok(string? message = null, object? meta = null)
        => new() { IsSuccess = true, Message = message, Meta = meta };

    public static ApiResponse Fail(string message, IDictionary<string, string[]>? errors = null, object? meta = null)
        => new() { IsSuccess = false, Message = message, Errors = errors, Meta = meta };
}