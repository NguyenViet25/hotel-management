import axios from "./axios";

export interface Minibar {
  id: string;
  hotelId: string;
  roomTypeId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MinibarCreate {
  hotelId: string;
  roomTypeId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MinibarUpdate {
  hotelId: string;
  roomTypeId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MinibarQueryParams {
  hotelId?: string;
  roomTypeId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data: T[];
  meta?: { total?: number; page?: number; pageSize?: number } | null;
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data: T;
}

const minibarApi = {
  async list(params: MinibarQueryParams = {}): Promise<ListResponse<Minibar>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.roomTypeId) qp.append("roomTypeId", params.roomTypeId);
    if (params.search) qp.append("search", params.search);
    if (params.page !== undefined) qp.append("page", String(params.page));
    if (params.pageSize !== undefined)
      qp.append("pageSize", String(params.pageSize));
    const res = await axios.get(`/minibars?${qp.toString()}`);
    return res.data;
  },

  async get(id: string): Promise<ItemResponse<Minibar>> {
    const res = await axios.get(`/minibars/${id}`);
    return res.data;
  },

  async create(payload: MinibarCreate): Promise<ItemResponse<Minibar>> {
    const res = await axios.post(`/minibars`, payload);
    return res.data;
  },

  async update(
    id: string,
    payload: MinibarUpdate
  ): Promise<ItemResponse<Minibar>> {
    const res = await axios.put(`/minibars/${id}`, payload);
    return res.data;
  },

  async remove(id: string): Promise<ItemResponse<boolean>> {
    const res = await axios.delete(`/minibars/${id}`);
    return res.data;
  },
};

export default minibarApi;