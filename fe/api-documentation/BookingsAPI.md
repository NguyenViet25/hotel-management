# Bookings API (ASP.NET Core)

- Base URL: `/api/admin/bookings`
- Auth: JWT, role `FrontDesk` required
- Format: JSON requests/responses
- Style: RESTful, plural resources, standard HTTP codes

## Standard Response Envelope

Most endpoints return an envelope:

```
ApiResponse<T> {
  IsSuccess: boolean,
  Message?: string,
  Data?: T,
  Errors?: { [field: string]: string[] },
  Meta?: object
}
```

Notes:

- Validation errors populate `Errors` and `IsSuccess=false`.
- `Message` carries user-facing status or error description.

## Data Models (Summary)

Key types returned by endpoints:

- `BookingDto`: `{ Id, HotelId, HotelName, RoomId, RoomNumber, RoomTypeName, StartDate, EndDate, Status, DepositAmount, CreatedAt, PrimaryGuest?, AdditionalGuests[], TotalGuests, CallLogs[], Payments[] }`
- `BookingSummaryDto`: compact booking view for lists
- `CallLogDto`: `{ Id, CallTime, Result, Notes?, StaffName? }`
- `PaymentDto`: `{ Id, Amount, Type, Timestamp }`
- `CheckoutResultDto`: `{ TotalPaid, Booking?, CheckoutTime? }`
- `ExtendStayResultDto`: `{ Booking, Price }` where `Price` comes from pricing service

Refer to service DTOs for full property sets: `be/HotelManagement.Services/Admin/Bookings/Dtos.cs`.

---

## UC‑31 Create Booking with Deposit

- URL: `POST /api/admin/bookings`
- Description: Create a booking with guest info, stay dates, room, and deposit.
- Auth: `FrontDesk`

### Request Body: `CreateBookingDto`

```
{
  HotelId: string (Guid),
  RoomId: string (Guid),
  StartDate: string (ISO-8601 DateTime),
  EndDate: string (ISO-8601 DateTime),
  PrimaryGuestId?: string (Guid),
  PrimaryGuest?: {
    FullName: string,
    Phone: string,
    Email?: string,
    IdCardImageUrl?: string
  },
  AdditionalGuests: [ { FullName, Phone, Email?, IdCardImageUrl? } ],
  DepositAmount: number,
  DepositPayment?: { Amount: number, Type: number },
  Notes?: string
}
```

Validation and business rules:

- `HotelId`, `RoomId`, `StartDate`, `EndDate`, `DepositAmount` required.
- Either `PrimaryGuestId` (existing) or `PrimaryGuest` (new) allowed.
- `EndDate` must be after `StartDate`.
- Room availability and pricing validated server-side.

### Responses

- 201 Created

```
ApiResponse<BookingDto>
```

- 400 Bad Request (validation/business rule failure)
- 401 Unauthorized (missing/invalid token)

### Example

Request:

```
POST /api/admin/bookings
Content-Type: application/json

{
  "HotelId": "a1d1b7c2-9d9e-4f3a-8c52-9f7e5d4a1111",
  "RoomId": "9c4f5e12-34ab-4a78-b2ef-2b5d2d9e2222",
  "StartDate": "2025-11-10T14:00:00Z",
  "EndDate": "2025-11-12T12:00:00Z",
  "PrimaryGuest": {
    "FullName": "Nguyen Van A",
    "Phone": "+84-912345678",
    "Email": "guest@example.com"
  },
  "AdditionalGuests": [],
  "DepositAmount": 500000,
  "DepositPayment": { "Amount": 500000, "Type": 0 },
  "Notes": "Window view requested"
}
```

Response (201):

```
{
  "IsSuccess": true,
  "Message": "Booking created",
  "Data": {
    "Id": "e7a6b1f9-6b48-4d3a-a228-6e61f3c53333",
    "HotelId": "a1d1b7c2-9d9e-4f3a-8c52-9f7e5d4a1111",
    "RoomId": "9c4f5e12-34ab-4a78-b2ef-2b5d2d9e2222",
    "RoomNumber": "402",
    "RoomTypeName": "Deluxe",
    "StartDate": "2025-11-10T14:00:00Z",
    "EndDate": "2025-11-12T12:00:00Z",
    "Status": 0,
    "DepositAmount": 500000,
    "CreatedAt": "2025-11-08T07:00:00Z",
    "PrimaryGuest": { "Id": "...", "FullName": "Nguyen Van A", "Phone": "+84-912345678" },
    "AdditionalGuests": [],
    "CallLogs": [],
    "Payments": [ { "Id": "...", "Amount": 500000, "Type": 0, "Timestamp": "2025-11-08T07:00:00Z" } ]
  }
}
```

---

## Get Booking by Id

- URL: `GET /api/admin/bookings/{id}`
- Description: Fetch full booking details.
- Path Params: `id` string (Guid)

### Responses

- 200 OK: `ApiResponse<BookingDto>`
- 404 Not Found

---

## List Bookings (filter + pagination)

- URL: `GET /api/admin/bookings`
- Description: List bookings with filters, paging, and sorting.

### Query Params: `BookingsQueryDto`

```
HotelId?: string (Guid)
Status?: number (enum BookingStatus)
StartDate?: string (ISO)
EndDate?: string (ISO)
GuestName?: string
RoomNumber?: string
Page?: number (default 1)
PageSize?: number (default 20)
SortBy?: string (default "createdAt")
SortDir?: string ("asc" | "desc", default "desc")
```

### Response

Note: Controller returns a custom wrapper for list responses.

