# Room Types API Documentation

## Overview
- Base path: `/api/admin/room-types`
- Auth: All endpoints require authentication (`Authorize`).
- Purpose: Manage room type definitions, details, and deletability in each hotel.

## Common Response
All endpoints return a standard envelope:

```ts
interface ApiResponse<T = any> {
  success: boolean;        // operation result
  message?: string | null; // human-readable message
  data?: T | null;         // payload (if any)
  errors?: Record<string, string[]> | null; // validation errors
  meta?: any;              // optional metadata (pagination, etc.)
}
```

Assumptions:
- `guid` values are serialized as strings.
- `DateTime` are ISO 8601 strings.
- Field names use camelCase in JSON.

## Endpoints Summary
| Method | URL | Action |
|--------|-----|--------|
| POST | `/api/admin/room-types` | CreateRoomType |
| PUT | `/api/admin/room-types/{id}` | UpdateRoomType |
| DELETE | `/api/admin/room-types/{id}` | DeleteRoomType |
| GET | `/api/admin/room-types/{id}` | GetRoomTypeById |
| GET | `/api/admin/room-types/{id}/details` | GetRoomTypeDetails |
| GET | `/api/admin/room-types` | GetRoomTypes |
| GET | `/api/admin/room-types/by-hotel/{hotelId}` | GetRoomTypesByHotel |
| GET | `/api/admin/room-types/{id}/can-delete` | ValidateDelete |

---

## Create Room Type
- Endpoint URL: `/api/admin/room-types`
- HTTP Method: `POST`
- Controller Method: `CreateRoomType`
- Description: Create a new room type in a hotel, including amenities and images.

Request Body (CreateRoomTypeDto):
```ts
interface CreateRoomTypeDto {
  hotelId: string;            // guid, required
  name: string;               // required
  description: string;        // required (can be empty)
  amenityIds: string[];       // guid[], optional
  images: string[];           // optional (URLs or Base64 strings)
}
```
Example:
```json
{
  "hotelId": "c8b43c4b-9d19-4f02-9b7b-5e2b5ea0c001",
  "name": "Deluxe King",
  "description": "Spacious king room with city view",
  "amenityIds": ["4f6a0f4d-96fb-4e6b-8c98-7b6f1d9a1111"],
  "images": ["https://cdn.example.com/rooms/deluxe-king.jpg"]
}
```

Responses:
- 201 Created: `ApiResponse<RoomTypeDto>`
- 400 Bad Request: validation errors

Response Schema (RoomTypeDto):
```ts
interface AmenityDto { id: string; name: string; }

interface RoomTypeDto {
  id: string;                 // guid
  hotelId: string;            // guid
  hotelName: string;
  name: string;
  description: string;
  amenities: AmenityDto[];
  images: string[];
  roomCount: number;
  canDelete: boolean;         // true if no active bookings
  basePrice?: number | null;  // default/base price if configured
}
```
Example (success):
```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "77b20a1c-5b97-4c83-bc80-8b6fe4e9d2f1",
    "hotelId": "c8b43c4b-9d19-4f02-9b7b-5e2b5ea0c001",
    "hotelName": "Downtown Hotel",
    "name": "Deluxe King",
    "description": "Spacious king room with city view",
    "amenities": [{ "id": "4f6a0f4d-96fb-4e6b-8c98-7b6f1d9a1111", "name": "Wi-Fi" }],
    "images": ["https://cdn.example.com/rooms/deluxe-king.jpg"],
    "roomCount": 10,
    "canDelete": true,
    "basePrice": 1200000
  },
  "meta": null
}
```

---

## Update Room Type
- Endpoint URL: `/api/admin/room-types/{id}`
- HTTP Method: `PUT`
- Controller Method: `UpdateRoomType`
- Description: Update the name, description, amenities, and images of a room type.

Route Parameters:
- `id` (string/guid) required

Request Body (UpdateRoomTypeDto):
```ts
interface UpdateRoomTypeDto {
  name: string;               // required
  description: string;        // required (can be empty)
  amenityIds: string[];       // guid[], optional
  images: string[];           // optional
}
```

Responses:
- 200 OK: `ApiResponse<RoomTypeDto>`
- 400 Bad Request: validation or conflict (e.g., name exists in hotel)

---

## Delete Room Type
- Endpoint URL: `/api/admin/room-types/{id}`
- HTTP Method: `DELETE`
- Controller Method: `DeleteRoomType`
- Description: Delete a room type that has no active bookings.

Route Parameters:
- `id` (string/guid) required

Responses:
- 200 OK: `ApiResponse` with `message: "Room type deleted successfully"`
- 400 Bad Request: `ApiResponse` with `message` explaining reason (e.g., active bookings)
- 404 Not Found: if room type does not exist

---

## Get Room Type By Id
- Endpoint URL: `/api/admin/room-types/{id}`
- HTTP Method: `GET`
- Controller Method: `GetRoomTypeById`
- Description: Retrieve a basic summary of a room type by id.

