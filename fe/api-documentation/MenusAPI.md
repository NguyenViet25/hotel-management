# Menus API Documentation

## Overview

This document provides detailed information about the Menus (Dishes) API endpoints in the hotel chain management system. These endpoints allow staff to view, create, update, and delete dishes (menu items) and their ingredients.

## Base URL

```
/api/menu
```

## Authentication and Authorization

All endpoints in this API require authentication. Authentication is handled via JWT tokens which should be included in the `Authorization` header of each request.

Authorized roles:

- Admin
- Manager
- Staff

## Common Response Format

All API responses follow a standard format:

```json
{
  "success": true|false,
  "message": "Optional message",
  "data": { /* Response data */ },
  "errors": { /* Optional validation errors */ },
  "meta": { /* Pagination or additional metadata */ }
}
```

## Endpoints

### UC-45 — View Menu List

Display menu items filtered by dish group, shift, status, and active flag.

- **URL**: `/api/menu`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:

| Parameter | Type   | Required | Description                                                                                          |
| --------- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| groupId   | guid   | No       | Filter by menu group ID                                                                              |
| shift     | string | No       | Filter by group shift (e.g., Breakfast/Lunch/Dinner)                                                 |
| status    | string | No       | Menu item status (`Available`, `Unavailable`, `SeasonallyUnavailable`) or numeric enum value (0/1/2) |
| isActive  | bool   | No       | Filter by active state                                                                               |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": "6e0c9c6e-9f8b-4f5f-8c9c-3dfb562a7e21",
      "hotelId": "11111111-2222-3333-4444-555555555555",
      "menuGroupId": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
      "name": "Grilled Chicken Sandwich",
      "description": "Served with fresh lettuce and tomato.",
      "unitPrice": 8.5,
      "portionSize": "1 sandwich",
      "imageUrl": "https://cdn.example.com/images/chicken-sandwich.jpg",
      "isActive": true,
      "status": "Available",
      "group": {
        "id": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
        "name": "Sandwiches",
        "shift": "Lunch"
      },
      "ingredients": [
        {
          "id": "b77f0000-0000-0000-0000-000000000001",
          "name": "Chicken breast",
          "quantity": "150",
          "unit": "g"
        },
        {
          "id": "c88f0000-0000-0000-0000-000000000002",
          "name": "Lettuce",
          "quantity": "3",
          "unit": "leaves"
        }
      ]
    }
  ],
  "errors": null,
  "meta": null
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Failed to get menu items: <details>",
  "errors": null,
  "meta": null
}
```

- **Notes**
  - `shift` is matched against the menu group’s `shift` string; keep consistent values across groups.
  - `status` accepts either the enum name or its numeric value.

---

### UC-46 — Add Dish

Create a new dish (menu item) with unit price, portion size, optional image URL, and ingredients.

- **URL**: `/api/menu`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body** (`CreateMenuItemDto`):

```json
{
  "menuGroupId": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
  "name": "Pasta Carbonara",
  "description": "Classic recipe with pancetta and parmesan.",
  "unitPrice": 12.5,
  "portionSize": "1 plate",
  "imageUrl": "https://cdn.example.com/images/pasta-carbonara.jpg",
  "status": "Available",
  "ingredients": [
    { "name": "Spaghetti", "quantity": "200", "unit": "g" },
    { "name": "Pancetta", "quantity": "100", "unit": "g" },
    { "name": "Eggs", "quantity": "2", "unit": "pcs" }
  ]
}
```

| Field                  | Type   | Required | Rules/Notes              |
| ---------------------- | ------ | -------- | ------------------------ |
| menuGroupId            | guid   | Yes      | Must exist               |
| name                   | string | Yes      | Max 100 characters       |
| description            | string | No       | Max 500 characters       |
| unitPrice              | number | Yes      | Range: 0.01 – 10,000,000 |
| portionSize            | string | Yes      | Max 50 characters        |
| imageUrl               | string | No       | URL of uploaded image    |
| status                 | string | No       | Default `Available`      |
| ingredients            | array  | No       | See ingredient rules     |
| ingredients[].name     | string | Yes      | Max 100 characters       |
| ingredients[].quantity | string | Yes      | Max 20 characters        |
| ingredients[].unit     | string | Yes      | Max 20 characters        |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "9b9f1d4e-37fa-4e05-b5f4-3a0a6a7b6a2d",
    "hotelId": "11111111-2222-3333-4444-555555555555",
    "menuGroupId": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
    "name": "Pasta Carbonara",
    "description": "Classic recipe with pancetta and parmesan.",
    "unitPrice": 12.5,
    "portionSize": "1 plate",
    "imageUrl": "https://cdn.example.com/images/pasta-carbonara.jpg",
    "isActive": true,
    "status": "Available",
    "group": {
      "id": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
      "name": "Main Course",
      "shift": "Dinner"
    },
    "ingredients": [
      {
        "id": "c1000000-0000-0000-0000-000000000001",
        "name": "Spaghetti",
        "quantity": "200",
        "unit": "g"
      }
    ]
  },
  "errors": null,
  "meta": null
}
```

- **Error Response**:
  - **Code**: 400 Bad Request
  - **Content**:

```json
{
  "success": false,
  "message": "Menu group not found",
  "errors": null,
  "meta": null
}
```

