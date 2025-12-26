import axios from "./axios";
import type { ApiResponse, RoomStatusSummaryDto } from "./housekeepingApi";

export interface RoomDto {
  id: string; // GUID as string
  hotelId: string; // GUID as string
  roomTypeId: string; // GUID as string
  roomTypeName: string;
  number: string;
  floor: number;
  status: number;
}

export enum RoomStatus {
  Available = 0,
  Occupied = 1,
  Cleaning = 2,
  OutOfService = 3,
  Dirty = 4,
  Clean = 5,
  Maintenance = 6,
}

export function getRoomStatusString(status: number | RoomStatus): string {
  switch (status) {
    case RoomStatus.Available:
      return "Sẵn sàng";
    case RoomStatus.Occupied:
      return "Đang sử dụng";
    case RoomStatus.Cleaning:
      return "Đang dọn dẹp";
    case RoomStatus.OutOfService:
      return "Ngừng phục vụ";
    case RoomStatus.Dirty:
      return "Bẩn";
    case RoomStatus.Clean:
      return "Đã dọn sạch";
    case RoomStatus.Maintenance:
      return "Bảo trì";
    default:
      return "Unknown";
  }
}

export interface RoomsQueryParams {
  hotelId?: string;
  status?: string;
  floor?: number;
  typeId?: string;
  number?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateRoomRequest {
  hotelId?: string;
  number: string;
  floor: number;
  roomTypeId: string;
  status?: number;
}

export interface UpdateRoomRequest extends CreateRoomRequest {}

export interface ListResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

const roomsApi = {
  async getRooms(
    params: RoomsQueryParams = {}
  ): Promise<ListResponse<RoomDto>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.status) qp.append("status", params.status);
    if (params.floor !== undefined) qp.append("floor", String(params.floor));
    if (params.typeId) qp.append("roomTypeId", params.typeId);
    if (params.number) qp.append("search", params.number);
    qp.append("page", String(params.page ?? 1));
    qp.append("pageSize", String(params.pageSize ?? 10));

    const res = await axios.get(`/rooms?${qp.toString()}`);
    return res.data;
  },

  async getRoomById(id: string): Promise<ItemResponse<RoomDto>> {
    const res = await axios.get(`/rooms/${id}`);
    return res.data;
  },

  async createRoom(payload: CreateRoomRequest): Promise<ItemResponse<RoomDto>> {
    const res = await axios.post(`/rooms`, payload);
    return res.data;
  },

  async updateRoom(
    id: string,
    payload: UpdateRoomRequest
  ): Promise<ItemResponse<RoomDto>> {
    const res = await axios.put(`/rooms/${id}`, payload);
    return res.data;
  },

  async deleteRoom(
    id: string
  ): Promise<{ isSuccess: boolean; message: string | null }> {
    const res = await axios.delete(`/rooms/${id}`);
    return res.data;
  },

  async validateDelete(
    id: string
  ): Promise<{ isSuccess: boolean; message: string | null }> {
    // Optional endpoint; if not supported, server should enforce and return error on delete
    const res = await axios.get(`/rooms/${id}/can-delete`);
    return res.data;
  },

  async getRoomsInUseToday(): Promise<ApiResponse<RoomsInUseTodayDto>> {
    const res = await axios.get(`/rooms/in-use-today`);
    return res.data;
  },

  async getRoomsUsageSummaryByMonth(
    month: number,
    year: number
  ): Promise<ApiResponse<MonthlyUsageDaySummaryDto[]>> {
    const qp = new URLSearchParams();
    qp.append("month", month.toString());
    qp.append("year", year.toString());
    const res = await axios.get(
      `dashboard/rooms/usage-summary-by-month?${qp.toString()}`
    );
    return res.data;
  },
};

export default roomsApi;

export interface RoomsInUseTodayDto {
  date: string;
  summary: RoomStatusSummaryDto;
}

export function getOccupancyTier(summary: RoomStatusSummaryDto) {
  const total = summary.totalRooms || 0;
  const occupied = summary.occupiedRooms || 0;
  const remaining = Math.max(0, total - occupied);
  const remainingPercent = total > 0 ? (remaining / total) * 100 : 0;
  let tier = 0.25;
  if (remainingPercent > 40 && remainingPercent <= 80) tier = 0.5;
  else if (remainingPercent > 80) tier = 0.75;
  return tier;
}

export function computeOccupancyDemand(summary: RoomStatusSummaryDto) {
  const total = summary.totalRooms || 0;
  const occupied = summary.occupiedRooms || 0;
  const remaining = Math.max(0, total - occupied);
  const remainingPercent = total > 0 ? (remaining / total) * 100 : 0;
  const bookedPercent = total > 0 ? (occupied / total) * 100 : 0;
  let tier = "0-40";
  if (remainingPercent > 40 && remainingPercent <= 80) tier = "41-80";
  else if (remainingPercent > 80) tier = "81-100";
  const peakDay = bookedPercent >= 75;
  return {
    totalRooms: total,
    occupiedRooms: occupied,
    remainingRooms: remaining,
    remainingPercent,
    bookedPercent,
    tier,
    peakDay,
  };
}

export interface MonthlyUsageDaySummaryDto {
  date: string;
  totalRooms?: number;
  bookedRooms?: number;
  percentage?: number;
}

export function isPeakUsageDay(s: MonthlyUsageDaySummaryDto): boolean {
  const total = s.totalRooms ?? 0;
  const booked = s.bookedRooms ?? 0;
  const pct =
    s.percentage !== undefined
      ? s.percentage
      : total > 0
      ? (booked / total) * 100
      : 0;
  return pct >= 75;
}
