import axios from "./axios";

export enum TableStatus {
  Available = 0,
  InUse = 1,
  Reserved = 2,
  OutOfService = 3,
}

export interface TableDto {
  id: string;
  hotelId: string;
  name: string;
  capacity: number;
  status: TableStatus;
  isActive?: boolean;
}

export interface TablesQueryParams {
  hotelId?: string;
  status?: TableStatus | string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateTableRequest {
  hotelId: string;
  name: string;
  capacity: number;
  status?: TableStatus;
  isActive?: boolean;
}

export interface UpdateTableRequest {
  name?: string;
  capacity?: number;
  status?: TableStatus;
  isActive?: boolean;
}

export interface ListResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T[];
  meta?: { total?: number; page?: number; pageSize?: number } | null;
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

const tablesApi = {
  async listTables(
    params: TablesQueryParams = {}
  ): Promise<ListResponse<TableDto>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.status !== undefined) qp.append("status", String(params.status));
    if (params.isActive !== undefined)
      qp.append("isActive", String(params.isActive));
    if (params.search) qp.append("search", params.search);
    if (params.page !== undefined) qp.append("page", String(params.page));
    if (params.pageSize !== undefined)
      qp.append("pageSize", String(params.pageSize));
    const res = await axios.get(`/admin/tables?${qp.toString()}`);
    return res.data;
  },

  async createTable(
    payload: CreateTableRequest
  ): Promise<ItemResponse<TableDto>> {
    const res = await axios.post(`/admin/tables`, payload);
    return res.data;
  },

  async updateTable(
    id: string,
    payload: UpdateTableRequest
  ): Promise<ItemResponse<TableDto>> {
    const res = await axios.put(`/admin/tables/${id}`, payload);
    return res.data;
  },

  async deleteTable(id: string): Promise<ItemResponse<boolean>> {
    const res = await axios.delete(`/admin/tables/${id}`);
    return res.data;
  },
};

export default tablesApi;
