# Hotel Management System API Documentation

This document provides details about the available API endpoints in the Hotel Management System, including URLs, request/response formats, and authentication requirements.

## Base URL

```
http://localhost:5283
```

## Authentication

The API uses JWT (JSON Web Token) for authentication.

### Login

**URL:** `POST /api/auth/login`

**Authorization:** None (Public endpoint)

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "twoFactorCode": "string",
  "twoFactorProvider": "string"
}
```

**Response:**
```json
{
  "isSuccess": true,
  "message": "Login successful",
  "data": {
    "requiresTwoFactor": false,
    "accessToken": "string",
    "expiresAt": "2023-01-01T00:00:00Z"
  }
}
```

**Notes:**
- If `requiresTwoFactor` is true, you need to provide the two-factor code in a subsequent request
- Store the `accessToken` and include it in the Authorization header for subsequent requests

## User Management

### List Users

**URL:** `GET /api/admin/users`

**Authorization:** Required (Admin role)

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10)

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": [
    {
      "id": "guid",
      "username": "string",
      "email": "string",
      "role": "string",
      "status": "string"
    }
  ],
  "meta": {
    "total": 0,
    "page": 1,
    "pageSize": 10
  }
}
```

### Get User Details

**URL:** `GET /api/admin/users/{id}`

**Authorization:** Required (Admin role)

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "id": "guid",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "phoneNumber": "string",
    "role": "string",
    "status": "string",
    "propertyRoles": [
      {
        "propertyId": "guid",
        "propertyName": "string",
        "role": "string"
      }
    ]
  }
}
```

### Create User

**URL:** `POST /api/admin/users`

**Authorization:** Required (Admin role)

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "string"
}
```

**Response:** Same as Get User Details

### Update User

**URL:** `PUT /api/admin/users/{id}`

**Authorization:** Required (Admin role)

**Request Body:**
```json
{
  "email": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "string"
}
```

**Response:** Same as Get User Details

### Lock/Unlock User

**URL:** `POST /api/admin/users/{id}/lock`

**Authorization:** Required (Admin role)

**Request Body:**
```json
{
  "lockedUntil": "2023-01-01T00:00:00Z" // null to unlock
}
```

**Response:**
```json
{
  "isSuccess": true,
  "message": "Locked until 2023-01-01T00:00:00Z",
  "data": null
}
```

### Assign Property Role

**URL:** `POST /api/admin/users/{id}/property-roles`

**Authorization:** Required (Admin role)

**Request Body:**
```json
{
  "propertyId": "guid",
  "role": "string"
}
```

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "propertyId": "guid",
    "propertyName": "string",
    "role": "string"
  }
}
```

## Room Management

### List Rooms

**URL:** `GET /api/admin/rooms`

**Authorization:** Required

**Query Parameters:**
- `status`: Filter by room status
- `floor`: Filter by floor
- `typeId`: Filter by room type
- `page`: Page number
- `pageSize`: Items per page

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": [
    {
      "id": "guid",
      "number": "string",
      "floor": "string",
      "status": "string",
      "typeName": "string",
      "currentGuest": "string"
    }
  ]
}
```

### Get Room Details

**URL:** `GET /api/admin/rooms/{id}`

**Authorization:** Required

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "id": "guid",
    "number": "string",
    "floor": "string",
    "status": "string",
    "typeId": "guid",
    "typeName": "string",
    "currentBooking": {
      "id": "guid",
      "guestName": "string",
      "checkIn": "2023-01-01T00:00:00Z",
      "checkOut": "2023-01-01T00:00:00Z"
    }
  }
}
```

## Order Management

### List Orders

**URL:** `GET /api/admin/orders`

**Authorization:** Required

**Query Parameters:**
- `status`: Filter by order status
- `page`: Page number
- `pageSize`: Items per page

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": [
    {
      "id": "guid",
      "orderNumber": "string",
      "status": "string",
      "createdAt": "2023-01-01T00:00:00Z",
      "total": 0.0,
      "customerName": "string"
    }
  ]
}
```

### Get Order Details

**URL:** `GET /api/admin/orders/{id}`

