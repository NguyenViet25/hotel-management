# Unit Tests Inventory

This document lists unit test function names, inputs, and expected outputs by controller. It serves as a quick reference for manual test documentation.

## RoomsController

| Test Name                      | Inputs                                                       | Expected Output                                        | Sample Input                                                                                                            | Sample Output                                       |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| List_ReturnsOk                 | `RoomsQueryDto` (status, hotelId, roomTypeId, floor, search) | `OkObjectResult` (`ApiResponse<List<RoomSummaryDto>>`) | `{ Status: "Available", HotelId: "00000000-0000-0000-0000-000000000001", RoomTypeId: null, Floor: 3, Search: "A" }`     | `200 OK, ApiResponse { IsSuccess: true, Data: [] }` |
| ListByType_ReturnsOk           | `Guid id`                                                    | `OkObjectResult`                                       | `{ id: "00000000-0000-0000-0000-000000000002" }`                                                                        | `200 OK, ApiResponse<List<RoomSummaryDto>>`         |
| Get_ReturnsNotFound_WhenFail   | `Guid id`                                                    | `NotFoundObjectResult`                                 | `{ id: "00000000-0000-0000-0000-000000000003" }`                                                                        | `404 NotFound, ApiResponse { IsSuccess: false }`    |
| Get_ReturnsOk_WhenSuccess      | `Guid id`                                                    | `OkObjectResult`                                       | `{ id: "00000000-0000-0000-0000-000000000004" }`                                                                        | `200 OK, ApiResponse<RoomDetailsDto>`               |
| Create_ReturnsOkOrBad          | `CreateRoomDto`                                              | `OkObjectResult` or `BadRequestObjectResult`           | `{ HotelId: "00000000-0000-0000-0000-000000000001", RoomTypeId: "00000000-0000-0000-0000-000000000010", Name: "101" }`  | `200 OK or 400 BadRequest`                          |
| Update_ReturnsOkOrBad          | `Guid id`, `UpdateRoomDto`                                   | `OkObjectResult` or `BadRequestObjectResult`           | `{ id: "00000000-0000-0000-0000-000000000005", Body: { Name: "101A" } }`                                                | `200 OK or 400 BadRequest`                          |
| Delete_ReturnsOkOrBad          | `Guid id`                                                    | `OkObjectResult` or `BadRequestObjectResult`           | `{ id: "00000000-0000-0000-0000-000000000006" }`                                                                        | `200 OK or 400 BadRequest`                          |
| SetOutOfService_ReturnsOkOrBad | `Guid id`, `SetOutOfServiceDto`                              | `OkObjectResult` or `BadRequestObjectResult`           | `{ id: "00000000-0000-0000-0000-000000000007", Body: { Reason: "Maintenance", From: "2025-12-01", To: "2025-12-03" } }` | `200 OK or 400 BadRequest`                          |

## OrdersController

| Test Name                                 | Inputs                                                            | Expected Output                              | Sample Input                                                                                              | Sample Output                                |
| ----------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| List_ReturnsOk                            | `OrdersQueryDto` (status, hotelId, page, pageSize)                | `OkObjectResult`                             | `{ Status: "InProgress", HotelId: "000...001", Page: 1, PageSize: 25 }`                                   | `200 OK, ApiResponse<List<OrderSummaryDto>>` |
| CreateForBooking_ReturnsOkOrBad           | `CreateBookingOrderDto`                                           | `OkObjectResult` or `BadRequestObjectResult` | `{ BookingId: "000...010", Items: [] }`                                                                   | `200 OK or 400 BadRequest`                   |
| UpdateForBooking_ReturnsOkOrBad           | `Guid id`, `UpdateOrderForBookingDto`                             | `OkObjectResult` or `BadRequestObjectResult` | `{ id: "000...011", Body: { Notes: "Update" } }`                                                          | `200 OK or 400 BadRequest`                   |
| AddItem_ReturnsOkOrBad                    | `Guid orderId`, `AddOrderItemDto`                                 | `OkObjectResult` or `BadRequestObjectResult` | `{ orderId: "000...012", Body: { MenuItemId: "000...099", Qty: 2 } }`                                     | `200 OK or 400 BadRequest`                   |
| UpdateItem_ReturnsOkOrBad                 | `Guid orderId`, `Guid itemId`, `UpdateOrderItemDto`               | `OkObjectResult` or `BadRequestObjectResult` | `{ orderId: "000...012", itemId: "000...013", Body: { Qty: 3 } }`                                         | `200 OK or 400 BadRequest`                   |
| RemoveItem_ReturnsOkOrBad                 | `Guid orderId`, `Guid itemId`                                     | `OkObjectResult` or `BadRequestObjectResult` | `{ orderId: "000...012", itemId: "000...014" }`                                                           | `200 OK or 400 BadRequest`                   |
| ReplaceItem_ReturnsOkOrBad                | `Guid orderId`, `Guid itemId`, `ReplaceOrderItemDto`              | `OkObjectResult` or `BadRequestObjectResult` | `{ orderId: "000...012", itemId: "000...014", Body: { MenuItemId: "000...222" } }`                        | `200 OK or 400 BadRequest`                   |
| ReplaceItem_PassesUserId_WhenClaimPresent | `Guid orderId`, `Guid itemId`, `ReplaceOrderItemDto` (user claim) | `OkObjectResult`                             | `{ orderId: "000...012", itemId: "000...014", Body: { MenuItemId: "000...333" }, Claim: NameIdentifier }` | `200 OK`                                     |

