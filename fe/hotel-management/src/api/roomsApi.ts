import axios from "./axios";

export interface RoomDto {
  id: string;
  hotelId?: string;
  hotelName?: string;
  number: string;
  floor: number;
  typeId: string;
  typeName?: string;
  status: string; // e.g. Available | UnderMaintenance | OutOfService | TemporarilyUnavailable
  features?: string[];
  canDelete?: boolean;
}

export interface RoomsQueryParams {
  hotelId?: string;
  status?: string;
  floor?: number;
  typeId?: string;
  number?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateRoomRequest {
  hotelId?: string;
  number: string;
  floor: number;
  typeId: string;
  features?: string[];
}

export interface UpdateRoomRequest {
  number?: string;
  floor?: number;
  typeId?: string;
  status?: string;
  features?: string[];
}

export interface ListResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

const roomsApi = {
  async getRooms(params: RoomsQueryParams = {}): Promise<ListResponse<RoomDto>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.status) qp.append("status", params.status);
    if (params.floor !== undefined) qp.append("floor", String(params.floor));
    if (params.typeId) qp.append("typeId", params.typeId);
    if (params.number) qp.append("number", params.number);
    qp.append("page", String(params.page ?? 1));
    qp.append("pageSize", String(params.pageSize ?? 10));

    const res = await axios.get(`/admin/rooms?${qp.toString()}`);
    return res.data;
  },

  async getRoomById(id: string): Promise<ItemResponse<RoomDto>> {
    const res = await axios.get(`/admin/rooms/${id}`);
    return res.data;
  },

  async createRoom(payload: CreateRoomRequest): Promise<ItemResponse<RoomDto>> {
    const res = await axios.post(`/admin/rooms`, payload);
    return res.data;
  },

  async updateRoom(id: string, payload: UpdateRoomRequest): Promise<ItemResponse<RoomDto>> {
    const res = await axios.put(`/admin/rooms/${id}`, payload);
    return res.data;
  },

  async deleteRoom(id: string): Promise<{ isSuccess: boolean; message: string | null }> {
    const res = await axios.delete(`/admin/rooms/${id}`);
    return res.data;
  },

  async validateDelete(id: string): Promise<{ isSuccess: boolean; message: string | null }> {
    // Optional endpoint; if not supported, server should enforce and return error on delete
    const res = await axios.get(`/admin/rooms/${id}/can-delete`);
    return res.data;
  },
};

export default roomsApi;