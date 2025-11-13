import axios from "./axios";

export interface MenuGroupDto {
  id: string;
  name: string;
  shift: string; // e.g., Breakfast | Lunch | Dinner
}

export interface MenuItemDto {
  id: string;
  hotelId?: string;
  category: string;
  name: string;
  description?: string;
  unitPrice: number;
  imageUrl?: string;
  isActive?: boolean;
  status: number;
}

export interface MenusQueryParams {
  searchTerm?: string;
  status?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateMenuItemRequest {
  hotelId?: string;
  category: string;
  name: string;
  description?: string;
  unitPrice: number;
  imageUrl?: string;
  status?: number; // default 0 (Available)
  isActive?: boolean;
}

export interface UpdateMenuItemRequest {
  menuGroupId?: string;
  name?: string;
  description?: string;
  unitPrice?: number;
  portionSize?: string;
  imageUrl?: string;
  status?: string;
  isActive?: boolean;
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

const menusApi = {
  async getMenuItems(
    params: MenusQueryParams = {}
  ): Promise<ListResponse<MenuItemDto>> {
    const qp = new URLSearchParams();
    if (params.searchTerm) qp.append("searchTerm", params.searchTerm);
    if (params.status) qp.append("status", params.status);
    if (params.isActive !== undefined)
      qp.append("isActive", String(params.isActive));
    if (params.page !== undefined) qp.append("page", String(params.page));
    if (params.pageSize !== undefined)
      qp.append("pageSize", String(params.pageSize));

    const res = await axios.get(`/admin/menu?${qp.toString()}`);
    return res.data;
  },

  async getMenuGroups(): Promise<ListResponse<MenuGroupDto>> {
    const res = await axios.get(`/admin/menu/groups`);
    return res.data;
  },

  async createMenuItem(
    payload: CreateMenuItemRequest
  ): Promise<ItemResponse<MenuItemDto>> {
    const res = await axios.post(`/admin/menu`, payload);
    return res.data;
  },

  async updateMenuItem(
    id: string,
    payload: UpdateMenuItemRequest
  ): Promise<ItemResponse<MenuItemDto>> {
    const res = await axios.put(`/admin/menu/${id}`, payload);
    return res.data;
  },

  async deleteMenuItem(
    id: string
  ): Promise<{ isSuccess: boolean; message: string | null }> {
    const res = await axios.delete(`/admin/menu/${id}`);
    return res.data;
  },
};

export default menusApi;
