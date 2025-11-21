import axios from "./axios";

export interface OrderItemStatusDto {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  status: string;
  updatedAt: string;
}

export interface OrderItemStatusListResponse {
  items: OrderItemStatusDto[];
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

export interface UpdateOrderItemStatusRequest {
  status: string;
}

const orderItemsApi = {
  async updateStatus(id: string, payload: UpdateOrderItemStatusRequest): Promise<ItemResponse<OrderItemStatusDto>> {
    const res = await axios.put(`/admin/order-items/${id}/status`, payload);
    return res.data;
  },
  async listPending(hotelId: string, page = 1, pageSize = 10): Promise<ListResponse<OrderItemStatusListResponse>> {
    const qp = new URLSearchParams();
    qp.append("hotelId", hotelId);
    qp.append("page", String(page));
    qp.append("pageSize", String(pageSize));
    const res = await axios.get(`/admin/order-items/pending?${qp.toString()}`);
    return res.data;
  },
  async listByStatus(hotelId: string, status: string, page = 1, pageSize = 10): Promise<ListResponse<OrderItemStatusListResponse>> {
    const qp = new URLSearchParams();
    qp.append("hotelId", hotelId);
    qp.append("status", status);
    qp.append("page", String(page));
    qp.append("pageSize", String(pageSize));
    const res = await axios.get(`/admin/order-items/by-status?${qp.toString()}`);
    return res.data;
  },
};

export default orderItemsApi;