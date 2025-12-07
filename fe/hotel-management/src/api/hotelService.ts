import axios from "./axios";

export interface Hotel {
  id: string;
  code: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface HotelListResponse {
  isSuccess: boolean;
  message: string | null;
  data: Hotel[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface HotelResponse {
  isSuccess: boolean;
  message: string | null;
  data: Hotel;
}

export interface HotelsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDir?: string;
}

export interface CreateHotelRequest {
  code: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  config?: Record<string, any>;
}

export interface UpdateHotelRequest {
  name?: string;
  address?: string;
  isActive?: boolean;
  phone?: string;
  email?: string;
}

export interface ChangeHotelStatusRequest {
  action: "pause" | "close" | "resume";
  reason: string;
  until?: string;
}

export interface HotelDefaultTimesDto {
  defaultCheckInTime?: string | null;
  defaultCheckOutTime?: string | null;
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
}

const hotelService = {
  getHotels: async (
    params: HotelsQueryParams = {}
  ): Promise<HotelListResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortDir) queryParams.append("sortDir", params.sortDir);

    const response = await axios.get(`/hotels?${queryParams.toString()}`);
    return response.data;
  },

  getHotelById: async (id: string): Promise<HotelResponse> => {
    const response = await axios.get(`/hotels/${id}`);
    return response.data;
  },

  createHotel: async (hotel: CreateHotelRequest): Promise<HotelResponse> => {
    const response = await axios.post("/hotels", hotel);
    return response.data;
  },

  updateHotel: async (
    id: string,
    hotel: UpdateHotelRequest
  ): Promise<HotelResponse> => {
    const response = await axios.put(`/hotels/${id}`, hotel);
    return response.data;
  },

  changeHotelStatus: async (
    id: string,
    statusRequest: ChangeHotelStatusRequest
  ): Promise<HotelResponse> => {
    const response = await axios.post(`/hotels/${id}/status`, statusRequest);
    return response.data;
  },

  getDefaultTimes: async (
    id: string
  ): Promise<ItemResponse<HotelDefaultTimesDto>> => {
    const res = await axios.get(`/hotels/${id}/default-times`);
    return res.data;
  },

  updateDefaultTimes: async (
    id: string,
    payload: HotelDefaultTimesDto
  ): Promise<ItemResponse<HotelDefaultTimesDto>> => {
    const res = await axios.put(`/hotels/${id}/default-times`, payload);
    return res.data;
  },

  getVat: async (id: string): Promise<ItemResponse<number>> => {
    const res = await axios.get(`/hotels/${id}/vat`);
    return res.data;
  },

  updateVat: async (id: string, vat: number): Promise<ItemResponse<any>> => {
    const res = await axios.put(`/hotels/${id}/vat`, { VAT: vat });
    return res.data;
  },
};

export default hotelService;
