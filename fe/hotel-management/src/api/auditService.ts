import axios from "./axios";

// Types for Audit Log API
export interface AuditLogDto {
  id: string;
  timestamp: string;
  action: string;
  hotelId?: string;
  userId?: string;
  metadata?: any;
}

export interface AuditQueryDto {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  userId?: string;
  hotelId?: string;
  action?: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

const auditService = {
  getLogs: async (
    query: AuditQueryDto = {}
  ): Promise<ApiResponse<AuditLogDto[]>> => {
    const {
      page = 1,
      pageSize = 10,
      from,
      to,
      userId,
      hotelId,
      action,
    } = query;

    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (userId) params.append("userId", userId);
    if (hotelId) params.append("hotelId", hotelId);
    if (action) params.append("action", action);

    const response = await axios.get(`/admin/audit/logs?${params.toString()}`);
    return response.data;
  },
};

export default auditService;