## MenuController

| Test Name                                         | Inputs                                   | Expected Output          | Sample Input                                            | Sample Output                            |
| ------------------------------------------------- | ---------------------------------------- | ------------------------ | ------------------------------------------------------- | ---------------------------------------- |
| GetMenuItems_ReturnsBadRequest_WhenHotelIdMissing | `MenuQueryDto`                           | `BadRequestObjectResult` | `{ Status: "Available" }`                               | `400 BadRequest`                         |
| GetMenuItems_ReturnsOk_WhenHotelIdPresent         | `MenuQueryDto` (status) with hotel claim | `OkObjectResult`         | `{ Status: "Available" }, Claim: hotelId="000...001"`   | `200 OK, ApiResponse<List<MenuItemDto>>` |
| CreateMenuItem_ReturnsOk                          | `CreateMenuItemDto`                      | `OkObjectResult`         | `{ HotelId: "000...001", Name: "Burger", Price: 9.99 }` | `200 OK, ApiResponse<MenuItemDto>`       |
| UpdateMenuItem_ReturnsOk                          | `Guid id`, `UpdateMenuItemDto`           | `OkObjectResult`         | `{ id: "000...321", Body: { Name: "Cheeseburger" } }`   | `200 OK, ApiResponse<MenuItemDto>`       |
| DeleteMenuItem_ReturnsOk                          | `Guid id`                                | `OkObjectResult`         | `{ id: "000...654" }`                                   | `200 OK`                                 |

## AuthController

| Test Name                            | Inputs                     | Expected Output                                    | Sample Input                               | Sample Output                                     |
| ------------------------------------ | -------------------------- | -------------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Login_ReturnsTwoFactor_WhenRequired  | `LoginRequestDto`          | `OkObjectResult` (`ApiResponse<LoginResponseDto>`) | `{ Username: "user", Password: "pass" }`   | `200 OK, ApiResponse { RequiresTwoFactor: true }` |
| Login_ReturnsUnauthorized_WhenLocked | `LoginRequestDto`          | `UnauthorizedObjectResult`                         | `{ Username: "locked", Password: "pass" }` | `401 Unauthorized`                                |
| Login_ReturnsOk_WhenTokenPresent     | `LoginRequestDto`          | `OkObjectResult`                                   | `{ Username: "user", Password: "pass" }`   | `200 OK, ApiResponse { Token: "jwt" }`            |
| Logout_ReturnsOk                     | none (user principal set)  | `OkObjectResult`                                   | `User: ClaimsIdentity()`                   | `200 OK`                                          |
| ForgotPassword_ReturnsOkOrNotFound   | `ForgotPasswordRequestDto` | `OkObjectResult` or `NotFoundObjectResult`         | `{ Email: "user@example.com" }`            | `200 OK or 404 NotFound`                          |
| ResetPassword_ReturnsOkOrBad         | `ResetPasswordRequestDto`  | `OkObjectResult` or `BadRequestObjectResult`       | `{ Token: "t", NewPassword: "new" }`       | `200 OK or 400 BadRequest`                        |

## InvoicesController

| Test Name                                | Inputs                        | Expected Output                              | Sample Input                        | Sample Output                           |
| ---------------------------------------- | ----------------------------- | -------------------------------------------- | ----------------------------------- | --------------------------------------- |
| List_ReturnsOk                           | `InvoiceFilterDto`            | `OkObjectResult`                             | `{ HotelId: "000...001", Page: 1 }` | `200 OK, ApiResponse<List<InvoiceDto>>` |
| Get_ReturnsOk                            | `Guid id`                     | `OkObjectResult`                             | `{ id: "000...777" }`               | `200 OK, ApiResponse<InvoiceDto>`       |
| Get_ReturnsNotFound_OnKeyNotFound        | `Guid id`                     | `NotFoundObjectResult`                       | `{ id: "000...778" }`               | `404 NotFound`                          |
| CreateWalkInInvoice_ReturnsOkOrBad       | `CreateWalkInInvoiceRequest`  | `OkObjectResult` or `BadRequestObjectResult` | `{ WalkInOrderId: "000...710" }`    | `200 OK or 400 BadRequest`              |
| CreateBookingInvoice_ReturnsOkOrNotFound | `CreateBookingInvoiceRequest` | `OkObjectResult` or `NotFoundObjectResult`   | `{ BookingId: "000...720" }`        | `200 OK or 404 NotFound`                |

## BookingsController

