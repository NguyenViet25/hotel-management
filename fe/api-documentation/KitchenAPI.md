# Kitchen API Documentation

## Overview

This document provides detailed information about the Kitchen API endpoints that support generating shopping lists and checking ingredient quality. These endpoints are designed for a React + MUI frontend, follow RESTful conventions, and return JSON responses.

## Base URL

```
/api/kitchen
```

## Authentication and Authorization

All endpoints require authentication via JWT, provided in the `Authorization: Bearer <token>` header.

Authorized roles:

- Admin
- Manager
- Staff

## Common Response Format

All responses use a standard wrapper consistent across the API:

```json
{
  "success": true|false,          // maps to ApiResponse.IsSuccess
  "message": "Optional message",
  "data": { /* payload */ },
  "errors": { /* optional validation errors */ },
  "meta": { /* optional metadata */ }
}
```

## Enums

- `QualityStatus` (int):
  - `Good` (0)
  - `Acceptable` (1)
  - `Poor` (2)
  - `Expired` (3)

## Endpoints

### UC-49 — Generate Shopping List

Generate an aggregated shopping list of ingredients across active, available menu items. Optionally filter by specific menu item IDs and attach a date range context.

- **URL**: `/api/kitchen/shopping-list`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body** (`ShoppingListRequestDto`):

```json
{
  "startDate": "2025-11-08T00:00:00Z",
  "endDate": "2025-11-08T23:59:59Z",
  "menuItemIds": [
    "6e0c9c6e-9f8b-4f5f-8c9c-3dfb562a7e21",
    "9b9f1d4e-37fa-4e05-b5f4-3a0a6a7b6a2d"
  ]
}
```

| Field         | Type            | Required | Rules/Notes                                            |
| ------------- | --------------- | -------- | ------------------------------------------------------ |
| `startDate`   | ISO datetime    | No       | Contextual; not currently used to filter in DB         |
| `endDate`     | ISO datetime    | No       | Contextual; not currently used to filter in DB         |
| `menuItemIds` | array of `guid` | No       | If provided, restricts aggregation to given menu items |

- **Success Response** (`ShoppingListDto`):
  - **Code**: `200 OK`

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "e1d9af2f-0f82-47f3-9a8c-3f7f7cbb69ae",
    "generatedDate": "2025-11-08T10:15:30Z",
    "startDate": "2025-11-08T00:00:00Z",
    "endDate": "2025-11-08T23:59:59Z",
    "items": [
      {
        "ingredientName": "Spaghetti",
        "totalQuantity": 420.0,
        "unit": "g",
        "relatedMenuItems": ["Pasta Carbonara"]
      },
      {
        "ingredientName": "Chicken breast",
        "totalQuantity": 300.0,
        "unit": "g",
        "relatedMenuItems": ["Grilled Chicken Sandwich"]
      }
    ]
  },
  "errors": null,
  "meta": null
}
```

- **Error Response**:
  - **Code**: `200 OK` (with `success=false`) or `400 Bad Request` (recommended for future alignment)

```json
{
  "success": false,
  "message": "Failed to generate shopping list: <details>",
  "data": null,
  "errors": null,
  "meta": null
}
```

- **Notes / Business Logic**
  - Only aggregates ingredients from menu items that are `IsActive = true` and `Status = Available`.
  - Ingredient quantities are stored as strings in menu items; aggregation attempts `decimal.TryParse` and treats non-parsable values as `0`.
  - Aggregation groups by `(IngredientName, Unit)` and computes `TotalQuantity`, attaching distinct `RelatedMenuItems` names.
  - `startDate` and `endDate` are accepted but not used to filter orders/menu items in the current implementation; they are returned for context.
  - Future enhancement: integrate date/shift filtering from actual orders to match intended UC description.

---

### UC-50 — Ingredient Quality Check & Replacement Proposal

Record an ingredient quality check with optional replacement proposal, based on staff user identity.

- **URL**: `/api/kitchen/ingredient-quality-check`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body** (`IngredientQualityCheckDto`):

```json
{
  "ingredientName": "Pancetta",
  "status": 2,
  "notes": "Color is off and smell is sour.",
  "needsReplacement": true,
  "replacementQuantity": 1.5,
  "replacementUnit": "kg"
}
```

| Field                 | Type             | Required | Rules/Notes                                             |
| --------------------- | ---------------- | -------- | ------------------------------------------------------- |
| `ingredientName`      | string           | Yes      | Non-empty; max length practical 100 (not enforced here) |
| `status`              | `QualityStatus`  | Yes      | One of: 0 `Good`, 1 `Acceptable`, 2 `Poor`, 3 `Expired` |
| `notes`               | string           | No       | Free text note                                          |
| `needsReplacement`    | boolean          | No       | If `true`, include quantity/unit as needed              |
| `replacementQuantity` | number (decimal) | No       | Should be positive if `needsReplacement` is `true`      |
| `replacementUnit`     | string           | No       | e.g., `kg`, `g`, `pcs`                                  |

- **Success Response** (`IngredientQualityCheckResultDto`):
  - **Code**: `200 OK`

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "a8bde5d1-2c08-4f0a-bb6f-9d2b81f8a2d7",
    "ingredientName": "Pancetta",
    "status": 2,
    "notes": "Color is off and smell is sour.",
    "needsReplacement": true,
    "replacementQuantity": 1.5,
    "replacementUnit": "kg",
    "checkedDate": "2025-11-08T10:20:00Z",
    "checkedByUserName": "kitchen.staff01"
  },
  "errors": null,
  "meta": null
}
```

- **Error Response**:
  - **Code**: `200 OK` (with `success=false`) or `404 Not Found`/`400 Bad Request` (recommended for future alignment)

```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "errors": null,
  "meta": null
}
```

- **Notes / Business Logic**
  - Staff identity is resolved from the JWT claim `ClaimTypes.NameIdentifier` and passed to the service.
  - Current implementation creates an in-memory result and does not persist checks to a database.
  - If `status` is `Poor` or `Expired` and `needsReplacement` is `true`, a real system would trigger a notification or add items to a shopping list; this is not implemented yet.
  - Validation is via data annotations (`[Required]`) on `ingredientName` and `status`.

## Controller & Action Naming Suggestions

- **Controller**: `KitchenController` (current)
- **Actions**:
  - `GenerateShoppingList` — `POST /shopping-list`
  - `CheckIngredientQuality` — `POST /ingredient-quality-check`
- **DTOs**:
  - `ShoppingListRequestDto`, `ShoppingListDto`, `ShoppingListItemDto`
  - `IngredientQualityCheckDto`, `IngredientQualityCheckResultDto`

## Status Codes

- `200 OK` — success responses (and, currently, some failures wrapped in `success=false`)
- `400 Bad Request` — recommended for validation errors (future improvement)
- `404 Not Found` — recommended when dependent resources/users are missing (future improvement)

## Frontend Notes (React + MUI)

- Use authenticated axios instance with base URL as configured (`/api`).
- For UC-49, provide optional date range pickers and menu item multi-select; the API will return aggregated items regardless of date filters at present.
- For UC-50, use a form with `ingredientName`, `status` (select options from `QualityStatus`), `notes`, and conditional fields for replacement quantity/unit.
- Display `message` from responses when `success=false` for user feedback.
