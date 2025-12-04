import axios from "./axios";

export enum EOrderStatus {
  Draft = 0,
  NeedConfirmed = 1,
  Confirmed = 2,
  InProgress = 3,
  Ready = 4,
  Completed = 5,
  Cancelled = 6,
}

export interface OrderItemInputDto {
  menuItemId: string;
  quantity: number; // 1..1000
}

export interface CreateOrderDto {
  bookingId?: string | null;
  hotelId?: string | null;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items?: OrderItemInputDto[];
  status?: number;
  isWalkIn?: boolean;
  guests?: number;
}

export interface OrdersQueryParams {
  hotelId?: string;
  status?: number;
  bookingId?: string;
  isWalkIn?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateOrderDto extends CreateOrderDto {
  id: string;
}

export interface AddOrderItemDto extends OrderItemInputDto {}

export interface UpdateOrderItemDto {
  quantity?: number;
  status?: number;
}

export interface ReplaceOrderItemDto {
  newMenuItemId: string;
  quantity?: number;
  reason?: string;
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
  status: number;
}

export interface OrderSummaryDto {
  id: string;
  hotelId: string;
  bookingId?: string;
  isWalkIn: boolean;
  customerName?: string;
  customerPhone?: string;
  status: number;
  notes?: string;
  createdAt: string; // ISO
  itemsCount: number;
  itemsTotal: number;
  promotionCode?: string;
  promotionValue?: number;
  guests?: number;
}

export interface OrderDetailsDto extends OrderSummaryDto {
  items: OrderItemDto[];
  itemHistories?: OrderItemHistoryDto[];
}

export interface OrderItemHistoryDto {
  id: string;
  oldOrderItemId: string;
  newOrderItemId: string;
  oldMenuItemId: string;
  newMenuItemId: string;
  oldMenuItemName: string;
  newMenuItemName: string;
  changedAt: string;
  userId?: string | null;
  reason?: string | null;
}

export interface ListResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

const ordersApi = {
  async listOrders(
    params: OrdersQueryParams = {}
  ): Promise<ListResponse<OrderSummaryDto>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.status) qp.append("status", params.status.toString());
    if (params.bookingId) qp.append("bookingId", params.bookingId);
    if (params.isWalkIn !== undefined)
      qp.append("isWalkIn", String(params.isWalkIn));
    if (params.search) qp.append("search", params.search);
    qp.append("page", String(params.page ?? 1));
    qp.append("pageSize", String(params.pageSize ?? 10));
    const res = await axios.get(`/orders?${qp.toString()}`);
    return res.data;
  },

  async getById(id: string): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.get(`/orders/${id}`);
    return res.data;
  },

  async createWalkIn(
    payload: CreateOrderDto
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.post(`/orders/walk-in`, payload);
    return res.data;
  },

  async createForBooking(
    payload: CreateOrderDto
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.post(`/orders/booking`, payload);
    return res.data;
  },

  async updateWalkIn(
    id: string,
    payload: UpdateOrderDto
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.put(`/orders/walk-in/${id}`, payload);
    return res.data;
  },

  async updateForBooking(
    id: string,
    payload: UpdateOrderDto
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.put(`/orders/booking/${id}`, payload);
    return res.data;
  },

  async addItem(
    orderId: string,
    payload: AddOrderItemDto
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.post(`/orders/${orderId}/items`, payload);
    return res.data;
  },

  async updateItem(
    orderId: string,
    itemId: string,
    payload: UpdateOrderItemDto
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.put(`/orders/${orderId}/items/${itemId}`, payload);
    return res.data;
  },

  async removeItem(
    orderId: string,
    itemId: string
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.delete(`/orders/${orderId}/items/${itemId}`);
    return res.data;
  },

  async replaceItem(
    orderId: string,
    itemId: string,
    payload: ReplaceOrderItemDto
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.post(
      `/orders/${orderId}/items/${itemId}/replace`,
      payload
    );
    return res.data;
  },

  async updateStatus(
    id: string,
    payload: { status: number; notes?: string }
  ): Promise<ItemResponse<OrderDetailsDto>> {
    const res = await axios.put(`/orders/${id}/status`, payload);
    return res.data;
  },

  async applyDiscount(
    orderId: string,
    payload: ApplyDiscountDto
  ): Promise<ItemResponse<number>> {
    const res = await axios.post(`/orders/${orderId}/apply-discount`, payload);
    return res.data;
  },
};

export default ordersApi;