| Test Name                            | Inputs                                                  | Expected Output                                     | Sample Input                                                                                            | Sample Output                                                      |
| ------------------------------------ | ------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Create_ReturnsOk                     | `CreateBookingDto`                                      | `OkObjectResult`                                    | `{ HotelId: "000...001", GuestName: "Alice", Start: "2025-12-01", End: "2025-12-03" }`                  | `200 OK, ApiResponse<BookingDetailsDto>`                           |
| List_ReturnsOk                       | `BookingsQueryDto`                                      | `OkObjectResult`                                    | `{ HotelId: "000...001", Status: "Confirmed" }`                                                         | `200 OK, ApiResponse<List<BookingDetailsDto>>`                     |
| Get_ReturnsOk                        | `Guid id`                                               | `OkObjectResult`                                    | `{ id: "000...501" }`                                                                                   | `200 OK, ApiResponse<BookingDetailsDto>`                           |
| AddCallLog_ReturnsOk                 | `Guid id`, `AddCallLogDto`                              | `OkObjectResult`                                    | `{ id: "000...501", Body: { Message: "Follow-up" } }`                                                   | `200 OK`                                                           |
| Confirm_ReturnsOk                    | `Guid id`                                               | `OkObjectResult`                                    | `{ id: "000...501" }`                                                                                   | `200 OK`                                                           |
| Cancel_ReturnsOk                     | `Guid id`                                               | `OkObjectResult`                                    | `{ id: "000...501" }`                                                                                   | `200 OK`                                                           |
| RoomMap_ReturnsOk                    | `RoomMapQueryDto`                                       | `OkObjectResult`                                    | `{ HotelId: "000...001", Date: "2025-12-01" }`                                                          | `200 OK`                                                           |
| RoomAvailability_ReturnsOk           | `RoomAvailabilityQueryDto`                              | `OkObjectResult`                                    | `{ HotelId: "000...001", From: "2025-12-01", To: "2025-12-05" }`                                        | `200 OK`                                                           |
| RoomSchedule_ReturnsOk               | `Guid roomId`, `DateTime from`, `DateTime to`           | `OkObjectResult`                                    | `{ roomId: "000...010", From: "2025-12-01", To: "2025-12-02" }`                                         | `200 OK`                                                           |
| AddRoomToBooking_ReturnsOk           | `AddRoomToBooking`                                      | `OkObjectResult`                                    | `{ BookingId: "000...501", RoomId: "000...010" }`                                                       | `200 OK`                                                           |
| ChangeRoom_ReturnsOk                 | `Guid id`, `ChangeRoomDto`                              | `OkObjectResult`                                    | `{ id: "000...501", Body: { FromRoomId: "000...010", ToRoomId: "000...011" } }`                         | `200 OK`                                                           |
| ExtendStay_ReturnsOk_WithSuccessFlag | `Guid id`, `ExtendStayDto`                              | `OkObjectResult` (`ApiResponse`)                    | `{ id: "000...501", Body: { NewEndDate: "2025-12-05", DiscountCode: null } }`                           | `200 OK, ApiResponse { IsSuccess: true/false }`                    |
| CheckOut_ReturnsOk_WithSuccessFlag   | `Guid id`, `CheckoutRequestDto`                         | `OkObjectResult` (`ApiResponse<CheckoutResultDto>`) | `{ id: "000...501", Body: { Notes: "checkout" } }`                                                      | `200 OK, ApiResponse<CheckoutResultDto> { IsSuccess: true/false }` |
| AdditionalChargesPreview_ReturnsOk   | `Guid id`                                               | `OkObjectResult`                                    | `{ id: "000...501" }`                                                                                   | `200 OK`                                                           |
| RecordMinibar_ReturnsOk              | `Guid id`, `MinibarConsumptionDto`                      | `OkObjectResult`                                    | `{ id: "000...501", Body: { Items: [{ Name: "Soda", Qty: 2 }] } }`                                      | `200 OK`                                                           |
| UpdateGuestInRoom_ReturnsOk          | `Guid bookingRoomId`, `Guid guestId`, `UpdateGuestDto`  | `OkObjectResult`                                    | `{ bookingRoomId: "000...601", guestId: "000...602", Body: { Name: "Alice" } }`                         | `200 OK`                                                           |
| RemoveGuestFromRoom_ReturnsOk        | `Guid bookingRoomId`, `Guid guestId`                    | `OkObjectResult`                                    | `{ bookingRoomId: "000...601", guestId: "000...602" }`                                                  | `200 OK`                                                           |
| UpdateRoomDates_ReturnsOk            | `Guid bookingRoomId`, `UpdateBookingRoomDatesDto`       | `OkObjectResult`                                    | `{ bookingRoomId: "000...601", Body: { From: "2025-12-01", To: "2025-12-03" } }`                        | `200 OK`                                                           |
| UpdateRoomActualTimes_ReturnsOk      | `Guid bookingRoomId`, `UpdateBookingRoomActualTimesDto` | `OkObjectResult`                                    | `{ bookingRoomId: "000...601", Body: { CheckIn: "2025-12-01T10:00Z", CheckOut: "2025-12-03T12:00Z" } }` | `200 OK`                                                           |
| MoveGuest_ReturnsOk                  | `Guid bookingRoomId`, `Guid guestId`, `MoveGuestDto`    | `OkObjectResult`                                    | `{ bookingRoomId: "000...601", guestId: "000...602", Body: { ToRoomId: "000...011" } }`                 | `200 OK`                                                           |
| SwapGuests_ReturnsOk                 | `Guid bookingRoomId`, `Guid guestId`, `SwapGuestsDto`   | `OkObjectResult`                                    | `{ bookingRoomId: "000...601", guestId: "000...602", Body: { WithGuestId: "000...603" } }`              | `200 OK`                                                           |