- **Notes**
  - Image is provided via `imageUrl`. Uploading the binary is handled by a separate file storage service; this API does not accept multipart uploads.
  - There is no global dish "quantity"; quantities are per ingredient. Order quantities are managed via Orders APIs.

---

### UC-47 — Edit Dish

Update dish fields including price, portion size, image URL, status, active flag, and ingredients.

- **URL**: `/api/menu/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:

  - `id`: Dish ID (GUID)

- **Request Body** (`UpdateMenuItemDto`): All fields optional.

```json
{
  "menuGroupId": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
  "name": "Pasta Carbonara",
  "description": "Rich and creamy.",
  "unitPrice": 13.0,
  "portionSize": "1 plate",
  "imageUrl": "https://cdn.example.com/images/pasta-carbonara-v2.jpg",
  "status": "Available",
  "isActive": true,
  "ingredients": [
    {
      "id": "c1000000-0000-0000-0000-000000000001",
      "name": "Spaghetti",
      "quantity": "220",
      "unit": "g"
    },
    { "name": "Parmesan", "quantity": "30", "unit": "g" }
  ]
}
```

| Field                  | Type   | Required | Rules/Notes                                         |
| ---------------------- | ------ | -------- | --------------------------------------------------- | -------------------------- |
| menuGroupId            | guid   | No       | Must exist if provided                              |
| name                   | string | No       | Max 100 characters                                  |
| description            | string | No       | Max 500 characters                                  |
| unitPrice              | number | No       | Range: 0.01 – 10,000,000                            |
| portionSize            | string | No       | Max 50 characters                                   |
| imageUrl               | string | No       | URL                                                 |
| status                 | string | No       | `Available`, `Unavailable`, `SeasonallyUnavailable` |
| isActive               | bool   | No       | Active flag                                         |
| ingredients            | array  | No       | Updates/adds ingredients                            |
| ingredients[].id       | guid   | null     | No                                                  | Include to update existing |
| ingredients[].name     | string | No       | Max 100 characters                                  |
| ingredients[].quantity | string | No       | Max 20 characters                                   |
| ingredients[].unit     | string | No       | Max 20 characters                                   |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "9b9f1d4e-37fa-4e05-b5f4-3a0a6a7b6a2d",
    "hotelId": "11111111-2222-3333-4444-555555555555",
    "menuGroupId": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
    "name": "Pasta Carbonara",
    "description": "Rich and creamy.",
    "unitPrice": 13.0,
    "portionSize": "1 plate",
    "imageUrl": "https://cdn.example.com/images/pasta-carbonara-v2.jpg",
    "isActive": true,
    "status": "Available",
    "group": {
      "id": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
      "name": "Main Course",
      "shift": "Dinner"
    },
    "ingredients": [
      {
        "id": "c1000000-0000-0000-0000-000000000001",
        "name": "Spaghetti",
        "quantity": "220",
        "unit": "g"
      },
      {
        "id": "c1000000-0000-0000-0000-000000000003",
        "name": "Parmesan",
        "quantity": "30",
        "unit": "g"
      }
    ]
  },
  "errors": null,
  "meta": null
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "Menu item not found",
  "errors": null,
  "meta": null
}
```

- **Notes**
  - If `menuGroupId` is provided, the service validates the group exists; otherwise returns an error.
  - Ingredients with an `id` are updated; those without are added.

---

### UC-48 — Delete Dish

Delete a dish. Intended rule: only if the dish has no order history.

- **URL**: `/api/menu/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:

  - `id`: Dish ID (GUID)

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": null,
  "data": true,
  "errors": null,
  "meta": null
}
```

- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**:

```json
{
  "success": false,
  "message": "Menu item not found",
  "errors": null,
  "meta": null
}
```

- **Notes / Business Logic**
  - Current implementation deletes associated ingredients and the dish without checking order history (`TODO` in code).
  - To enforce the rule, check for any existing `OrderItem` referencing the `menuItemId` and block deletion if found.

---

## Status Enum — `MenuItemStatus`

Allowed values:

- `Available` (0)
- `Unavailable` (1)
- `SeasonallyUnavailable` (2)

---

## Supporting (Optional) — Menu Groups

These endpoints help manage dish groupings and shifts.

### List Groups

- **URL**: `/api/menu/groups`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
      "name": "Sandwiches",
      "shift": "Lunch"
    }
  ],
  "errors": null,
  "meta": null
}
```

### Create Group

- **URL**: `/api/menu/groups`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body** (`CreateMenuGroupDto`):

```json
{
  "name": "Sandwiches",
  "shift": "Lunch"
}
```

| Field | Type   | Required | Rules/Notes        |
| ----- | ------ | -------- | ------------------ |
| name  | string | Yes      | Max 100 characters |
| shift | string | No       | Max 50 characters  |

- **Success Response**:
  - **Code**: 200 OK
  - **Content Example**:

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "5f3a9b24-3b1b-4b25-8aa2-0c2eaf913f9a",
    "name": "Sandwiches",
    "shift": "Lunch"
  },
  "errors": null,
  "meta": null
}
```

---

## Error Codes and Handling

The API uses standard HTTP status codes:

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid request parameters or validation error
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient role to access endpoint
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error
