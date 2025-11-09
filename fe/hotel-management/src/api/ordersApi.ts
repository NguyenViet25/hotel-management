import axios from "./axios";

// Orders API client aligned with OrdersAPI.md

export type OrderStatus = "Draft" | "Serving" | "Paid" | "Cancelled";
export type OrderItemStatus = "Pending" | "Prepared" | "Served" | "Voided";

export interface OrderItemInputDto {
  menuItemId: string;
  quantity: number; // 1..1000
}

export interface CreateWalkInOrderDto {
  hotelId: string;
  customerName: string;
  customerPhone?: string;
  items?: OrderItemInputDto[];
}

export interface CreateBookingOrderDto {
  hotelId: string;
  bookingId: string;
  notes?: string;
  items?: OrderItemInputDto[];
}

export interface OrdersQueryParams {
  hotelId?: string;
  status?: OrderStatus;
  bookingId?: string;
  isWalkIn?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateOrderDto {
  notes?: string;
  status?: OrderStatus;
}

export interface AddOrderItemDto extends OrderItemInputDto {}

export interface UpdateOrderItemDto {
  quantity?: number;
  status?: OrderItemStatus;
}

export interface ApplyDiscountDto {
  code: string;
}

export interface OrderItemDto {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  status: OrderItemStatus;
}

export interface OrderSummaryDto {
  id: string;
  hotelId: string;
  bookingId?: string | null;
  isWalkIn: boolean;
  customerName?: string | null;
  customerPhone?: string | null;
  status: OrderStatus;
  notes?: string | null;
  createdAt: string; // ISO
  itemsCount: number;
  itemsTotal: number;
}

export interface OrderDetailsDto extends OrderSummaryDto {
  items: OrderItemDto[];
}

export interface ListResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  } | null;
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

const ordersApi = {
  async listOrders(params: OrdersQueryParams = {}): Promise<ListResponse<OrderSummaryDto>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.status) qp.append("status", params.status);
    if (params.bookingId) qp.append("bookingId", params.bookingId);
    if (params.isWalkIn !== undefined) qp.append("isWalkIn", String(params.isWalkIn));
    if (params.search) qp.append("search", params.search);
    qp.append("page", String(params.page ?? 1));
    qp.append("pageSize", String(params.pageSize ?? 10));
    const res = await axios.get(`/admin/orders?${qp.toString()}`);
    return res.data;
  },

  async getById(id: string): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.get(`/admin/orders/${id}`);
    return res.data;
  },

  async createWalkIn(payload: CreateWalkInOrderDto): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.post(`/admin/orders/walk-in`, payload);
    return res.data;
  },

  async createForBooking(payload: CreateBookingOrderDto): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.post(`/admin/orders/booking`, payload);
    return res.data;
  },

  async update(id: string, payload: UpdateOrderDto): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.put(`/admin/orders/${id}`, payload);
    return res.data;
  },

  async addItem(orderId: string, payload: AddOrderItemDto): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.post(`/admin/orders/${orderId}/items`, payload);
    return res.data;
  },

  async updateItem(orderId: string, itemId: string, payload: UpdateOrderItemDto): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.put(`/admin/orders/${orderId}/items/${itemId}`, payload);
    return res.data;
  },

  async removeItem(orderId: string, itemId: string): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.delete(`/admin/orders/${orderId}/items/${itemId}`);
    return res.data;
  },

  async applyDiscount(orderId: string, payload: ApplyDiscountDto): Promise<ItemResponse<number>> {
    const res = await axios.post(`/admin/orders/${orderId}/apply-discount`, payload);
    return res.data;
  },
};

export default ordersApi;