```
{
  "Success": boolean,
  "Message": string,
  "Data": BookingSummaryDto[],
  "Meta": { "Total": number, "Page": number, "PageSize": number, "TotalPages": number }
}
```

- 400 Bad Request

---

## UC‑32 Create Call Confirmation Log

- URL: `POST /api/admin/bookings/{id}/call-logs`
- Description: Record a confirmation call and result (typically 1 day before).
- Path Params: `id` string (Guid)

### Request Body: `CreateCallLogDto`

```
{
  CallTime?: string (ISO; defaults to now),
  Result: number (enum CallResult),
  Notes?: string
}
```

### Responses

- 201 Created: `ApiResponse<CallLogDto>`
- 400 Bad Request
- 401 Unauthorized

---

## Get Call Logs

- URL: `GET /api/admin/bookings/{id}/call-logs`
- Description: Retrieve all call logs for a booking.

### Responses

- 200 OK: `ApiResponse<CallLogDto[]>`
- 404 Not Found

---

## UC‑33 Update Booking

- URL: `PUT /api/admin/bookings/{id}`
- Description: Update booking details including dates, room, guests, and deposit.

### Request Body: `UpdateBookingDto`

```
{
  RoomId?: string (Guid),
  StartDate?: string (ISO),
  EndDate?: string (ISO),
  PrimaryGuestId?: string (Guid),
  PrimaryGuest?: { FullName, Phone, Email?, IdCardImageUrl? },
  AdditionalGuests?: [ { ... } ],
  DepositAmount?: number,
  Notes?: string
}
```

### Responses

- 200 OK: `ApiResponse<BookingDto>`
- 400 Bad Request
- 401 Unauthorized

---

## Cancel Booking & Deposit Handling

- URL: `POST /api/admin/bookings/{id}/cancel`
- Description: Cancel booking; record refund or deduction from deposit.

### Request Body: `CancelBookingDto`

```
{
  Reason: string,
  RefundAmount: number,
  RefundType: number (enum PaymentType),
  DeductAmount?: number
}
```

### Responses

- 200 OK: `ApiResponse<BookingDto>`
- 400 Bad Request
- 401 Unauthorized

---

## UC‑36 Check‑in

- URL: `POST /api/admin/bookings/{id}/check-in`
- Description: Check-in booking; optionally update guest ID card images.

### Request Body: `CheckInDto`

```
{
  Guests: [ { GuestId: string (Guid), IdCardImageUrl?: string } ]
}
```

### Responses

- 200 OK: `ApiResponse<BookingDto>`
- 400 Bad Request
- 401 Unauthorized

---

## UC‑37 Change Room

- URL: `POST /api/admin/bookings/{id}/change-room`
- Description: Move booking to a different room.

### Request Body: `ChangeRoomDto`

```
{ NewRoomId: string (Guid) }
```

### Responses

- 200 OK: `ApiResponse<BookingDto>`
- 400 Bad Request
- 401 Unauthorized

---

## UC‑38 Extend Stay

- URL: `POST /api/admin/bookings/{id}/extend-stay`
- Description: Extend the booking; returns updated booking + pricing impact.

### Request Body: `ExtendStayDto`

```
{
  NewEndDate: string (ISO),
  DiscountCode?: string
}
```

### Responses

- 200 OK: `ApiResponse<ExtendStayResultDto>`
- 400 Bad Request
- 401 Unauthorized

---

## UC‑39 Check‑out

- URL: `POST /api/admin/bookings/{id}/check-out`
- Description: Checkout and reconciliation; optional final payment details.

### Request Body: `CheckoutRequestDto`

```
{
  EarlyCheckIn: boolean,
  LateCheckOut: boolean,
  DiscountCode?: string,
  FinalPayment?: { Amount: number, Type: number }
}
```

### Responses

- 200 OK: `ApiResponse<CheckoutResultDto>`
- 400 Bad Request
- 401 Unauthorized

---

## Notes / Business Logic

- All endpoints require a valid JWT; the system uses `ClaimTypes.NameIdentifier` to associate actions with the staff user.
- Date rules: `EndDate > StartDate`. Pricing and availability are validated server-side.
- Deposit handling: `Cancel` supports refund or deduction; payments tracked in `Payments[]`.
- Listing response differs from the standard `ApiResponse<T>` by returning `{ Success, Data: [], Meta }` for pagination.

## Controller & Action Naming Suggestions

- Current controller: `BookingsController` under `HotelManagement.Api.Controllers.Admin`.
- Suggested additions aligning with UC‑34 and UC‑35:
  - Room map / availability (UC‑34):
    - `GET /api/admin/bookings/room-availability` → `GetRoomAvailability(RoomAvailabilityQueryDto query)`
    - `GET /api/admin/bookings/rooms/{roomId}/schedule?from=...&to=...` → `GetRoomSchedule(Guid roomId, DateTime from, DateTime to)`
  - Group bookings (UC‑35):
    - Prefer a dedicated controller: `GroupBookingsController`
      - `POST /api/admin/group-bookings` → `CreateGroupBooking(CreateGroupBookingDto dto)`
      - `GET /api/admin/group-bookings/{id}` → `GetGroupBooking(Guid id)`
      - `GET /api/admin/group-bookings` → `ListGroupBookings(GroupBookingsQueryDto)`

## Error Responses (Examples)

Validation error:

```
{
  "IsSuccess": false,
  "Message": "Validation failed",
  "Errors": {
    "StartDate": ["StartDate must be before EndDate"],
    "RoomId": ["Room is not available for selected dates"]
  }
}
```

Unauthorized:

```
{
  "IsSuccess": false,
  "Message": "Invalid user token"
}
```
