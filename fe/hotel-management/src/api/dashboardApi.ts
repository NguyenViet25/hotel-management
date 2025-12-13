import axios from "./axios";
import type { RoomStatusSummaryDto } from "./housekeepingApi";
import type { RevenueStatsDto } from "./revenueApi";

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
  errors?: string[] | null;
  meta?: unknown;
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

export interface KitchenDashboardSummary {
  pendingOrderItems: number;
  inProgressOrders: number;
}

export interface WaiterDashboardSummary {
  openDiningSessions: number;
  inProgressOrders: number;
}

export interface HousekeeperDashboardSummary {
  assignedActiveTasks: number;
  dirtyRoomsCount: number;
}

const dashboardApi = {
  async getAdminSummary(): Promise<ApiResponse<AdminDashboardSummary>> {
    const res = await axios.get(`/dashboard/admin/summary`);
    return res.data;
  },
  async getAdminRevenue(params: {
    hotelId?: string;
    fromDate?: string;
    toDate?: string;
    granularity?: "day" | "month";
    includeIssued?: boolean;
    includePaid?: boolean;
  }): Promise<ApiResponse<RevenueStatsDto>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.fromDate) qp.append("fromDate", params.fromDate);
    if (params.toDate) qp.append("toDate", params.toDate);
    if (params.granularity) qp.append("granularity", params.granularity);
    if (params.includeIssued !== undefined)
      qp.append("includeIssued", String(params.includeIssued));
    if (params.includePaid !== undefined)
      qp.append("includePaid", String(params.includePaid));
    const res = await axios.get(`/dashboard/admin/revenue?${qp.toString()}`);
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
  async getKitchenSummary(
    hotelId: string
  ): Promise<ApiResponse<KitchenDashboardSummary>> {
    const params = new URLSearchParams();
    params.append("hotelId", hotelId);
    const res = await axios.get(`/dashboard/kitchen/summary?${params}`);
    return res.data;
  },
  async getWaiterSummary(
    hotelId: string
  ): Promise<ApiResponse<WaiterDashboardSummary>> {
    const params = new URLSearchParams();
    params.append("hotelId", hotelId);
    const res = await axios.get(`/dashboard/waiter/summary?${params}`);
    return res.data;
  },
  async getHousekeeperSummary(
    hotelId: string
  ): Promise<ApiResponse<HousekeeperDashboardSummary>> {
    const params = new URLSearchParams();
    params.append("hotelId", hotelId);
    const res = await axios.get(`/dashboard/housekeeper/summary?${params}`);
    return res.data;
  },
};

export default dashboardApi;
