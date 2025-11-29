# Hotels Admin API Documentation

## Overview

This document provides detailed information about the Hotels Admin API endpoints in the hotel chain management system. These endpoints allow administrators and managers to manage hotel properties within the system.

## Base URL

```
/api/hotels
```

## Authentication and Authorization

All endpoints in this API require authentication. Users must have one of the following roles:

- **Admin**: Full access to all endpoints
- **Manager**: Limited access (can only view hotel information)

Authentication is handled via JWT tokens which should be included in the `Authorization` header of each request.

## Common Response Format

All API responses follow a standard format:

```json
{
  "success": true|false,
  "message": "Optional message",
  "data": { /* Response data */ },
  "meta": { /* Pagination or additional metadata */ }
}
```

## Endpoints

### List Hotels

Retrieves a paginated list of hotels with optional filtering.

- **URL**: `/api/hotels`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Admin, Manager
- **Query Parameters**:

| Parameter | Type    | Required | Description                                  |
| --------- | ------- | -------- | -------------------------------------------- |
| page      | integer | No       | Page number (default: 1)                     |
| pageSize  | integer | No       | Number of items per page (default: 20)       |
| search    | string  | No       | Search term for hotel name, code, or address |
| isActive  | boolean | No       | Filter by active status                      |
| sortBy    | string  | No       | Field to sort by (name, code, createdAt)     |
| sortDir   | string  | No       | Sort direction (asc, desc)                   |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "code": "HTL001",
      "name": "Grand Hotel",
      "address": "123 Main Street, City",
      "isActive": true,
      "createdAt": "2023-01-15T08:30:00Z"
    },
    {
      "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "code": "HTL002",
      "name": "Beach Resort",
      "address": "456 Ocean Drive, Seaside",
      "isActive": true,
      "createdAt": "2023-02-20T10:15:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "pageSize": 20
  }
}
```

### Get Hotel Details

Retrieves detailed information about a specific hotel.

- **URL**: `/api/hotels/{id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: Admin, Manager
- **URL Parameters**:

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| id        | guid | Yes      | Hotel ID    |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "HTL001",
    "name": "Grand Hotel",
    "address": "123 Main Street, City",
    "isActive": true,
    "createdAt": "2023-01-15T08:30:00Z"
  }
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "Hotel not found"
}
```

### Create Hotel

Creates a new hotel in the system.

- **URL**: `/api/hotels`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: Admin only
- **Request Body**:

```json
{
  "code": "HTL003",
  "name": "Mountain Lodge",
  "address": "789 Alpine Road, Mountains",
  "config": {} // Optional configuration object
}
```

| Field   | Type   | Required | Description                                        |
| ------- | ------ | -------- | -------------------------------------------------- |
| code    | string | Yes      | Unique hotel code (will be converted to uppercase) |
| name    | string | Yes      | Hotel name                                         |
| address | string | Yes      | Hotel physical address                             |
| config  | object | No       | Optional configuration settings                    |

- **Success Response**:
  - **Code**: 201 Created
  - **Content Example**:

```json
{
  "success": true,
  "data": {
    "id": "5fa85f64-5717-4562-b3fc-2c963f66afa8",
    "code": "HTL003",
    "name": "Mountain Lodge",
    "address": "789 Alpine Road, Mountains",
    "isActive": true,
    "createdAt": "2023-04-10T14:20:00Z"
  }
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Hotel code already exists"
}
```

### Update Hotel

Updates an existing hotel's information.

- **URL**: `/api/hotels/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Permissions**: Admin only
- **URL Parameters**:

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| id        | guid | Yes      | Hotel ID    |

- **Request Body**:

```json
{
  "name": "Grand Hotel Deluxe",
  "address": "123 Main Boulevard, City Center",
  "isActive": true
}
```

| Field    | Type    | Required | Description                |
| -------- | ------- | -------- | -------------------------- |
| name     | string  | No       | Updated hotel name         |
| address  | string  | No       | Updated hotel address      |
| isActive | boolean | No       | Updated hotel active state |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "HTL001",
    "name": "Grand Hotel Deluxe",
    "address": "123 Main Boulevard, City Center",
    "isActive": true,
    "createdAt": "2023-01-15T08:30:00Z"
  }
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "Hotel not found"
}
```

### Change Hotel Status

Changes the operational status of a hotel.

- **URL**: `/api/hotels/{id}/status`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: Admin only
- **URL Parameters**:

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| id        | guid | Yes      | Hotel ID    |

- **Request Body**:

```json
{
  "action": "pause",
  "reason": "Seasonal closure",
  "until": "2023-09-15T00:00:00Z"
}
```

| Field  | Type     | Required | Description                                                |
| ------ | -------- | -------- | ---------------------------------------------------------- |
| action | string   | Yes      | Status action: "pause", "close", or "resume"               |
| reason | string   | Yes      | Reason for the status change                               |
| until  | datetime | No       | Optional date until when the status change should be valid |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "HTL001",
    "name": "Grand Hotel",
    "address": "123 Main Street, City",
    "isActive": false,
    "createdAt": "2023-01-15T08:30:00Z"
  }
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Unsupported status action"
}
```

## Error Codes and Handling

The API uses standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource successfully created
- `400 Bad Request`: Invalid request parameters or validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Authenticated user lacks permission
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. Current limits are:

- 100 requests per minute for authenticated users
- 5 requests per minute for unauthenticated users

## Data Models

### HotelSummaryDto

```csharp
public record HotelSummaryDto(
    Guid Id,
    string Code,
    string Name,
    string Address,
    bool IsActive,
    DateTime CreatedAt
);
```

### HotelDetailsDto

```csharp
public record HotelDetailsDto(
    Guid Id,
    string Code,
    string Name,
    string Address,
    bool IsActive,
    DateTime CreatedAt
);
```

### HotelsQueryDto

```csharp
public record HotelsQueryDto(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    bool? IsActive = null,
    string? SortBy = "createdAt",
    string? SortDir = "desc"
);
```

### CreateHotelDto

```csharp
public record CreateHotelDto(
    string Code,
    string Name,
    string Address,
    object? Config = null
);
```

### UpdateHotelDto

```csharp
public record UpdateHotelDto(
    string? Name,
    string? Address,
    bool? IsActive
);
```

### ChangeHotelStatusDto

```csharp
public record ChangeHotelStatusDto(
    string Action,
    string Reason,
    DateTimeOffset? Until = null
);
```
