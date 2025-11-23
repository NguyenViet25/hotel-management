import axios from "./axios";
import type { RoomStatusSummaryDto } from "./housekeepingApi";

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
  errors?: string[] | null;
  meta?: any;
}

export interface AdminDashboardSummary {
  totalHotels: number;
  totalUsers: number;
  auditCountLast24Hours: number;
}

export interface ManagerDashboardSummary {
  roomSummary: RoomStatusSummaryDto;
  dirtyRoomsCount: number;
  activeHousekeepingTaskCount: number;
  occupiedRoomsCount: number;
}

export interface FrontDeskDashboardSummary {
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
}

const dashboardApi = {
  async getAdminSummary(): Promise<ApiResponse<AdminDashboardSummary>> {
    const res = await axios.get(`/dashboard/admin/summary`);
    return res.data;
  },
  async getManagerSummary(
    hotelId: string
  ): Promise<ApiResponse<ManagerDashboardSummary>> {
    const params = new URLSearchParams();
    params.append("hotelId", hotelId);
    const res = await axios.get(`/dashboard/manager/summary?${params}`);
    return res.data;
  },
  async getFrontDeskSummary(
    hotelId: string
  ): Promise<ApiResponse<FrontDeskDashboardSummary>> {
    const params = new URLSearchParams();
    params.append("hotelId", hotelId);
    const res = await axios.get(`/dashboard/frontdesk/summary?${params}`);
    return res.data;
  },
};

export default dashboardApi;