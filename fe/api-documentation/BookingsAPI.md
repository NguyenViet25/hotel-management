# Bookings API (UC-31 – UC-34)

Framework: ASP.NET Core Web API

Consumes: JSON

Auth: Bearer JWT (same as other Admin APIs)

Base Path: `api/bookings`

This API follows the project’s Admin controller conventions and returns consistent JSON using `ApiResponse` (`isSuccess`, `message`, `data`, `errors`, `meta`). All endpoints use standard HTTP status codes.

---

## Common Response Wrapper

Success:

```json
{
  "isSuccess": true,
  "message": "optional message",
  "data": { "...payload..." },
  "errors": null,
  "meta": null
}
```

Error:

```json
{
  "isSuccess": false,
  "message": "error summary",
  "data": null,
  "errors": ["validation or domain errors"],
  "meta": null
}
```

---

## Controller & Actions

- Controller: `BookingsController` (Admin)
- Actions:
  - `Create` → POST `/api/bookings` (UC-31)
  - `Get` → GET `/api/bookings/{id}` (UC-33)
  - `AddCallLog` → POST `/api/bookings/{id}/call-log` (UC-32)
  - `Update` → PUT `/api/bookings/{id}` (UC-33)
  - `Cancel` → DELETE `/api/bookings/{id}` (UC-33)
  - `RoomMap` → GET `/api/bookings/room-map` (UC-34)

---

## UC-31 – Create Booking with Deposit

- URL: `POST /api/bookings`
- Purpose: Create a booking with multiple room types and rooms, store a deposit, compute totals, and set status to `Pending`.

### Request Body (CreateBookingDto)

```json
{
  "hotelId": "Guid",
  "checkInDate": "YYYY-MM-DD",
  "checkOutDate": "YYYY-MM-DD",
  "depositAmount": 0,
  "discountAmount": 0,
  "primaryGuest": {
    "fullName": "string (required)",
    "phone": "string (required)",
    "email": "string (optional, email)"
  },
  "roomTypes": [
    {
      "roomTypeId": "Guid",
      "rooms": [
        {
          "roomId": "Guid",
          "guests": [
            { "fullName": "string", "phone": "string", "email": "string" }
          ]
        }
      ]
    }
  ],
  "notes": "string (optional)"
}
```

Validation:

- `hotelId` required
- `checkInDate < checkOutDate` (ISO date strings)
- `primaryGuest.fullName`, `primaryGuest.phone` required
- At least one `roomTypes` item and one `rooms` item
- `depositAmount >= 0`, `discountAmount >= 0`
- Room availability verified (no overlapping bookings for chosen rooms)

Business Logic:

- Creates/attaches `PrimaryGuest` into `Guest` table from `primaryGuest`; sets `booking.primaryGuestId`.
- Adds nested `BookingRoomType` → `BookingRoom` → `BookingGuest`.
- Calculates `totalAmount` based on selected rooms and number of nights; applies `discountAmount`.
- `leftAmount = totalAmount - depositAmount`.
- `status = Pending`.
- Wrapped in a transaction (all-or-nothing).

Example Request:

```json
{
  "hotelId": "a1b2c3d4-e5f6-7890-1112-131415161718",
  "checkInDate": "2025-11-20",
  "checkOutDate": "2025-11-23",
  "depositAmount": 500000,
  "discountAmount": 100000,
  "primaryGuest": {
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "email": "guest@example.com"
  },
  "roomTypes": [
    {
      "roomTypeId": "11111111-2222-3333-4444-555555555555",
      "rooms": [
        {
          "roomId": "77777777-8888-9999-0000-aaaaaaaaaaaa",
          "guests": [
            {
              "fullName": "Guest 1",
              "phone": "0900000001",
              "email": "g1@example.com"
            },
            {
              "fullName": "Guest 2",
              "phone": "0900000002",
              "email": "g2@example.com"
            }
          ]
        },
        {
          "roomId": "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
          "guests": [
            {
              "fullName": "Guest 3",
              "phone": "0900000003",
              "email": "g3@example.com"
            }
          ]
        }
      ]
    }
  ],
  "notes": "Near elevator, late check-in"
}
```