## HotelsAdminController

| Test Name                            | Inputs                                        | Expected Output                            | Sample Input                                                                   | Sample Output            |
| ------------------------------------ | --------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------ |
| List_ReturnsForbid_WhenUserMissing   | `HotelsQueryDto`                              | `ForbidResult`                             | `{ Page: 1 }`                                                                  | `403 Forbid`             |
| List_ReturnsOk_WhenUserPresent       | `HotelsQueryDto` (+ `NameIdentifier`, `Role`) | `OkObjectResult`                           | `{ Page: 1 }, Claims: NameIdentifier, Role=Admin`                              | `200 OK, (items, total)` |
| Get_ReturnsOkOrNotFound              | `Guid id`                                     | `OkObjectResult` or `NotFoundObjectResult` | `{ id: "000...701" }`                                                          | `200 OK or 404 NotFound` |
| Create_ReturnsForbid_WhenUserMissing | `CreateHotelDto`                              | `ForbidResult`                             | `{ Code: "H", Name: "Hotel", Address: "Addr" }`                                | `403 Forbid`             |
| Update_ReturnsOkOrNotFound           | `Guid id`, `UpdateHotelDto`                   | `OkObjectResult` or `NotFoundObjectResult` | `{ id: "000...702", Body: { Name: "Hotel+", Address: "Addr", Active: true } }` | `200 OK or 404 NotFound` |
| ChangeStatus_ReturnsOkOrNotFound     | `Guid id`, `ChangeHotelStatusDto`             | `OkObjectResult` or `NotFoundObjectResult` | `{ id: "000...703", Body: { Action: "activate", Reason: "r" } }`               | `200 OK or 404 NotFound` |

## UsersAdminController

| Test Name                              | Inputs                                 | Expected Output                              | Sample Input                                                           | Sample Output                               |
| -------------------------------------- | -------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| List_ReturnsOk                         | `UsersQueryDto`                        | `OkObjectResult`                             | `{ Page: 1 }`                                                          | `200 OK, ApiResponse<List<UserSummaryDto>>` |
| ListHouseKeepers_ReturnsOk             | `UserByRoleQuery(Guid, "Housekeeper")` | `OkObjectResult`                             | `{ HotelId: "000...001", Role: "Housekeeper" }`                        | `200 OK`                                    |
| Get_ReturnsOkOrNotFound                | `Guid id`                              | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...801" }`                                                  | `200 OK or 404 NotFound`                    |
| Create_ReturnsCreated                  | `CreateUserDto`                        | `CreatedAtActionResult`                      | `{ Username: "user", Email: "u@e.com", FullName: "U", Phone: "0123" }` | `201 Created`                               |
| Update_ReturnsOkOrNotFound             | `Guid id`, `UpdateUserDto`             | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...802", Body: { FullName: "U+", Email: "u@e.com" } }`      | `200 OK or 404 NotFound`                    |
| Lock_ReturnsOkOrNotFound               | `Guid id`, `LockUserDto`               | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...803", Body: { Until: "2025-12-31" } }`                   | `200 OK or 404 NotFound`                    |
| Unlock_ReturnsOkOrNotFound             | `Guid id`, `LockUserDto`               | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...803", Body: { Until: "2025-12-31" } }`                   | `200 OK or 404 NotFound`                    |
| ResetPassword_ReturnsOkOrNotFound      | `Guid id`, `ResetPasswordAdminDto`     | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...804", Body: { NewPassword: "new" } }`                    | `200 OK or 404 NotFound`                    |
| AssignPropertyRole_ReturnsOkOrBad      | `Guid id`, `AssignPropertyRoleDto`     | `OkObjectResult` or `BadRequestObjectResult` | `{ id: "000...805", Body: { Role: "Manager" } }`                       | `200 OK or 400 BadRequest`                  |
| RemovePropertyRole_ReturnsOkOrNotFound | `Guid id`, `Guid propertyRoleId`       | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...805", propertyRoleId: "000...806" }`                     | `200 OK or 404 NotFound`                    |

## RoomTypesController

