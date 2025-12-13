import axios from "./axios";

export interface GuestDto {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  idCard: string;
  idCardFrontImageUrl?: string | null;
  idCardBackImageUrl?: string | null;
}

export interface GuestsQuery {
  name?: string;
  phone?: string;
  email?: string;
  idCard?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface ListResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data: T[];
  meta?: { total: number; page: number; pageSize: number };
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data: T;
}

export interface CreateGuestRequest {
  fullName: string;
  phone: string;
  idCard: string;
  email?: string;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
}

export interface UpdateGuestRequest {
  fullName?: string;
  phone?: string;
  idCard?: string;
  email?: string;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
}

const guestsApi = {
  list: async (params: GuestsQuery = {}): Promise<ListResponse<GuestDto>> => {
    const q = new URLSearchParams();
    if (params.name) q.append("name", params.name);
    if (params.phone) q.append("phone", params.phone);
    if (params.email) q.append("email", params.email);
    if (params.idCard) q.append("idCard", params.idCard);
    if (params.page) q.append("page", String(params.page));
    if (params.pageSize) q.append("pageSize", String(params.pageSize));
    if (params.sortBy) q.append("sortBy", params.sortBy);
    if (params.sortDir) q.append("sortDir", params.sortDir);
    const res = await axios.get(`/guests?${q.toString()}`);
    return res.data;
  },
  getById: async (id: string): Promise<ItemResponse<GuestDto>> => {
    const res = await axios.get(`/guests/${id}`);
    return res.data;
  },
  create: async (
    payload: CreateGuestRequest
  ): Promise<ItemResponse<GuestDto>> => {
    const res = await axios.post("/guests", payload);
    return res.data;
  },
  update: async (
    id: string,
    payload: UpdateGuestRequest
  ): Promise<ItemResponse<GuestDto>> => {
    const res = await axios.put(`/guests/${id}`, payload);
    return res.data;
  },
  isDuplicate: async (params: {
    phone?: string;
    idCard?: string;
    excludeId?: string;
  }): Promise<{
    isSuccess: boolean;
    isDuplicate: boolean;
    items: GuestDto[];
  }> => {
    const { phone, idCard, excludeId } = params || {};
    const items: GuestDto[] = [];
    if (phone) {
      const res = await guestsApi.list({ phone, page: 1, pageSize: 5 });
      if (res.isSuccess) items.push(...res.data);
    }
    if (idCard) {
      const res = await guestsApi.list({ idCard, page: 1, pageSize: 5 });
      if (res.isSuccess) {
        res.data.forEach((g) => {
          if (!items.find((x) => x.id === g.id)) items.push(g);
        });
      }
    }
    const filtered = excludeId
      ? items.filter((x) => x.id !== excludeId)
      : items;
    return {
      isSuccess: true,
      isDuplicate: filtered.length > 0,
      items: filtered,
    };
  },
};

export default guestsApi;
