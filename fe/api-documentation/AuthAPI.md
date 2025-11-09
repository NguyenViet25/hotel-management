# Authentication API Documentation

## Overview

This document provides detailed information about the Authentication API endpoints in the hotel chain management system. These endpoints allow users to authenticate, manage two-factor authentication, and handle password reset functionality.

## Base URL

```
/api/auth
```

## Endpoints

### Login

Authenticates a user and returns an access token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

- **Success Responses**:
  - **Code**: 200 OK
  - **Content Example** (Standard login):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "abc123...",
    "expiresIn": 3600,
    "requiresTwoFactor": false
  }
}
```

- **Content Example** (Two-factor required):

```json
{
  "success": true,
  "message": "Two-factor required",
  "data": {
    "accessToken": null,
    "refreshToken": null,
    "expiresIn": 0,
    "requiresTwoFactor": true
  }
}
```

- **Error Response**:
  - **Code**: 401 Unauthorized
  - **Content**:

```json
{
  "success": false,
  "message": "Invalid credentials",
  "data": null
}
```

### Verify Two-Factor Authentication

Verifies a two-factor authentication code and returns an access token upon successful verification.

- **URL**: `/api/auth/2fa/verify`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
  "username": "string",
  "code": "string"
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "2FA success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "abc123...",
    "expiresIn": 3600,
    "requiresTwoFactor": false
  }
}
```

- **Error Response**:
  - **Code**: 401 Unauthorized
  - **Content**:

```json
{
  "success": false,
  "message": "Invalid 2FA code",
  "data": null
}
```

### Logout

Logs out the current user and invalidates their tokens.

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**: None
- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Logged out",
  "data": null
}
```

### Forgot Password

Sends a one-time password (OTP) to the user's registered email for password reset.

- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
  "email": "string"
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Reset OTP sent",
  "data": null
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

### Reset Password

Resets a user's password using the OTP sent to their email.

- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Reset failed",
  "data": null
}
```

## Error Codes and Handling

The API uses standard HTTP status codes:

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid request parameters or validation error
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server-side error

## Authentication Flow

1. **Standard Login**: User provides username and password, receives access token

2. **Password Reset**:
   - User requests password reset with email
   - System sends OTP to email
   - User submits OTP and new password
   - System confirms password reset
