# Users Admin API Documentation

## Overview

This document provides detailed information about the Users Admin API endpoints in the hotel chain management system. These endpoints allow administrators to manage user accounts within the system.

## Base URL

```
/api/users
```

## Authentication and Authorization

All endpoints in this API require authentication with **Admin** role. Authentication is handled via JWT tokens which should be included in the `Authorization` header of each request.

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

### List Users

Retrieves a paginated list of users with optional filtering.

- **URL**: `/api/users`
- **Method**: `GET`
- **Auth Required**: Yes (Admin role)
- **Query Parameters**:

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| page      | integer | No       | Page number (default: 1)               |
| pageSize  | integer | No       | Number of items per page (default: 20) |
| search    | string  | No       | Search by name, email, or username     |
| role      | string  | No       | Filter by user role                    |
| status    | string  | No       | Filter by user status                  |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "guid",
      "username": "john.doe",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "role": "Manager",
      "status": "Active"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

### Get User

Retrieves details for a specific user by ID.

- **URL**: `/api/users/{id}`
- **Method**: `GET`
- **Auth Required**: Yes (Admin role)
- **URL Parameters**:
  - `id`: User ID (GUID)
- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "guid",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "Manager",
    "status": "Active",
    "hotelId": "guid",
    "hotelName": "Grand Hotel",
    "lastLogin": "2023-01-01T12:00:00Z",
    "createdAt": "2022-01-01T12:00:00Z"
  }
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

### Create User

Creates a new user account.

- **URL**: `/api/users`
- **Method**: `POST`
- **Auth Required**: Yes (Admin role)
- **Request Body**:

```json
{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "Manager",
  "hotelId": "guid"
}
```

- **Success Response**:
  - **Code**: 201 Created
  - **Content Example**:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "guid",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "Manager",
    "status": "Active"
  }
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Username already exists",
  "data": null
}
```

### Update User

Updates an existing user account.

- **URL**: `/api/users/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin role)
- **URL Parameters**:
  - `id`: User ID (GUID)
- **Request Body**:

```json
{
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "Manager",
  "hotelId": "guid"
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "guid",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "Manager",
    "status": "Active"
  }
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

### Change User Status

Activates or deactivates a user account.

- **URL**: `/api/users/{id}/status`
- **Method**: `POST`
- **Auth Required**: Yes (Admin role)
- **URL Parameters**:
  - `id`: User ID (GUID)
- **Request Body**:

```json
{
  "active": true
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "guid",
    "username": "john.doe",
    "status": "Active"
  }
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "User not found",
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
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server-side error