Example Response (201 Created):

```json
{
  "isSuccess": true,
  "message": "Booking created",
  "data": {
    "id": "BOOKING_GUID",
    "hotelId": "a1b2c3d4-e5f6-7890-1112-131415161718",
    "status": "Pending",
    "checkInDate": "2025-11-20",
    "checkOutDate": "2025-11-23",
    "depositAmount": 500000,
    "discountAmount": 100000,
    "totalAmount": 1800000,
    "leftAmount": 1300000,
    "primaryGuest": {
      "id": "PRIMARY_GUEST_GUID",
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "email": "guest@example.com"
    },
    "roomTypes": [
      {
        "roomTypeId": "11111111-2222-3333-4444-555555555555",
        "rooms": [
          {
            "roomId": "77777777-8888-9999-0000-aaaaaaaaaaaa",
            "guests": [
              {
                "id": "GUEST_GUID_1",
                "fullName": "Guest 1",
                "phone": "0900000001",
                "email": "g1@example.com"
              },
              {
                "id": "GUEST_GUID_2",
                "fullName": "Guest 2",
                "phone": "0900000002",
                "email": "g2@example.com"
              }
            ]
          },
          {
            "roomId": "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
            "guests": [
              {
                "id": "GUEST_GUID_3",
                "fullName": "Guest 3",
                "phone": "0900000003",
                "email": "g3@example.com"
              }
            ]
          }
        ]
      }
    ],
    "callLogs": []
  }
}
```

Status Codes:

- 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict (room availability)

---

## UC-33 – Get Booking by Id

- URL: `GET /api/bookings/{id}`
- Path Params: `id` (Guid)
- Purpose: Retrieve full booking details.

Example Response (200 OK):

```json
{
  "isSuccess": true,
  "data": {
    "id": "BOOKING_GUID",
    "status": "Pending",
    "hotelId": "a1b2c3...",
    "checkInDate": "2025-11-20",
    "checkOutDate": "2025-11-23",
    "depositAmount": 500000,
    "discountAmount": 100000,
    "totalAmount": 1800000,
    "leftAmount": 1300000,
    "primaryGuest": {
      "id": "PRIMARY_GUEST_GUID",
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "email": "guest@example.com"
    },
    "roomTypes": [
      /* ... */
    ],
    "callLogs": [
      /* ... */
    ]
  }
}
```

Status Codes: 200 OK, 401 Unauthorized, 404 Not Found

---

## UC-32 – Log Call to Confirm Booking

- URL: `POST /api/bookings/{id}/call-log`
- Path Params: `id` (Guid)
- Purpose: Record a pre-stay confirmation call and result.

### Request Body (AddCallLogDto)

```json
{
  "callTime": "YYYY-MM-DDTHH:mm:ss",
  "result": "Success | Failed | NoAnswer",
  "notes": "string (optional)",
  "staffUserId": "Guid"
}
```

Validation:

- `callTime` required
- `result` required (enum `CallResult`)
- `staffUserId` required

Example Response (200 OK):

```json
{
  "isSuccess": true,
  "message": "Call log added",
  "data": {
    "id": "CALL_LOG_GUID",
    "callTime": "2025-11-19T09:30:00",
    "result": "Success",
    "notes": "Confirmed with guest",
    "staffUserId": "STAFF_USER_GUID"
  }
}
```

Status Codes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found

---

## UC-33 – Update Booking

- URL: `PUT /api/bookings/{id}`
- Path Params: `id` (Guid)
- Purpose: Update booking details and recompute totals.

### Request Body (UpdateBookingDto)

Partial update allowing these fields:

```json
{
  "checkInDate": "YYYY-MM-DD",
  "checkOutDate": "YYYY-MM-DD",
  "depositAmount": 0,
  "discountAmount": 0,
  "roomTypes": [
    {
      "roomTypeId": "Guid",
      "rooms": [
        {
          "roomId": "Guid",
          "guests": [
            { "fullName": "string", "phone": "string", "email": "string" }
          ]
        }
      ]
    }
  ],
  "notes": "string"
}
```