| Test Name                                 | Inputs                         | Expected Output                                     | Sample Input                                     | Sample Output                   |
| ----------------------------------------- | ------------------------------ | --------------------------------------------------- | ------------------------------------------------ | ------------------------------- |
| Create_ReturnsBadRequest_WhenModelInvalid | invalid `CreateRoomTypeDto`    | `BadRequestObjectResult`                            | `{ Name: "" }`                                   | `400 BadRequest`                |
| Create_ReturnsCreatedOrBad                | `CreateRoomTypeDto`            | `CreatedAtActionResult` or `BadRequestObjectResult` | `{ HotelId: "000...001", Name: "Deluxe" }`       | `201 Created or 400 BadRequest` |
| Update_ReturnsBadRequest_WhenModelInvalid | invalid `UpdateRoomTypeDto`    | `BadRequestObjectResult`                            | `{ Name: "" }`                                   | `400 BadRequest`                |
| Update_ReturnsOkOrBad                     | `Guid id`, `UpdateRoomTypeDto` | `OkObjectResult` or `BadRequestObjectResult`        | `{ id: "000...901", Body: { Name: "Deluxe+" } }` | `200 OK or 400 BadRequest`      |
| Delete_ReturnsOkOrBad                     | `Guid id`                      | `OkObjectResult` or `BadRequestObjectResult`        | `{ id: "000...902" }`                            | `200 OK or 400 BadRequest`      |
| GetById_ReturnsOkOrNotFound               | `Guid id`                      | `OkObjectResult` or `NotFoundObjectResult`          | `{ id: "000...903" }`                            | `200 OK or 404 NotFound`        |
| GetDetails_ReturnsOkOrNotFound            | `Guid id`                      | `OkObjectResult` or `NotFoundObjectResult`          | `{ id: "000...904" }`                            | `200 OK or 404 NotFound`        |
| GetAll_ReturnsOkOrBad                     | `RoomTypeQueryDto`             | `OkObjectResult` or `BadRequestObjectResult`        | `{ HotelId: "000...001" }`                       | `200 OK or 400 BadRequest`      |
| GetByHotel_ReturnsOkOrBad                 | `Guid hotelId`                 | `OkObjectResult` or `BadRequestObjectResult`        | `{ HotelId: "000...001" }`                       | `200 OK or 400 BadRequest`      |
| ValidateDelete_ReturnsOkOrBad             | `Guid id`                      | `OkObjectResult` or `BadRequestObjectResult`        | `{ id: "000...905" }`                            | `200 OK or 400 BadRequest`      |

## MediaController

| Test Name                           | Inputs                         | Expected Output                              | Sample Input                                            | Sample Output                              |
| ----------------------------------- | ------------------------------ | -------------------------------------------- | ------------------------------------------------------- | ------------------------------------------ |
| Upload_ReturnsOk_WhenServiceSuccess | `MediaUploadRequest` (file)    | `OkObjectResult`                             | `{ File: photo.jpg, ContentType: image/jpeg, Size: 3 }` | `200 OK, ApiResponse<MediaUploadResponse>` |
| Get_ReturnsOkOrNotFound             | `int id`                       | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: 1 }`                                             | `200 OK or 404 NotFound`                   |
| List_ReturnsOk                      | none (defaults)                | `OkObjectResult`                             | `{ Page: 1, PageSize: 25 }`                             | `200 OK, ApiResponse<List<MediaResponse>>` |
| Update_ReturnsOkOrBad               | `int id`, `MediaUpdateRequest` | `OkObjectResult` or `BadRequestObjectResult` | `{ id: 1, Body: { FileName: "newname.jpg" } }`          | `200 OK or 400 BadRequest`                 |
| Delete_ReturnsOkOrNotFound          | `int id`                       | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: 1 }`                                             | `200 OK or 404 NotFound`                   |

## DiningSessionController

| Test Name                         | Inputs                                    | Expected Output                              | Sample Input                                       | Sample Output              |
| --------------------------------- | ----------------------------------------- | -------------------------------------------- | -------------------------------------------------- | -------------------------- |
| CreateSession_ReturnsOkOrBad      | `CreateDiningSessionRequest`              | `OkObjectResult` or `BadRequestObjectResult` | `{ HotelId: "000...001", TableIds: ["000...T1"] }` | `200 OK or 400 BadRequest` |
| GetSession_ReturnsOkOrNotFound    | `Guid id`                                 | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...DS1" }`                              | `200 OK or 404 NotFound`   |
| GetSessions_ReturnsOk             | `Guid hotelId` (+ optional paging/status) | `OkObjectResult`                             | `{ HotelId: "000...001", Status: "Open" }`         | `200 OK`                   |
| UpdateSession_ReturnsOkOrNotFound | `Guid id`, `UpdateDiningSessionRequest`   | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...DS1", Body: { Notes: "Update" } }`   | `200 OK or 404 NotFound`   |
| EndSession_ReturnsOkOrNotFound    | `Guid id`                                 | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...DS1" }`                              | `200 OK or 404 NotFound`   |
| AttachTable_ReturnsOkOrBad        | `Guid sessionId`, `Guid tableId`          | `OkObjectResult` or `BadRequestObjectResult` | `{ sessionId: "000...DS1", tableId: "000...T1" }`  | `200 OK or 400 BadRequest` |
| DetachTable_ReturnsOkOrNotFound   | `Guid sessionId`, `Guid tableId`          | `OkObjectResult` or `NotFoundObjectResult`   | `{ sessionId: "000...DS1", tableId: "000...T1" }`  | `200 OK or 404 NotFound`   |