**Authorization:** Required

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "id": "guid",
    "orderNumber": "string",
    "status": "string",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z",
    "total": 0.0,
    "customerName": "string",
    "notes": "string",
    "items": [
      {
        "id": "guid",
        "menuItemId": "guid",
        "name": "string",
        "quantity": 0,
        "price": 0.0,
        "status": "string",
        "notes": "string"
      }
    ]
  }
}
```

### Create Walk-in Order

**URL:** `POST /api/admin/orders/walk-in`

**Authorization:** Required

**Request Body:**
```json
{
  "customerName": "string",
  "notes": "string",
  "items": [
    {
      "menuItemId": "guid",
      "quantity": 0,
      "notes": "string"
    }
  ]
}
```

**Response:** Same as Get Order Details

### Update Order

**URL:** `PUT /api/admin/orders/{id}`

**Authorization:** Required

**Request Body:**
```json
{
  "status": "string",
  "notes": "string"
}
```

**Response:** Same as Get Order Details

### Add Order Item

**URL:** `POST /api/admin/orders/{orderId}/items`

**Authorization:** Required

**Request Body:**
```json
{
  "menuItemId": "guid",
  "quantity": 0,
  "notes": "string"
}
```

**Response:** Same as Get Order Details

### Update Order Item

**URL:** `PUT /api/admin/orders/{orderId}/items/{itemId}`

**Authorization:** Required

**Request Body:**
```json
{
  "quantity": 0,
  "status": "string",
  "notes": "string"
}
```

**Response:** Same as Get Order Details

## Service Requests

### Create Service Request

**URL:** `POST /api/admin/service-requests`

**Authorization:** Required (Admin, Manager, Waiter roles)

**Request Body:**
```json
{
  "roomId": "guid",
  "type": "string",
  "description": "string",
  "priority": "string"
}
```

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "id": "guid",
    "roomNumber": "string",
    "type": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

### Update Service Request

**URL:** `PUT /api/admin/service-requests/{id}`

**Authorization:** Required (Admin, Manager, Waiter roles)

**Request Body:**
```json
{
  "status": "string",
  "priority": "string",
  "notes": "string"
}
```

**Response:** Similar to Create Service Request response

### Complete Service Request

**URL:** `POST /api/admin/service-requests/{id}/complete`

**Authorization:** Required (Admin, Manager, Waiter roles)

**Response:** Similar to Create Service Request response

## Dining Sessions

### Create Dining Session

**URL:** `POST /api/admin/dining-sessions`

**Authorization:** Required (Admin, Manager, Waiter roles)

**Request Body:**
```json
{
  "tableNumber": "string",
  "guestCount": 0,
  "notes": "string"
}
```

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "id": "guid",
    "tableNumber": "string",
    "guestCount": 0,
    "status": "string",
    "startTime": "2023-01-01T00:00:00Z",
    "endTime": null,
    "notes": "string",
    "orders": []
  }
}
```

### End Dining Session

**URL:** `POST /api/admin/dining-sessions/{id}/end`

**Authorization:** Required (Admin, Manager, Waiter roles)

**Response:** Similar to Create Dining Session response

### Assign Order to Session

**URL:** `POST /api/admin/dining-sessions/{sessionId}/orders/{orderId}`

**Authorization:** Required (Admin, Manager, Waiter roles)

**Response:** Similar to Create Dining Session response

## Audit Logs

### Query Audit Logs

**URL:** `GET /api/admin/audit/logs`

**Authorization:** Required (Admin, Manager roles)

**Query Parameters:**
- `entityType`: Filter by entity type
- `action`: Filter by action type
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `page`: Page number
- `pageSize`: Items per page

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": [
    {
      "id": "guid",
      "timestamp": "2023-01-01T00:00:00Z",
      "userId": "guid",
      "username": "string",
      "action": "string",
      "entityType": "string",
      "entityId": "guid",
      "details": "string"
    }
  ],
  "meta": {
    "total": 0,
    "page": 1,
    "pageSize": 10
  }
}
```

## Pricing Management

### Create Date Range Price

**URL:** `POST /api/admin/pricing/date-range-price`

**Authorization:** Required

**Request Body:**
```json
{
  "roomTypeId": "guid",
  "name": "string",
  "startDate": "2023-01-01T00:00:00Z",
  "endDate": "2023-01-01T00:00:00Z",
  "price": 0.0,
  "description": "string"
}
```

**Response:**
```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "id": "guid",
    "roomTypeId": "guid",
    "roomTypeName": "string",
    "name": "string",
    "startDate": "2023-01-01T00:00:00Z",
    "endDate": "2023-01-01T00:00:00Z",
    "price": 0.0,
    "description": "string"
  }
}
```

## Common Response Format

All API responses follow a standard format:

```json
{
  "isSuccess": true|false,
  "message": "string|null",
  "data": object|array|null,
  "meta": object|null
}
```

- `isSuccess`: Indicates if the request was successful
- `message`: Optional message, especially useful for errors
- `data`: The actual response data
- `meta`: Optional metadata, often used for pagination

## Error Responses

Error responses follow the same format but with `isSuccess` set to `false`:

```json
{
  "isSuccess": false,
  "message": "Error message describing what went wrong",
  "data": null
}
```

Common HTTP status codes:
- 200 OK: Request succeeded
- 201 Created: Resource created successfully
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side error