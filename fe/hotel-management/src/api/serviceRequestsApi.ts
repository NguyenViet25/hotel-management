import axios from "./axios";

export interface ServiceRequestDto {
  id: string;
  hotelId: string;
  diningSessionId: string;
  requestType: string;
  description: string;
  status: string;
  assignedToUserId?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface CreateServiceRequestRequest {
  hotelId: string;
  diningSessionId: string;
  requestType: string;
  description: string;
}

export interface UpdateServiceRequestRequest {
  status?: string;
  assignedToUserId?: string;
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

export interface ServiceRequestListResponse {
  requests: ServiceRequestDto[];
  totalCount: number;
}

const serviceRequestsApi = {
  async create(payload: CreateServiceRequestRequest): Promise<ItemResponse<ServiceRequestDto>> {
    const res = await axios.post(`/admin/service-requests`, payload);
    return res.data;
  },
  async update(id: string, payload: UpdateServiceRequestRequest): Promise<ItemResponse<ServiceRequestDto>> {
    const res = await axios.put(`/admin/service-requests/${id}`, payload);
    return res.data;
  },
  async getById(id: string): Promise<ItemResponse<ServiceRequestDto>> {
    const res = await axios.get(`/admin/service-requests/${id}`);
    return res.data;
  },
  async listBySession(sessionId: string, page = 1, pageSize = 10): Promise<ListResponse<ServiceRequestListResponse>> {
    const qp = new URLSearchParams();
    qp.append("page", String(page));
    qp.append("pageSize", String(pageSize));
    const res = await axios.get(`/admin/service-requests/by-session/${sessionId}?${qp.toString()}`);
    return res.data;
  },
  async complete(id: string): Promise<ItemResponse<boolean>> {
    const res = await axios.post(`/admin/service-requests/${id}/complete`);
    return res.data;
  },
};

export default serviceRequestsApi;