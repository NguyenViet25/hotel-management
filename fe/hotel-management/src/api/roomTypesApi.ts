import axios from "./axios";

export interface AmenityDto {
  id: string;
  name: string;
}

export interface RoomType {
  id: string; // GUID as string
  hotelId: string; // GUID as string
  hotelName: string;
  name: string;
  description: string;
  images: string[]; // List of image URLs
  roomCount: number;
  canDelete: boolean;
  priceFrom: number;
  priceTo: number;
  priceByDates?: PriceByDate[]; // optional, defaults to empty array if needed
}

export interface RoomTypeQueryParams {
  hotelId?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateRoomTypeRequest {
  hotelId: string; // UUID string
  capacity: number;
  name: string;
  description: string;
  priceFrom: number;
  priceTo: number;
  priceByDates?: PriceByDate[]; // optional, defaults to empty array if nee
}

// PriceByDate equivalent
export interface PriceByDate {
  date: Date;
  price: number;
}

// CreateRoomTypeDto equivalent
export interface CreateRoomTypeDto {}

export interface UpdateRoomTypeRequest extends CreateRoomTypeRequest {}

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

const roomTypesApi = {
  getRoomTypes: async (
    params: RoomTypeQueryParams = {}
  ): Promise<ListResponse<RoomType>> => {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.searchTerm) qp.append("searchTerm", params.searchTerm);
    qp.append("page", (params.page ?? 1).toString());
    qp.append("pageSize", (params.pageSize ?? 10).toString());

    const res = await axios.get(`/room-types?${qp.toString()}`);
    return res.data;
  },

  getRoomTypeById: async (id: string): Promise<ItemResponse<RoomType>> => {
    const res = await axios.get(`/room-types/${id}`);
    return res.data;
  },

  createRoomType: async (
    payload: CreateRoomTypeRequest
  ): Promise<ItemResponse<RoomType>> => {
    const res = await axios.post(`/room-types`, payload);
    return res.data;
  },

  updateRoomType: async (
    id: string,
    payload: UpdateRoomTypeRequest
  ): Promise<ItemResponse<RoomType>> => {
    const res = await axios.put(`/room-types/${id}`, payload);
    return res.data;
  },

  deleteRoomType: async (
    id: string
  ): Promise<{ isSuccess: boolean; message: string | null }> => {
    const res = await axios.delete(`/room-types/${id}`);
    return res.data;
  },

  validateDelete: async (
    id: string
  ): Promise<{ isSuccess: boolean; message: string | null }> => {
    const res = await axios.get(`/room-types/${id}/can-delete`);
    return res.data;
  },
};

export default roomTypesApi;
