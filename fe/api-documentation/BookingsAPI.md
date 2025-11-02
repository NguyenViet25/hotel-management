# Bookings API Documentation

## Overview

This document provides detailed information about the Bookings API endpoints in the hotel chain management system. These endpoints allow front desk staff to manage hotel bookings.

## Base URL

```
/api/admin/bookings
```

## Authentication and Authorization

All endpoints in this API require authentication. Users must have the following role:

- **FrontDesk**: Access to booking management functionality

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

### Create Booking

Creates a new booking with deposit.

- **URL**: `/api/admin/bookings`
- **Method**: `POST`
- **Auth Required**: Yes
- **Permissions**: FrontDesk
- **Request Body**:

```json
{
  "guestId": "guid",
  "hotelId": "guid",
  "roomTypeId": "guid",
  "checkInDate": "2023-01-01",
  "checkOutDate": "2023-01-05",
  "adults": 2,
  "children": 0,
  "specialRequests": "string",
  "depositAmount": 100.00,
  "paymentMethod": "string"
}
```

- **Success Response**:
  - **Code**: 201 Created
  - **Content Example**:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "guid",
    "bookingNumber": "string",
    "guestName": "string",
    "checkInDate": "2023-01-01",
    "checkOutDate": "2023-01-05",
    "status": "string",
    "totalAmount": 500.00,
    "depositAmount": 100.00
  }
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Validation error",
  "data": null,
  "errors": {
    "checkInDate": ["Check-in date must be in the future"],
    "checkOutDate": ["Check-out date must be after check-in date"]
  }
}
```

### Get Booking

Retrieves booking details by ID.

- **URL**: `/api/admin/bookings/{id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: FrontDesk
- **URL Parameters**:
  - `id`: Booking ID (GUID)
- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Booking retrieved successfully",
  "data": {
    "id": "guid",
    "bookingNumber": "string",
    "guestDetails": {
      "id": "guid",
      "name": "string",
      "email": "string",
      "phone": "string"
    },
    "hotelName": "string",
    "roomType": "string",
    "checkInDate": "2023-01-01",
    "checkOutDate": "2023-01-05",
    "nights": 4,
    "adults": 2,
    "children": 0,
    "status": "string",
    "specialRequests": "string",
    "totalAmount": 500.00,
    "depositAmount": 100.00,
    "paymentMethod": "string",
    "createdAt": "2023-01-01T12:00:00Z",
    "createdBy": "string"
  }
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "Booking not found",
  "data": null
}
```

### List Bookings

Retrieves a paginated list of bookings with optional filtering.

- **URL**: `/api/admin/bookings`
- **Method**: `GET`
- **Auth Required**: Yes
- **Permissions**: FrontDesk
- **Query Parameters**:

| Parameter   | Type    | Required | Description                                      |
|-------------|---------|----------|--------------------------------------------------|
| page        | integer | No       | Page number (default: 1)                         |
| pageSize    | integer | No       | Number of items per page (default: 20)           |
| hotelId     | guid    | No       | Filter by hotel ID                               |
| guestName   | string  | No       | Filter by guest name (partial match)             |
| status      | string  | No       | Filter by booking status                         |
| fromDate    | date    | No       | Filter by check-in date (from)                   |
| toDate      | date    | No       | Filter by check-in date (to)                     |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": "guid",
      "bookingNumber": "string",
      "guestName": "string",
      "checkInDate": "2023-01-01",
      "checkOutDate": "2023-01-05",
      "status": "string",
      "totalAmount": 500.00
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Invalid query parameters",
  "data": null
}
```

## Error Codes and Handling

The API uses standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters or validation error
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: User does not have required permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error