## ServiceRequestController

| Test Name                           | Inputs                                   | Expected Output                            | Sample Input                                         | Sample Output            |
| ----------------------------------- | ---------------------------------------- | ------------------------------------------ | ---------------------------------------------------- | ------------------------ |
| CreateRequest_ReturnsOk             | `CreateServiceRequestRequest`            | `OkObjectResult`                           | `{ SessionId: "000...DS1", Type: "Water" }`          | `200 OK`                 |
| UpdateRequest_ReturnsOkOrNotFound   | `Guid id`, `UpdateServiceRequestRequest` | `OkObjectResult` or `NotFoundObjectResult` | `{ id: "000...SR1", Body: { Status: "Completed" } }` | `200 OK or 404 NotFound` |
| GetRequest_ReturnsOkOrNotFound      | `Guid id`                                | `OkObjectResult` or `NotFoundObjectResult` | `{ id: "000...SR1" }`                                | `200 OK or 404 NotFound` |
| GetRequestsBySession_ReturnsOk      | `Guid sessionId` (+ paging)              | `OkObjectResult`                           | `{ SessionId: "000...DS1", Page: 1 }`                | `200 OK`                 |
| CompleteRequest_ReturnsOkOrNotFound | `Guid id`                                | `OkObjectResult` or `NotFoundObjectResult` | `{ id: "000...SR1" }`                                | `200 OK or 404 NotFound` |

## TableController

| Test Name                    | Inputs                                                                                        | Expected Output                              | Sample Input                                                                                  | Sample Output                            |
| ---------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| CreateTable_ReturnsOkOrBad   | `CreateTableRequest`                                                                          | `OkObjectResult` or `BadRequestObjectResult` | `{ HotelId: "000...001", Name: "T-01" }`                                                      | `200 OK or 400 BadRequest`               |
| UpdateTable_ReturnsOkOrBad   | `Guid id`, `UpdateTableRequest`                                                               | `OkObjectResult` or `BadRequestObjectResult` | `{ id: "000...T1", Body: { Name: "T-01A" } }`                                                 | `200 OK or 400 BadRequest`               |
| GetTable_ReturnsOkOrNotFound | `Guid id`                                                                                     | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...T1" }`                                                                          | `200 OK or 404 NotFound`                 |
| List_ReturnsOk               | `Guid hotelId`, `string? search`, `bool? isActive`, `int? status`, `int page`, `int pageSize` | `OkObjectResult`                             | `{ HotelId: "000...001", Search: null, IsActive: null, Status: null, Page: 1, PageSize: 50 }` | `200 OK, ApiResponse<TableListResponse>` |
| Delete_ReturnsOkOrNotFound   | `Guid id`                                                                                     | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...T1" }`                                                                          | `200 OK or 404 NotFound`                 |

## OrderItemStatusController

| Test Name                                     | Inputs                                                      | Expected Output                              | Sample Input                                                         | Sample Output                                      |
| --------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| GetPendingOrderItems_ReturnsOk                | `Guid hotelId`                                              | `OkObjectResult`                             | `{ HotelId: "000...001" }`                                           | `200 OK, ApiResponse<OrderItemStatusListResponse>` |
| GetPendingOrderItems_WithPagination_ReturnsOk | `Guid hotelId`, `int page`, `int pageSize`                  | `OkObjectResult`                             | `{ HotelId: "000...001", Page: 1, PageSize: 10 }`                    | `200 OK`                                           |
| GetOrderItemsByStatus_ReturnsOkOrBad          | `Guid hotelId`, `string status`, `int page`, `int pageSize` | `OkObjectResult` or `BadRequestObjectResult` | `{ HotelId: "000...001", Status: "Pending", Page: 1, PageSize: 10 }` | `200 OK or 400 BadRequest`                         |
| UpdateStatus_ReturnsOkOrBad                   | `Guid id`, `UpdateOrderItemStatusRequest`                   | `OkObjectResult` or `BadRequestObjectResult` | `{ id: "000...OI1", Body: { Status: "InProgress" } }`                | `200 OK or 400 BadRequest`                         |

## RoomStatusController

