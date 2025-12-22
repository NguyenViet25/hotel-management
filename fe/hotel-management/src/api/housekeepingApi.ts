import axios from "./axios";
import type { HousekeepingTaskDto } from "./housekeepingTasksApi";

export interface UpdateRoomStatusRequest {
  roomId: string;
  status: number;
  notes?: string;
}

export interface RoomWithStatusDto {
  id: string;
  number: string;
  floor: number;
  status: number;
  lastUpdated: string;
  roomTypeName: string;
}

export interface RoomStatusSummaryDto {
  totalRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  maintenanceRooms: number;
  occupiedRooms: number;
  outOfServiceRooms: number;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data?: T;
}

const housekeepingApi = {
  async updateRoomStatus(
    payload: UpdateRoomStatusRequest
  ): Promise<ApiResponse<{ id: string }>> {
    const res = await axios.put(`/room-status/update`, payload);
    return res.data;
  },

  async getAsync(taskId: string): Promise<ApiResponse<HousekeepingTaskDto>> {
    const res = await axios.get(`/housekeeping/tasks/${taskId}`);
    return res.data;
  },

  async getRoomsByStatus(
    hotelId: string,
    status?: number
  ): Promise<ApiResponse<RoomWithStatusDto[]>> {
    const qp = new URLSearchParams();
    if (status !== undefined) qp.append("status", String(status));
    const res = await axios.get(
      `/room-status/hotel/${hotelId}?${qp.toString()}`
    );
    return res.data;
  },

  async getSummary(
    hotelId: string
  ): Promise<ApiResponse<RoomStatusSummaryDto>> {
    const res = await axios.get(`/room-status/summary/${hotelId}`);
    return res.data;
  },
};

export default housekeepingApi;
