# Hotel Management System - API Endpoints Documentation

## Authentication Endpoints

### User Authentication

| Method | Endpoint                  | Description                                | Authorization Required |
|--------|---------------------------|--------------------------------------------|------------------------|
| POST   | `/api/auth/register`      | Register a new user                        | No                     |
| POST   | `/api/auth/login`         | Authenticate user and get JWT token        | No                     |
| POST   | `/api/auth/refresh-token` | Refresh an expired JWT token              | No                     |
| POST   | `/api/auth/google-login`  | Authenticate with Google OAuth            | No                     |
| POST   | `/api/auth/forgot-password` | Request password reset                   | No                     |
| POST   | `/api/auth/reset-password`  | Reset password with token                | No                     |
| POST   | `/api/auth/change-password` | Change user password                     | Yes                    |
| GET    | `/api/auth/verify-email`    | Verify user email with token             | No                     |

## User Management Endpoints

### Users

| Method | Endpoint                  | Description                                | Authorization Required |
|--------|---------------------------|--------------------------------------------|------------------------|
| GET    | `/api/user`               | Get all users                              | Yes (Admin)            |
| GET    | `/api/user/{id}`          | Get user by ID                             | Yes (Admin/Self)       |
| POST   | `/api/user`               | Create a new user                          | Yes (Admin)            |
| PUT    | `/api/user/{id}`          | Update user                                | Yes (Admin/Self)       |
| DELETE | `/api/user/{id}`          | Delete user                                | Yes (Admin)            |
| PUT    | `/api/user/{id}/activate`   | Activate user                            | Yes (Admin)            |
| PUT    | `/api/user/{id}/deactivate` | Deactivate user                          | Yes (Admin)            |

### Roles

| Method | Endpoint                  | Description                                | Authorization Required |
|--------|---------------------------|--------------------------------------------|------------------------|
| GET    | `/api/role`               | Get all roles                              | Yes (Admin)            |
| GET    | `/api/role/{id}`          | Get role by ID                             | Yes (Admin)            |
| POST   | `/api/role`               | Create a new role                          | Yes (Admin)            |
| PUT    | `/api/role/{id}`          | Update role                                | Yes (Admin)            |
| DELETE | `/api/role/{id}`          | Delete role                                | Yes (Admin)            |
| GET    | `/api/role/{id}/users`    | Get users in role                          | Yes (Admin)            |
| POST   | `/api/user/{userId}/roles/{roleId}` | Assign role to user                | Yes (Admin)            |
| DELETE | `/api/user/{userId}/roles/{roleId}` | Remove role from user              | Yes (Admin)            |

## Hotel Property Management Endpoints

### Hotel Properties

| Method | Endpoint                  | Description                                | Authorization Required |
|--------|---------------------------|--------------------------------------------|------------------------|
| GET    | `/api/hotelproperty`      | Get all hotel properties                   | No                     |
| GET    | `/api/hotelproperty/{id}` | Get hotel property by ID                   | No                     |
| POST   | `/api/hotelproperty`      | Create a new hotel property                | Yes (Admin/Manager)    |
| PUT    | `/api/hotelproperty/{id}` | Update hotel property                      | Yes (Admin/Manager)    |
| DELETE | `/api/hotelproperty/{id}` | Delete hotel property                      | Yes (Admin)            |
| GET    | `/api/hotelproperty/search` | Search hotel properties                  | No                     |
| GET    | `/api/hotelproperty/location` | Get properties by location              | No                     |

### Property Amenities

| Method | Endpoint                                      | Description                    | Authorization Required |
|--------|-----------------------------------------------|--------------------------------|------------------------|
| GET    | `/api/hotelproperty/{propertyId}/amenities`   | Get property amenities         | No                     |
| POST   | `/api/hotelproperty/{propertyId}/amenities`   | Add amenity to property        | Yes (Admin/Manager)    |
| DELETE | `/api/hotelproperty/{propertyId}/amenities/{amenityId}` | Remove amenity from property | Yes (Admin/Manager) |

## Room Management Endpoints

### Rooms

| Method | Endpoint                  | Description                                | Authorization Required |
|--------|---------------------------|--------------------------------------------|------------------------|
| GET    | `/api/room`               | Get all rooms                              | No                     |
| GET    | `/api/room/{id}`          | Get room by ID                             | No                     |
| GET    | `/api/room/property/{propertyId}` | Get rooms by property ID            | No                     |
| GET    | `/api/room/available`     | Get available rooms for date range         | No                     |
| POST   | `/api/room`               | Create a new room                          | Yes (Admin/Manager)    |
| PUT    | `/api/room/{id}`          | Update room                                | Yes (Admin/Manager)    |
| DELETE | `/api/room/{id}`          | Delete room                                | Yes (Admin)            |
| PUT    | `/api/room/{id}/status`   | Update room status                         | Yes (Admin/Manager/Staff) |

### Room Types

| Method | Endpoint                  | Description                                | Authorization Required |
|--------|---------------------------|--------------------------------------------|------------------------|
| GET    | `/api/room/types`         | Get all room types                         | No                     |
| GET    | `/api/room/types/{id}`    | Get room type by ID                        | No                     |
| POST   | `/api/room/types`         | Create a new room type                     | Yes (Admin/Manager)    |
| PUT    | `/api/room/types/{id}`    | Update room type                           | Yes (Admin/Manager)    |
| DELETE | `/api/room/types/{id}`    | Delete room type                           | Yes (Admin)            |

## Request and Response Formats

### Authentication

#### Register Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### Login Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "6fd8d272-375a-4d8f-b7a3-248a8309c...",
  "expiration": "2023-08-01T12:00:00Z",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["User"]
  }
}
```

### Hotel Property

#### Hotel Property Request/Response
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Grand Hotel",
  "description": "Luxury hotel in downtown",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001",
  "phoneNumber": "+1234567890",
  "email": "info@grandhotel.com",
  "website": "https://www.grandhotel.com",
  "starRating": 5,
  "amenities": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Swimming Pool",
      "description": "Outdoor swimming pool"
    }
  ]
}
```

### Room

#### Room Request/Response
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "propertyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "roomNumber": "101",
  "roomTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "Available",
  "floorNumber": 1,
  "description": "Spacious room with city view",
  "roomType": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Deluxe King",
    "description": "Deluxe room with king-size bed",
    "capacity": 2,
    "basePrice": 199.99
  }
}
```

## Error Responses

All API endpoints return standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "traceId": "00-f528b33e9bd6874b9d15c1f99ebbd9c5-b46c9a3b1c39684c-00",
  "errors": {
    "Email": ["The Email field is required."],
    "Password": ["The Password field is required."]
  }
}
```

## Authentication

Protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1628166000
```