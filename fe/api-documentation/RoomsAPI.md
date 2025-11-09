# Rooms API Documentation

## Overview

This document provides detailed information about the Rooms API endpoints in the hotel chain management system. These endpoints allow staff to manage hotel rooms, their status, and assignments.

## Base URL

```
/api/admin/rooms
```

## Authentication and Authorization

All endpoints in this API require authentication. Authentication is handled via JWT tokens which should be included in the `Authorization` header of each request.

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

### List Rooms

Retrieves a list of rooms with optional filtering by status, floor, and type.

- **URL**: `/api/admin/rooms`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:

| Parameter | Type    | Required | Description                                      |
|-----------|---------|----------|--------------------------------------------------|
| hotelId   | guid    | No       | Filter by hotel ID                               |
| status    | string  | No       | Filter by room status                            |
| floor     | integer | No       | Filter by floor number                           |
| typeId    | guid    | No       | Filter by room type ID                           |
| number    | string  | No       | Filter by room number                            |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Rooms retrieved successfully",
  "data": [
    {
      "id": "guid",
      "number": "101",
      "floor": 1,
      "typeName": "Deluxe",
      "status": "Available",
      "hotelName": "Grand Hotel"
    }
  ],
  "meta": {
    "total": 50
  }
}
```

### Get Room

Retrieves details for a specific room by ID.

- **URL**: `/api/admin/rooms/{id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id`: Room ID (GUID)
- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Room retrieved successfully",
  "data": {
    "id": "guid",
    "number": "101",
    "floor": 1,
    "typeName": "Deluxe",
    "typeId": "guid",
    "status": "Available",
    "hotelId": "guid",
    "hotelName": "Grand Hotel",
    "features": ["Ocean View", "Balcony"]
  }
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "Room not found",
  "data": null
}
```

### Create Room

Creates a new room with assigned type, floor, and number.

- **URL**: `/api/admin/rooms`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "hotelId": "guid",
  "number": "101",
  "floor": 1,
  "typeId": "guid",
  "features": ["Ocean View", "Balcony"]
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "id": "guid",
    "number": "101",
    "floor": 1,
    "typeName": "Deluxe",
    "typeId": "guid",
    "status": "Available",
    "hotelId": "guid",
    "hotelName": "Grand Hotel",
    "features": ["Ocean View", "Balcony"]
  }
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Room number already exists",
  "data": null
}
```

## Error Codes and Handling

The API uses standard HTTP status codes:

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid request parameters or validation error
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Room not found
- `500 Internal Server Error`: Server-side error