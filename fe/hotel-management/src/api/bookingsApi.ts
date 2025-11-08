import axios from "./axios";

// Booking API client aligned with fe/api-documentation/BookingsAPI.md

export type BookingStatus = 0 | 1 | 2 | 3 | 4; // example: Pending=0, Confirmed=1, CheckedIn=2, Completed=3, Cancelled=4
export type PaymentType = 0 | 1 | 2 | 3; // example: Cash=0, Card=1, Transfer=2, Other=3
export type CallResult = 0 | 1 | 2; // example: Confirmed=0, NoAnswer=1, Cancelled=2

export interface GuestDto {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  idCardImageUrl?: string;
}

export interface PaymentDto {
  id: string;
  amount: number;
  type: PaymentType;
  timestamp: string; // ISO
}

export interface CallLogDto {
  id: string;
  callTime: string; // ISO
  result: CallResult;
  notes?: string;
  staffName?: string;
}

export interface BookingDto {
  id: string;
  hotelId: string;
  hotelName?: string;
  roomId: string;
  roomNumber?: string;
  roomTypeName?: string;
  startDate: string; // ISO
  endDate: string; // ISO
  status: BookingStatus;
  depositAmount: number;
  createdAt: string; // ISO
  primaryGuest?: GuestDto;
  additionalGuests?: GuestDto[];
  totalGuests?: number;
  callLogs?: CallLogDto[];
  payments?: PaymentDto[];
  notes?: string | null;
}

export interface BookingSummaryDto {
  id: string;
  hotelId: string;
  roomId: string;
  roomNumber?: string;
  roomTypeName?: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  depositAmount: number;
  createdAt: string;
  primaryGuestName?: string;
}

export interface CreateBookingDto {
  hotelId: string;
  roomId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  primaryGuestId?: string;
  primaryGuest?: GuestDto;
  additionalGuests?: GuestDto[];
  depositAmount: number;
  depositPayment?: { amount: number; type: PaymentType };
  notes?: string;
}

export interface UpdateBookingDto {
  roomId?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  primaryGuestId?: string;
  primaryGuest?: GuestDto;
  additionalGuests?: GuestDto[];
  depositAmount?: number;
  notes?: string;
}

export interface CancelBookingDto {
  reason: string;
  refundAmount: number;
  refundType: PaymentType;
  deductAmount?: number;
}

export interface CheckInDto {
  guests: { guestId: string; idCardImageUrl?: string }[];
}

export interface ChangeRoomDto {
  newRoomId: string;
}

export interface ExtendStayDto {
  newEndDate: string; // ISO
  discountCode?: string;
}

export interface CheckoutRequestDto {
  earlyCheckIn?: boolean;
  lateCheckOut?: boolean;
  discountCode?: string;
  finalPayment?: { amount: number; type: PaymentType };
}

export interface CheckoutResultDto {
  totalPaid: number;
  booking?: BookingDto;
  checkoutTime?: string; // ISO
}

export interface ExtendStayResultDto {
  booking: BookingDto;
  price: number;
}

export interface BookingsQueryDto {
  hotelId?: string;
  status?: BookingStatus;
  startDate?: string; // ISO
  endDate?: string; // ISO
  guestName?: string;
  roomNumber?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data?: T;
  errors?: Record<string, string[]> | null;
  meta?: any;
}

export interface ListEnvelope<T> {
  success: boolean;
  message?: string | null;
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages?: number };
}

// Compact interval used by room schedule timeline
export interface BookingIntervalDto {
  bookingId: string;
  start: string; // ISO
  end: string; // ISO
  status: BookingStatus;
  guestName?: string;
}

const bookingsApi = {
  async list(
    query: BookingsQueryDto = {}
  ): Promise<ListEnvelope<BookingSummaryDto>> {
    const qp = new URLSearchParams();
    if (query.hotelId) qp.append("hotelId", query.hotelId);
    if (query.status !== undefined) qp.append("status", String(query.status));
    if (query.startDate) qp.append("startDate", query.startDate);
    if (query.endDate) qp.append("endDate", query.endDate);
    if (query.guestName) qp.append("guestName", query.guestName);
    if (query.roomNumber) qp.append("roomNumber", query.roomNumber);
    qp.append("page", String(query.page ?? 1));
    qp.append("pageSize", String(query.pageSize ?? 10));
    if (query.sortBy) qp.append("sortBy", query.sortBy);
    if (query.sortDir) qp.append("sortDir", query.sortDir);
    const res = await axios.get(`/admin/bookings?${qp.toString()}`);
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<BookingDto>> {
    const res = await axios.get(`/admin/bookings/${id}`);
    return res.data;
  },

  async create(payload: CreateBookingDto): Promise<ApiResponse<BookingDto>> {
    const res = await axios.post(`/admin/bookings`, payload);
    return res.data;
  },

  async update(
    id: string,
    payload: UpdateBookingDto
  ): Promise<ApiResponse<BookingDto>> {
    const res = await axios.put(`/admin/bookings/${id}`, payload);
    return res.data;
  },

  async cancel(
    id: string,
    payload: CancelBookingDto
  ): Promise<ApiResponse<BookingDto>> {
    const res = await axios.post(`/admin/bookings/${id}/cancel`, payload);
    return res.data;
  },

  async checkIn(
    id: string,
    payload: CheckInDto
  ): Promise<ApiResponse<BookingDto>> {
    const res = await axios.post(`/admin/bookings/${id}/check-in`, payload);
    return res.data;
  },

  async checkOut(
    id: string,
    payload: CheckoutRequestDto
  ): Promise<ApiResponse<CheckoutResultDto>> {
    const res = await axios.post(`/admin/bookings/${id}/check-out`, payload);
    return res.data;
  },

  async changeRoom(
    id: string,
    payload: ChangeRoomDto
  ): Promise<ApiResponse<BookingDto>> {
    const res = await axios.post(`/admin/bookings/${id}/change-room`, payload);
    return res.data;
  },

  async extendStay(
    id: string,
    payload: ExtendStayDto
  ): Promise<ApiResponse<ExtendStayResultDto>> {
    const res = await axios.post(`/admin/bookings/${id}/extend-stay`, payload);
    return res.data;
  },

  async createCallLog(
    id: string,
    payload: { callTime?: string; result: CallResult; notes?: string }
  ): Promise<ApiResponse<CallLogDto>> {
    const res = await axios.post(`/admin/bookings/${id}/call-logs`, payload);
    return res.data;
  },

  async getCallLogs(id: string): Promise<ApiResponse<CallLogDto[]>> {
    const res = await axios.get(`/admin/bookings/${id}/call-logs`);
    return res.data;
  },

  async roomAvailability(params: {
    hotelId?: string;
    from?: string;
    to?: string;
    typeId?: string;
  }): Promise<ApiResponse<any>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.from) qp.append("from", params.from);
    if (params.to) qp.append("to", params.to);
    if (params.typeId) qp.append("typeId", params.typeId);
    const res = await axios.get(
      `/admin/bookings/room-availability?${qp.toString()}`
    );
    return res.data;
  },

  async roomSchedule(
    roomId: string,
    from: string,
    to: string
  ): Promise<ApiResponse<BookingIntervalDto[]>> {
    const res = await axios.get(
      `/admin/bookings/rooms/${roomId}/schedule?from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}`
    );
    return res.data;
  },
};

export default bookingsApi;
