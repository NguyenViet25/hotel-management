import axios from "./axios";

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

const dashboardApi = {
  async getAdminSummary(): Promise<ApiResponse<AdminDashboardSummary>> {
    const res = await axios.get(`/dashboard/admin/summary`);
    return res.data;
  },
};

export default dashboardApi;