# Orders API Documentation

## Overview

This document describes the Orders API endpoints that implement UC-28 (Create walk-in order), UC-29 (Create/modify order for booking), and UC-30 (List orders). These endpoints follow RESTful conventions and are consumed by a React + MUI frontend.

## Base URL

`/api/orders`

## Authentication

- Requires JWT in `Authorization: Bearer <token>` header
- Roles typically allowed: Admin, Manager, FrontDesk, Waiter/Service

## Common Response Wrapper

All endpoints return a consistent wrapper:

```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    /* payload */
  },
  "errors": null,
  "meta": {
    /* optional pagination */
  }
}
```

## Enums (reference)

- `OrderStatus`: `Draft`, `Serving`, `Paid`, `Cancelled`, ...
- `OrderItemStatus`: `Pending`, `Prepared`, `Served`, `Voided`, ...

## DTOs (request/response shapes)

- `OrdersQueryDto`:
  - `hotelId?: guid`
  - `status?: OrderStatus`
  - `bookingId?: guid`
  - `isWalkIn?: boolean`
  - `search?: string` (name/phone)
  - `page?: number` (default `1`)
  - `pageSize?: number` (default `20`)
- `OrderItemInputDto`:
  - `menuItemId: guid` (required)
  - `quantity: int` (range `1..1000`)
- `CreateWalkInOrderDto`:
  - `hotelId: guid` (required)
  - `customerName: string` (required, max length 100)
  - `customerPhone?: string` (max length 20)
  - `items?: OrderItemInputDto[]`
- `CreateBookingOrderDto`:
  - `hotelId: guid` (required)
  - `bookingId: guid` (required)
  - `notes?: string`
  - `items?: OrderItemInputDto[]`
- `UpdateOrderDto`:
  - `notes?: string`
  - `status?: OrderStatus`
- `OrderItemDto`:
  - `id: guid`
  - `menuItemId: guid`
  - `menuItemName: string`
  - `quantity: int`
  - `unitPrice: number`
  - `status: OrderItemStatus`
- `OrderSummaryDto`:
  - `id: guid`
  - `hotelId: guid`
  - `bookingId?: guid`
  - `isWalkIn: boolean`
  - `customerName?: string`
  - `customerPhone?: string`
  - `status: OrderStatus`
  - `notes?: string`
  - `createdAt: string` (ISO)
  - `itemsCount: int`
  - `itemsTotal: number`
- `OrderDetailsDto` extends `OrderSummaryDto` with:
  - `items: OrderItemDto[]`

---

## UC-28 — Create Walk-in Order

- URL: `/api/orders/walk-in`
- Method: `POST`
- Purpose: Create a walk-in F&B order with minimal customer info.

### Request Body (CreateWalkInOrderDto)

```json
{
  "hotelId": "c0a8012b-0000-0000-0000-000000000001",
  "customerName": "John Doe",
  "customerPhone": "+84123456789",
  "items": [
    { "menuItemId": "6c2c4b7e-bb3a-4983-9a6f-83c218f1f0f2", "quantity": 2 },
    { "menuItemId": "be0bb4a9-50ac-4c2d-a3de-2f8c13e4a77b", "quantity": 1 }
  ]
}
```

Validation rules:

- `hotelId`: required, must exist
- `customerName`: required, max length 100
- `customerPhone`: optional, max length 20
- `items`: optional; if provided, each item requires `menuItemId` (active menu in hotel) and `quantity` (1..1000)

### Success Response (OrderDetailsDto)

- Status: `200 OK`

```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "id": "b47d8c69-8d71-4a6c-9c2e-4a8a651682a2",
    "hotelId": "c0a8012b-0000-0000-0000-000000000001",
    "bookingId": null,
    "isWalkIn": true,
    "customerName": "John Doe",
    "customerPhone": "+84123456789",
    "status": "Draft",
    "notes": null,
    "createdAt": "2025-11-08T10:10:00Z",
    "itemsCount": 2,
    "itemsTotal": 250000,
    "items": [
      {
        "id": "a1f0ef85-1289-4f1f-b0a0-1b49f6b7f91e",
        "menuItemId": "6c2c4b7e-bb3a-4983-9a6f-83c218f1f0f2",
        "menuItemName": "Phở Bò",
        "quantity": 2,
        "unitPrice": 80000,
        "status": "Pending"
      },
      {
        "id": "f2c0f9a1-7b7f-49d2-b8b5-814fbb9b38e4",
        "menuItemId": "be0bb4a9-50ac-4c2d-a3de-2f8c13e4a77b",
        "menuItemName": "Trà Đào",
        "quantity": 1,
        "unitPrice": 90000,
        "status": "Pending"
      }
    ]
  },
  "errors": null
}
```

### Error Response

- Status: `400 Bad Request` (validation/business)

```json
{
  "isSuccess": false,
  "message": "Menu item not found or inactive",
  "data": null,
  "errors": null
}
```

Notes:

- Menu items are validated to belong to `hotelId` and be `IsActive`.
- New orders start in `Draft` status.

---

## UC-29 — Create Order for Existing Booking

- URL: `/api/orders/booking`
- Method: `POST`
- Purpose: Attach a new F&B order to an existing booking; add notes and items.

### Request Body (CreateBookingOrderDto)

