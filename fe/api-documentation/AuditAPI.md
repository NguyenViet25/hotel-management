# Audit API Documentation

## Controller Overview

The Audit Controller provides endpoints for accessing and querying the system's audit logs. It allows administrators and managers to view historical records of actions performed within the hotel management system, supporting compliance, security monitoring, and troubleshooting needs.

## Endpoints

### Get Audit Logs

Retrieves a paginated list of audit logs with optional filtering.

- **HTTP Method**: GET
- **URL**: `/api/admin/audit/logs`
- **Authorization**: Requires `Admin` or `Manager` role
- **Access Control**: 
  - Admins can view all audit logs
  - Managers can only view logs for hotels they have access to

#### Request Parameters

All parameters are sent as query parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number for pagination |
| pageSize | integer | No | 20 | Number of items per page |
| from | DateTimeOffset | No | null | Filter logs from this timestamp |
| to | DateTimeOffset | No | null | Filter logs up to this timestamp |
| userId | Guid | No | null | Filter logs by specific user ID |
| hotelId | Guid | No | null | Filter logs by specific hotel ID |
| action | string | No | null | Filter logs by action (partial match, case-insensitive) |

#### Response Format

```json
{
  "isSuccess": true,
  "message": null,
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "timestamp": "2025-11-01T12:30:45",
      "action": "USER_LOGIN",
      "hotelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "metadata": {
        "ipAddress": "192.168.1.1",
        "browser": "Chrome 118.0.0",
        "success": true
      }
    },
    // Additional audit log entries...
  ],
  "errors": null,
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

#### Example Request

```
GET /api/admin/audit/logs?page=1&pageSize=10&from=2025-10-01T00:00:00Z&to=2025-11-01T00:00:00Z&action=booking
```

#### Example Response

```json
{
  "isSuccess": true,
  "data": [
    {
      "id": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
      "timestamp": "2025-10-15T14:22:30",
      "action": "BOOKING_CREATED",
      "hotelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "userId": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
      "metadata": {
        "bookingId": "5fa85f64-5717-4562-b3fc-2c963f66afa6",
        "guestName": "John Smith",
        "roomCount": 1,
        "totalAmount": 250.00
      }
    },
    {
      "id": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
      "timestamp": "2025-10-12T09:45:12",
      "action": "BOOKING_UPDATED",
      "hotelId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "userId": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
      "metadata": {
        "bookingId": "6fa85f64-5717-4562-b3fc-2c963f66afa6",
        "changes": {
          "checkOutDate": {
            "old": "2025-10-15",
            "new": "2025-10-16"
          },
          "totalAmount": {
            "old": 200.00,
            "new": 250.00
          }
        }
      }
    }
  ],
  "message": null,
  "errors": null,
  "meta": {
    "total": 15,
    "page": 1,
    "pageSize": 10
  }
}
```

## Models/DTOs

### AuditLogDto

Represents a single audit log entry.

```csharp
public record AuditLogDto(
    Guid Id,                // Unique identifier for the audit log entry
    DateTime Timestamp,     // When the action occurred
    string Action,          // Description of the action performed
    Guid? HotelId,          // ID of the hotel related to this action (if applicable)
    Guid? UserId,           // ID of the user who performed the action (if applicable)
    object? Metadata        // Additional contextual information about the action (JSON)
);
```

### AuditQueryDto

Used to filter and paginate audit log queries.

```csharp
public record AuditQueryDto(
    int Page = 1,                  // Page number (1-based)
    int PageSize = 20,             // Number of items per page
    DateTimeOffset? From = null,   // Start date for filtering
    DateTimeOffset? To = null,     // End date for filtering
    Guid? UserId = null,           // Filter by user ID
    Guid? HotelId = null,          // Filter by hotel ID
    string? Action = null          // Filter by action name (partial match)
);
```

### ApiResponse<T>

Generic wrapper for API responses.

```csharp
public class ApiResponse<T>
{
    public bool IsSuccess { get; set; }            // Whether the request was successful
    public string? Message { get; set; }           // Optional message
    public T? Data { get; set; }                   // Response data
    public IDictionary<string, string[]>? Errors { get; set; }  // Validation errors
    public object? Meta { get; set; }              // Metadata (e.g., pagination info)
}
```

## Error Responses

### 403 Forbidden

Returned when:
- The user is not authenticated
- The user's token doesn't contain a valid user ID
- The user doesn't have the required role (Admin or Manager)
- A Manager tries to access logs for hotels they don't have access to

```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Forbidden",
  "status": 403,
  "traceId": "00-1234567890abcdef1234567890abcdef-1234567890abcdef-00"
}
```

### 400 Bad Request

Returned when query parameters are invalid.

```json
{
  "isSuccess": false,
  "message": "Invalid query parameters",
  "data": null,
  "errors": {
    "page": ["Page must be greater than 0"],
    "pageSize": ["Page size must be between 1 and 100"]
  },
  "meta": null
}
```

## Notes

1. **Pagination**: The API uses 1-based pagination with a default page size of 20 items.

2. **Role-Based Access Control**:
   - Users with the `Admin` role can view all audit logs in the system
   - Users with the `Manager` role can only view logs for hotels they have access to

3. **Filtering**:
   - Date filters use ISO 8601 format (e.g., `2025-10-01T00:00:00Z`)
   - Action filtering is case-insensitive and matches substrings

4. **Metadata**:
   - The `metadata` field contains a JSON object with action-specific details
   - The structure varies depending on the action type
   - It's deserialized from the database's `MetadataJson` column

5. **Sorting**:
   - Results are always sorted by timestamp in descending order (newest first)
   - Custom sorting is not currently supported