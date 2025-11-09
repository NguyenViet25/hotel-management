import axios from "./axios";

export interface Hotel {
  id: string;
  code: string;
  name: string;
  address: string;
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
  config?: Record<string, any>;
}

export interface UpdateHotelRequest {
  name?: string;
  address?: string;
  isActive?: boolean;
}

export interface ChangeHotelStatusRequest {
  action: "pause" | "close" | "resume";
  reason: string;
  until?: string;
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

    const response = await axios.get(`/admin/hotels?${queryParams.toString()}`);
    return response.data;
  },

  getHotelById: async (id: string): Promise<HotelResponse> => {
    const response = await axios.get(`/admin/hotels/${id}`);
    return response.data;
  },

  createHotel: async (hotel: CreateHotelRequest): Promise<HotelResponse> => {
    const response = await axios.post("/admin/hotels", hotel);
    return response.data;
  },

  updateHotel: async (
    id: string,
    hotel: UpdateHotelRequest
  ): Promise<HotelResponse> => {
    const response = await axios.put(`/admin/hotels/${id}`, hotel);
    return response.data;
  },

  changeHotelStatus: async (
    id: string,
    statusRequest: ChangeHotelStatusRequest
  ): Promise<HotelResponse> => {
    const response = await axios.post(
      `/admin/hotels/${id}/status`,
      statusRequest
    );
    return response.data;
  },
};

export default hotelService;