```json
{
  "hotelId": "c0a8012b-0000-0000-0000-000000000001",
  "bookingId": "d3d3c3f6-7c8b-4e2a-b6f4-2f8e9a1b2c3d",
  "notes": "Guest requests less sugar",
  "items": [
    { "menuItemId": "6c2c4b7e-bb3a-4983-9a6f-83c218f1f0f2", "quantity": 1 }
  ]
}
```

Validation rules:

- `hotelId`: required
- `bookingId`: required; must exist and belong to `hotelId`
- `notes`: optional
- `items`: optional; rules same as UC-28

### Success Response (OrderDetailsDto)

- Status: `200 OK`

```json
{
  "isSuccess": true,
  "message": null,
  "data": {
    "id": "9c7d2e1f-32d1-4c54-9f7e-cc1a1d3e1234",
    "hotelId": "c0a8012b-0000-0000-0000-000000000001",
    "bookingId": "d3d3c3f6-7c8b-4e2a-b6f4-2f8e9a1b2c3d",
    "isWalkIn": false,
    "customerName": null,
    "customerPhone": null,
    "status": "Draft",
    "notes": "Guest requests less sugar",
    "createdAt": "2025-11-08T10:12:00Z",
    "itemsCount": 1,
    "itemsTotal": 80000,
    "items": [
      {
        "id": "e1c2a3b4-5678-49ab-90cd-ef0123456789",
        "menuItemId": "6c2c4b7e-bb3a-4983-9a6f-83c218f1f0f2",
        "menuItemName": "Phở Bò",
        "quantity": 1,
        "unitPrice": 80000,
        "status": "Pending"
      }
    ]
  },
  "errors": null
}
```

### Error Response

- Status: `400 Bad Request`

```json
{
  "isSuccess": false,
  "message": "Booking not found in hotel",
  "data": null,
  "errors": null
}
```

Notes:

- Orders created for bookings also start with `Draft`.

---

## UC-30 — List Orders

- URL: `/api/orders`
- Method: `GET`
- Purpose: List orders that are currently being served or paid; supports filters and pagination.

### Query Parameters (OrdersQueryDto)

- `hotelId` (guid, optional)
- `status` (OrderStatus, optional)
- `bookingId` (guid, optional)
- `isWalkIn` (boolean, optional)
- `search` (string, optional; matches customer name/phone)
- `page` (number, optional; default 1)
- `pageSize` (number, optional; default 20)

Example:

`GET /api/orders?status=Serving&page=1&pageSize=10&search=doe`

### Success Response (List of OrderSummaryDto)

- Status: `200 OK`

```json
{
  "isSuccess": true,
  "message": null,
  "data": [
    {
      "id": "b47d8c69-8d71-4a6c-9c2e-4a8a651682a2",
      "hotelId": "c0a8012b-0000-0000-0000-000000000001",
      "bookingId": null,
      "isWalkIn": true,
      "customerName": "John Doe",
      "customerPhone": "+84123456789",
      "status": "Serving",
      "notes": null,
      "createdAt": "2025-11-08T10:10:00Z",
      "itemsCount": 2,
      "itemsTotal": 250000
    },
    {
      "id": "9c7d2e1f-32d1-4c54-9f7e-cc1a1d3e1234",
      "hotelId": "c0a8012b-0000-0000-0000-000000000001",
      "bookingId": "d3d3c3f6-7c8b-4e2a-b6f4-2f8e9a1b2c3d",
      "isWalkIn": false,
      "customerName": null,
      "customerPhone": null,
      "status": "Paid",
      "notes": "Guest requests less sugar",
      "createdAt": "2025-11-08T10:12:00Z",
      "itemsCount": 1,
      "itemsTotal": 80000
    }
  ],
  "errors": null,
  "meta": { "total": 2, "page": 1, "pageSize": 10 }
}
```

### Error Response

- Status: `200 OK` (with `isSuccess=false`) or `400 Bad Request` (recommended for future alignment)

```json
{
  "isSuccess": false,
  "message": "Invalid query parameters",
  "data": null,
  "errors": null
}
```

Notes:

- `status` filter typically targets `Serving` and `Paid` for the UC.
- Pagination returns `meta` when supported.

---

## Supporting Endpoints (from OrdersController)

- `GET /api/orders/{id}` — Get order details by ID. Returns `404 Not Found` if not found.
- `PUT /api/orders/{id}` — Update order notes/status using `UpdateOrderDto`.
- `POST /api/orders/{orderId}/items` — Add an item (`AddOrderItemDto`).
- `PUT /api/orders/{orderId}/items/{itemId}` — Update item (`UpdateOrderItemDto`).
- `DELETE /api/orders/{orderId}/items/{itemId}` — Remove item.
- `POST /api/orders/{orderId}/apply-discount` — Apply discount code (`ApplyDiscountDto`), returns updated total as decimal.

## Controller & Action Suggestions

- Controller: `OrdersController`
- Actions:
  - `CreateWalkIn` — `POST /walk-in`
  - `CreateForBooking` — `POST /booking`
  - `List` — `GET /`
  - Plus: `GetById`, `Update`, `AddItem`, `UpdateItem`, `RemoveItem`, `ApplyDiscount`

## Status Codes

- `200 OK` — Success
- `400 Bad Request` — Validation/business errors
- `404 Not Found` — Missing order or dependent resources
- `401 Unauthorized` — Missing/invalid auth token (handled globally)

## Frontend Notes

- Use the authenticated axios instance.
- For UC-28/29, consider using forms with: hotel selection, booking picker (UC-29), items selector with quantities.
- For UC-30, support filters for `status`, `search`, pagination; show totals and item counts.
