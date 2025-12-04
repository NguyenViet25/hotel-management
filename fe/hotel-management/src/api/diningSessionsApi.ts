import axios from "./axios";
import type { OrderDetailsDto } from "./ordersApi";

export interface SessionTableDto {
  tableId: string;
  tableName: string;
  capacity: number;
  attachedAt: string;
}

export interface DiningSessionDto {
  id: string;
  hotelId: string;
  waiterUserId?: string | null;
  waiterName?: string | null;
  startedAt: string;
  endedAt?: string | null;
  status: string;
  notes?: string | null;
  totalGuests: number;
  tables: SessionTableDto[];
}

export interface CreateDiningSessionRequest {
  hotelId: string;
  waiterUserId?: string;
  startedAt?: string;
  notes?: string;
  totalGuests?: number;
}

export interface UpdateDiningSessionRequest {
  waiterUserId?: string;
  status?: string;
  notes?: string;
  totalGuests?: number;
  startedAt?: string;
}

export interface DiningSessionListResponse {
  sessions: DiningSessionDto[];
  totalCount: number;
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

export interface ListResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

const diningSessionsApi = {
  async createSession(
    payload: CreateDiningSessionRequest
  ): Promise<ItemResponse<DiningSessionDto>> {
    const res = await axios.post(`/dining-sessions`, payload);
    return res.data;
  },
  async getSession(id: string): Promise<ItemResponse<DiningSessionDto>> {
    const res = await axios.get(`/dining-sessions/${id}`);
    return res.data;
  },
  async getSessions(params: {
    hotelId: string;
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<ListResponse<DiningSessionListResponse>> {
    const qp = new URLSearchParams();
    qp.append("hotelId", params.hotelId);
    if (params.page) qp.append("page", String(params.page));
    if (params.pageSize) qp.append("pageSize", String(params.pageSize));
    if (params.status) qp.append("status", params.status);
    const res = await axios.get(`/dining-sessions?${qp.toString()}`);
    return res.data;
  },
  async updateSession(
    id: string,
    payload: UpdateDiningSessionRequest
  ): Promise<ItemResponse<DiningSessionDto>> {
    const res = await axios.put(`/dining-sessions/${id}`, payload);
    return res.data;
  },
  async endSession(id: string): Promise<ItemResponse<boolean>> {
    const res = await axios.post(`/dining-sessions/${id}/end`);
    return res.data;
  },
  async assignOrder(
    sessionId: string,
    orderId: string
  ): Promise<ItemResponse<boolean>> {
    const res = await axios.post(
      `/dining-sessions/${sessionId}/orders/${orderId}`
    );
    return res.data;
  },
  async attachTable(
    sessionId: string,
    tableId: string
  ): Promise<ItemResponse<boolean>> {
    const res = await axios.post(
      `/dining-sessions/${sessionId}/tables/${tableId}`
    );
    return res.data;
  },
  async detachTable(
    sessionId: string,
    tableId: string
  ): Promise<ItemResponse<boolean>> {
    const res = await axios.delete(
      `/dining-sessions/${sessionId}/tables/${tableId}`
    );
    return res.data;
  },
  async deleteSession(id: string): Promise<ItemResponse<boolean>> {
    const res = await axios.delete(`/dining-sessions/${id}`);
    return res.data;
  },
  async updateTables(
    id: string,
    payload: { attachTableIds?: string[]; detachTableIds?: string[] }
  ): Promise<ItemResponse<boolean>> {
    const res = await axios.put(`/dining-sessions/${id}/tables`, payload);
    return res.data;
  },
  async getOrderBySession(
    sessionId: string
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.get(
      `/dining-sessions/order/by-session/${sessionId}`
    );
    return res.data;
  },
  async getOrderByTable(
    tableId: string
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.get(`/dining-sessions/order/by-table/${tableId}`);
    return res.data;
  },
  async getTablesBySession(
    sessionId: string
  ): Promise<ListResponse<SessionTableDto[]>> {
    const res = await axios.get(`/dining-sessions/${sessionId}/tables`);
    return res.data;
  },
};

export default diningSessionsApi;
