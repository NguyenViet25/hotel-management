using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Bookings;

public interface IBookingsService
{
    Task<ApiResponse<BookingDetailsDto>> CreateAsync(CreateBookingDto dto);
    Task<ApiResponse<BookingDetailsDto>> GetByIdAsync(Guid id);
    Task<ApiResponse<BookingDetailsDto>> UpdateAsync(Guid id, UpdateBookingDto dto);
    Task<ApiResponse> CancelAsync(Guid id);
    Task<ApiResponse> ConfirmAsync(Guid id);
    Task<ApiResponse> CompleteAsync(Guid id);
    Task<ApiResponse<CallLogDto>> AddCallLogAsync(Guid bookingId, AddCallLogDto dto);
    Task<ApiResponse<List<RoomMapItemDto>>> GetRoomMapAsync(RoomMapQueryDto query);
    Task<ApiResponse<List<BookingDetailsDto>>> ListAsync(BookingsQueryDto query);
    Task<ApiResponse<List<BookingDetailsDto>>> ListActiveAsync(BookingsByHotelQueryDto query);
    Task<ApiResponse<List<CallLogDto>>> GetCallLogsAsync(Guid bookingId);
    Task<ApiResponse<object>> GetRoomAvailabilityAsync(RoomAvailabilityQueryDto query);
    Task<ApiResponse<List<BookingIntervalDto>>> GetRoomScheduleAsync(Guid roomId, DateTime from, DateTime to);
    Task<ApiResponse<string>> GetCurrentBookingIdAsync(Guid roomId);
    Task<ApiResponse<List<RoomStayHistoryDto>>> GetRoomHistoryAsync(Guid roomId, DateTime? from, DateTime? to);
    Task<ApiResponse> AddRoomToBookingAsync(Guid bookingRoomTypeId, Guid roomId);
    Task<ApiResponse> CheckInAsync(CheckInDto dto);
    Task<ApiResponse<BookingDetailsDto>> ChangeRoomAsync(Guid bookingRoomId, Guid newRoomId);
    Task<ApiResponse> ExtendStayAsync(Guid bookingRoomId, DateTime newEndDate, string? discountCode);
    Task<ApiResponse<CheckoutResultDto>> CheckOutAsync(Guid bookingId, CheckoutRequestDto dto);
    Task<ApiResponse<AdditionalChargesDto>> GetAdditionalChargesPreviewAsync(Guid bookingId);
    Task<ApiResponse> RecordMinibarConsumptionAsync(Guid bookingId, MinibarConsumptionDto dto);
    Task<ApiResponse> UpdateGuestInRoomAsync(Guid bookingRoomId, Guid guestId, UpdateGuestDto dto);
    Task<ApiResponse> RemoveGuestFromRoomAsync(Guid bookingRoomId, Guid guestId);
    Task<ApiResponse<BookingDetailsDto>> UpdateRoomDatesAsync(Guid bookingRoomId, DateTime startDate, DateTime endDate);
    Task<ApiResponse<BookingDetailsDto>> UpdateRoomActualTimesAsync(Guid bookingRoomId, DateTime? actualCheckInAt, DateTime? actualCheckOutAt);
    Task<ApiResponse<BookingDetailsDto>> MoveGuestAsync(Guid bookingRoomId, Guid guestId, Guid targetBookingRoomId);
    Task<ApiResponse<BookingDetailsDto>> SwapGuestsAsync(Guid bookingRoomId, Guid guestId, Guid targetBookingRoomId, Guid targetGuestId);

    Task<ApiResponse<CheckoutResultDto>> AddBookingInvoiceAsync(Guid bookingId, CheckoutRequestDto dto);
    Task<ApiResponse<List<PeakDayDto>>> GetPeakDaysAsync(PeakDaysQueryDto query);
    Task<ApiResponse<NoShowCancelResultDto>> CancelNoShowsAsync(NoShowCancelRequestDto request);
    Task<ApiResponse<EarlyCheckoutFeeResponseDto>> CalculateEarlyCheckoutFeeAsync(Guid bookingId, EarlyCheckoutFeeRequestDto dto);
}