Validation:

- Same rules as create for provided fields
- Room availability revalidated

Business Logic:

- Recomputes `totalAmount` and `leftAmount`
- May adjust or reattach room/guest allocations
- Transactional update across related entities

Example Response (200 OK):

```json
{
  "isSuccess": true,
  "message": "Booking updated",
  "data": {
    "id": "BOOKING_GUID",
    "status": "Pending",
    "totalAmount": 2400000,
    "leftAmount": 1650000
  }
}
```

Status Codes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict (room availability)

---

## UC-33 – Cancel Booking & Handle Deposit

- URL: `DELETE /api/bookings/{id}`
- Path Params: `id` (Guid)
- Purpose: Cancel booking; record refund or deductions.

### Request Body (example)

```json
{
  "reason": "Guest cancelled",
  "refundAmount": 500000
}
```

Business Logic:

- Sets `status = Cancelled`
- Applies refund/deduction policy to deposit (implementation may vary by hotel policy)

Example Response (200 OK):

```json
{
  "isSuccess": true,
  "message": "Booking cancelled",
  "data": {
    "id": "BOOKING_GUID",
    "status": "Cancelled"
  }
}
```

Status Codes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found

---

## UC-34 – Room Map (Timeline)

- URL: `GET /api/bookings/room-map`
- Query Params:
  - `date` (string, `YYYY-MM-DD`, required) – day to view
  - `hotelId` (Guid, required)
- Purpose: For a given day and hotel, return each room’s availability timeline.

Response Data (per room):

```json
{
  "roomId": "Guid",
  "roomNumber": "string",
  "roomTypeId": "Guid",
  "roomTypeName": "string",
  "timeline": [
    {
      "start": "YYYY-MM-DDT00:00:00",
      "end": "YYYY-MM-DDT23:59:59",
      "status": "Available | Booked",
      "bookingId": null
    }
  ]
}
```

Notes:

- Current implementation returns a single full-day segment per room: `Booked` if any bookings exist that day, otherwise `Available`.
- For hour-level segments, extend to compute blocks using `checkInDate/checkOutDate` with time-of-day granularity.

Example Response (200 OK):

```json
{
  "isSuccess": true,
  "data": [
    {
      "roomId": "ROOM_GUID_1",
      "roomNumber": "101",
      "roomTypeId": "TYPE_GUID",
      "roomTypeName": "Deluxe",
      "timeline": [
        {
          "start": "2025-11-20T00:00:00",
          "end": "2025-11-21T00:00:00",
          "status": "Booked",
          "bookingId": null
        }
      ]
    },
    {
      "roomId": "ROOM_GUID_2",
      "roomNumber": "102",
      "roomTypeId": "TYPE_GUID",
      "roomTypeName": "Deluxe",
      "timeline": [
        {
          "start": "2025-11-20T00:00:00",
          "end": "2025-11-21T00:00:00",
          "status": "Available",
          "bookingId": null
        }
      ]
    }
  ]
}
```

Status Codes: 200 OK, 400 Bad Request, 401 Unauthorized

---

## Error Scenarios

- 400 Bad Request – Validation errors (missing required fields, invalid date ranges)
- 404 Not Found – Booking or Hotel not found
- 409 Conflict – Room is not available for requested dates
- 401 Unauthorized – Missing/invalid token

---

## Frontend Integration Notes (React + MUI)

- Use typed clients for DTOs to ensure proper data shapes.
- Validate inputs client-side (required fields, date ranges) to reduce server errors.
- Display `ApiResponse.errors` when `isSuccess = false`.
- Handle optimistic UI updates for create/update/cancel, and refresh Room Map after changes.

---

## Naming Suggestions (Consistency)

- Controller: `BookingsController`
- Methods: `Create`, `Get`, `Update`, `Cancel`, `AddCallLog`, `RoomMap`