Route Parameters:
- `id` (string/guid) required

Responses:
- 200 OK: `ApiResponse<RoomTypeDto>`
- 404 Not Found

---

## Get Room Type Details
- Endpoint URL: `/api/admin/room-types/{id}/details`
- HTTP Method: `GET`
- Controller Method: `GetRoomTypeDetails`
- Description: Retrieve full detail of a room type including associated rooms and pricing info.

Response Schema (RoomTypeDetailDto):
```ts
interface RoomDto {
  id: string;
  number: string;
  floor: number;
  status: string; // e.g., Available, Occupied
}

interface PricingInfoDto {
  basePrice?: number | null;
  dayOfWeekPrices: { dayOfWeek: number; dayName: string; price: number; }[];
  dateRangePrices: { id: string; startDate: string; endDate: string; price: number; description: string; }[];
}

interface RoomTypeDetailDto extends RoomTypeDto {
  rooms: RoomDto[];
  pricingInfo?: PricingInfoDto | null; // currently null per implementation
}
```

Responses:
- 200 OK: `ApiResponse<RoomTypeDetailDto>`
- 404 Not Found

---

## List Room Types
- Endpoint URL: `/api/admin/room-types`
- HTTP Method: `GET`
- Controller Method: `GetRoomTypes`
- Description: List room types with optional filtering and pagination.

Query Parameters (RoomTypeQueryDto):
| Name | Type | Required | Example | Description |
|------|------|----------|---------|-------------|
| `hotelId` | string (guid) | No | `c8b43c4b-...` | Filter by hotel id |
| `searchTerm` | string | No | `Deluxe` | Filter by name or description |
| `page` | number | No (default 1) | `1` | Page index |
| `pageSize` | number | No (default 10) | `10` | Page size |

Responses:
- 200 OK: `ApiResponse<RoomTypeDto[]>`
- 400 Bad Request

---

## List Room Types by Hotel
- Endpoint URL: `/api/admin/room-types/by-hotel/{hotelId}`
- HTTP Method: `GET`
- Controller Method: `GetRoomTypesByHotel`
- Description: Get all room types for a given hotel.

Route Parameters:
- `hotelId` (string/guid) required

Responses:
- 200 OK: `ApiResponse<RoomTypeDto[]>`
- 400 Bad Request

---

## Validate Room Type Deletability
- Endpoint URL: `/api/admin/room-types/{id}/can-delete`
- HTTP Method: `GET`
- Controller Method: `ValidateDelete`
- Description: Check if a room type can be deleted (no active bookings).

Route Parameters:
- `id` (string/guid) required

Responses:
- 200 OK: `ApiResponse` with `message: "Room type can be deleted"`
- 400 Bad Request: `ApiResponse` with `message: "Cannot delete room type with active bookings"`

---

## TypeScript Models (for FE codegen)
```ts
// Common wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string | null;
  data?: T | null;
  errors?: Record<string, string[]> | null;
  meta?: any;
}

export interface CreateRoomTypeDto {
  hotelId: string;
  name: string;
  description: string;
  amenityIds: string[];
  images: string[];
}

export interface UpdateRoomTypeDto {
  name: string;
  description: string;
  amenityIds: string[];
  images: string[];
}

export interface RoomTypeQueryParams {
  hotelId?: string;
  searchTerm?: string;
  page?: number;     // defaults 1
  pageSize?: number; // defaults 10
}

export interface AmenityDto { id: string; name: string; }

export interface RoomTypeDto {
  id: string;
  hotelId: string;
  hotelName: string;
  name: string;
  description: string;
  amenities: AmenityDto[];
  images: string[];
  roomCount: number;
  canDelete: boolean;
  basePrice?: number | null;
}

export interface RoomDto {
  id: string;
  number: string;
  floor: number;
  status: string;
}

export interface PricingInfoDto {
  basePrice?: number | null;
  dayOfWeekPrices: { dayOfWeek: number; dayName: string; price: number; }[];
  dateRangePrices: { id: string; startDate: string; endDate: string; price: number; description: string; }[];
}

export interface RoomTypeDetailDto extends RoomTypeDto {
  rooms: RoomDto[];
  pricingInfo?: PricingInfoDto | null;
}
```

## Relationships
- A `Hotel` has many `RoomType`.
- A `RoomType` has many `HotelRoom` (rooms).
- A `RoomType` can have pricing configured (base price, day-of-week prices, date-range prices) through Pricing APIs.
- `RoomType.canDelete` depends on booking status of related rooms.

## Error Responses
- 400 Bad Request: validation or conflict; `ApiResponse` with `message` and optional `errors`.
- 404 Not Found: entity not found; `ApiResponse` with `message`.
- 401 Unauthorized: missing/invalid auth.
- 500 Internal Server Error: unexpected server errors.