| Test Name                       | Inputs                                    | Expected Output                              | Sample Input                                     | Sample Output                                  |
| ------------------------------- | ----------------------------------------- | -------------------------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| UpdateRoomStatus_ReturnsOkOrBad | `UpdateRoomStatusRequest`                 | `OkObjectResult` or `BadRequestObjectResult` | `{ RoomId: "000...010", Status: "Clean" }`       | `200 OK or 400 BadRequest`                     |
| History_ReturnsOkOrNotFound     | `Guid roomId`, `int page`, `int pageSize` | `OkObjectResult` or `NotFoundObjectResult`   | `{ RoomId: "000...010", Page: 1, PageSize: 25 }` | `200 OK or 404 NotFound`                       |
| GetRoomsByStatus_ReturnsOk      | `Guid hotelId`, `RoomStatus? status`      | `OkObjectResult`                             | `{ HotelId: "000...001", Status: "Dirty" }`      | `200 OK, ApiResponse<List<RoomWithStatusDto>>` |
| Summary_ReturnsOk               | `Guid hotelId`                            | `OkObjectResult`                             | `{ HotelId: "000...001" }`                       | `200 OK, ApiResponse<RoomStatusSummaryDto>`    |

## HousekeepingTasksController

| Test Name                  | Inputs                               | Expected Output                              | Sample Input                                                         | Sample Output              |
| -------------------------- | ------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------- | -------------------------- |
| Create_ReturnsOkOrBad      | `CreateHousekeepingTaskRequest`      | `OkObjectResult` or `BadRequestObjectResult` | `{ HotelId: "000...001", RoomId: "000...010", Notes: "Deep clean" }` | `200 OK or 400 BadRequest` |
| List_ReturnsOk             | `ListHousekeepingTasksQuery`         | `OkObjectResult`                             | `{ HotelId: "000...001", Status: "Assigned" }`                       | `200 OK`                   |
| Assign_ReturnsOkOrBad      | `AssignHousekeeperRequest`           | `OkObjectResult` or `BadRequestObjectResult` | `{ TaskId: "000...HK1", AssignedToUserId: "000...U1" }`              | `200 OK or 400 BadRequest` |
| UpdateNotes_ReturnsOkOrBad | `UpdateHousekeepingTaskNotesRequest` | `OkObjectResult` or `BadRequestObjectResult` | `{ TaskId: "000...HK1", Notes: "Bring supplies" }`                   | `200 OK or 400 BadRequest` |
| Start_ReturnsOkOrBad       | `StartTaskRequest`                   | `OkObjectResult` or `BadRequestObjectResult` | `{ TaskId: "000...HK1", Notes: "Starting" }`                         | `200 OK or 400 BadRequest` |
| Complete_ReturnsOkOrBad    | `CompleteTaskRequest`                | `OkObjectResult` or `BadRequestObjectResult` | `{ TaskId: "000...HK1", Notes: "Done", EvidenceUrls: ["url"] }`      | `200 OK or 400 BadRequest` |

## AuditController

| Test Name                                       | Inputs                                   | Expected Output                 | Sample Input                                                    | Sample Output               |
| ----------------------------------------------- | ---------------------------------------- | ------------------------------- | --------------------------------------------------------------- | --------------------------- |
| Query_ReturnsForbid_WhenNoUser                  | `AuditQueryDto`                          | `ForbidResult`                  | `{ Page: 1 }`                                                   | `403 Forbid`                |
| Query_ReturnsOk_WhenUserPresent                 | `AuditQueryDto` (admin claim)            | `OkObjectResult`                | `{ Page: 1 }, Claims: NameIdentifier, Role=Admin`               | `200 OK, (items, total)`    |
| Query_ReturnsOk_ForManagerRole_WithIsAdminFalse | `AuditQueryDto` (manager claim)          | `OkObjectResult`                | `{ Page: 1 }, Claims: NameIdentifier, Role=Manager`             | `200 OK`                    |
| Query_ReturnsForbid_WhenInvalidUserIdClaim      | `AuditQueryDto` (invalid NameIdentifier) | `ForbidResult`                  | `{ Page: 1 }, Claims: NameIdentifier="not-a-guid"`              | `403 Forbid`                |
| Query_PassesPaginationMeta                      | `AuditQueryDto` (Page, PageSize)         | `OkObjectResult` (meta present) | `{ Page: 2, PageSize: 50 }, Claims: NameIdentifier, Role=Admin` | `200 OK, Meta { Total: n }` |

## ProfileController

| Test Name                         | Inputs                           | Expected Output                            | Sample Input                                                                 | Sample Output                     |
| --------------------------------- | -------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------- |
| Me_ReturnsUnauthorized_WhenNoUser | none                             | `UnauthorizedObjectResult`                 | `User: null`                                                                 | `401 Unauthorized`                |
| Me_ReturnsOkOrNotFound            | user claim                       | `OkObjectResult` or `NotFoundObjectResult` | `Claims: NameIdentifier`                                                     | `200 OK or 404 NotFound`          |
| Update_ReturnsOkOrFail            | `UpdateProfileDto` (user claim)  | `OkObjectResult`                           | `{ Email: "u@e.com", FullName: "U", Phone: "0123" }, Claims: NameIdentifier` | `200 OK, ApiResponse<ProfileDto>` |
| ChangePassword_ReturnsOkOrFail    | `ChangePasswordDto` (user claim) | `OkObjectResult`                           | `{ OldPassword: "old", NewPassword: "new" }, Claims: NameIdentifier`         | `200 OK`                          |

## DiscountCodesController

| Test Name                               | Inputs                                 | Expected Output                              | Sample Input                                                        | Sample Output                             |
| --------------------------------------- | -------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| List_ReturnsBadRequest_WhenNoHotelClaim | none                                   | `BadRequestObjectResult`                     | `Claims: none`                                                      | `400 BadRequest`                          |
| List_ReturnsOk_WhenHotelClaimPresent    | hotel claim                            | `OkObjectResult`                             | `Claims: hotelId="000...001"`                                       | `200 OK, ApiResponse<List<PromotionDto>>` |
| Get_ReturnsOkOrNotFound                 | `Guid id`                              | `OkObjectResult` or `NotFoundObjectResult`   | `{ id: "000...P1" }`                                                | `200 OK or 404 NotFound`                  |
| Create_ReturnsOkOrBad                   | `PromotionDto` (user claim)            | `OkObjectResult` or `BadRequestObjectResult` | `{ Code: "WINTER10", Percent: 10 }, Claims: NameIdentifier`         | `200 OK or 400 BadRequest`                |
| Update_ReturnsOkOrBad                   | `Guid id`, `PromotionDto` (user claim) | `OkObjectResult` or `BadRequestObjectResult` | `{ id: "000...P1", Body: { Percent: 15 } }, Claims: NameIdentifier` | `200 OK or 400 BadRequest`                |
| Delete_ReturnsOkOrBad                   | `Guid id` (user claim)                 | `OkObjectResult` or `BadRequestObjectResult` | `{ id: "000...P1" }, Claims: NameIdentifier`                        | `200 OK or 400 BadRequest`                |

## DashboardController

| Test Name                                   | Inputs                            | Expected Output          | Sample Input                                    | Sample Output    |
| ------------------------------------------- | --------------------------------- | ------------------------ | ----------------------------------------------- | ---------------- |
| AdminSummary_Forbid_WhenNoUser              | none                              | `ForbidResult`           | `User: null`                                    | `403 Forbid`     |
| AdminSummary_ReturnsOk                      | admin claim                       | `OkObjectResult`         | `Claims: NameIdentifier, Role=Admin`            | `200 OK`         |
| ManagerSummary_BadRequest_WhenNoHotelId     | manager claim, `hotelId=null`     | `BadRequestObjectResult` | `Claims: Role=Manager, hotelId=null`            | `400 BadRequest` |
| ManagerSummary_ReturnsOk                    | manager claim, `Guid hotelId`     | `OkObjectResult`         | `Claims: Role=Manager, hotelId="000...001"`     | `200 OK`         |
| FrontDeskSummary_BadRequest_WhenNoHotelId   | front-desk claim, `hotelId=null`  | `BadRequestObjectResult` | `Claims: Role=FrontDesk, hotelId=null`          | `400 BadRequest` |
| FrontDeskSummary_ReturnsOk                  | front-desk claim, `Guid hotelId`  | `OkObjectResult`         | `Claims: Role=FrontDesk, hotelId="000...001"`   | `200 OK`         |
| WaiterSummary_BadRequest_WhenNoHotelId      | waiter claim, `hotelId=null`      | `BadRequestObjectResult` | `Claims: Role=Waiter, hotelId=null`             | `400 BadRequest` |
| WaiterSummary_ReturnsOk                     | waiter claim, `Guid hotelId`      | `OkObjectResult`         | `Claims: Role=Waiter, hotelId="000...001"`      | `200 OK`         |
| KitchenSummary_BadRequest_WhenNoHotelId     | kitchen claim, `hotelId=null`     | `BadRequestObjectResult` | `Claims: Role=Kitchen, hotelId=null`            | `400 BadRequest` |
| KitchenSummary_ReturnsOk                    | kitchen claim, `Guid hotelId`     | `OkObjectResult`         | `Claims: Role=Kitchen, hotelId="000...001"`     | `200 OK`         |
| HousekeeperSummary_Forbid_WhenNoUser        | none                              | `ForbidResult`           | `User: null`                                    | `403 Forbid`     |
| HousekeeperSummary_BadRequest_WhenNoHotelId | housekeeper claim, `hotelId=null` | `BadRequestObjectResult` | `Claims: Role=Housekeeper, hotelId=null`        | `400 BadRequest` |
| HousekeeperSummary_ReturnsOk                | housekeeper claim, `Guid hotelId` | `OkObjectResult`         | `Claims: Role=Housekeeper, hotelId="000...001"` | `200 OK`         |

## CommonController

| Test Name                              | Inputs                             | Expected Output  | Sample Input   | Sample Output                   |
| -------------------------------------- | ---------------------------------- | ---------------- | -------------- | ------------------------------- |
| ListHotels_ReturnsOk_WithVariousCounts | mocked counts via `ListAllAsync()` | `OkObjectResult` | `{ Count: 5 }` | `200 OK, List<HotelSummaryDto>` |
