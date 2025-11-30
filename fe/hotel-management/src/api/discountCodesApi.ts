import axiosInstance from "./axios";

export type DiscountCode = {
  id?: string;
  hotelId: string;
  code: string;
  description?: string | null;
  scope?: "booking" | "food";
  value: number;
  isActive: boolean;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
};

export type ApiResponse<T> = {
  isSuccess: boolean;
  message?: string | null;
  data?: T;
  errors?: Record<string, string[]> | null;
  meta?: any;
};

const discountCodesApi = {
  async list(): Promise<ApiResponse<DiscountCode[]>> {
    const res = await axiosInstance.get("/discount-codes");
    return res.data;
  },

  async get(id: string): Promise<ApiResponse<DiscountCode>> {
    const res = await axiosInstance.get(
      `/discount-codes/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  async create(payload: DiscountCode): Promise<ApiResponse<DiscountCode>> {
    const res = await axiosInstance.post("/discount-codes", payload);
    return res.data;
  },

  async update(
    id: string,
    payload: Partial<DiscountCode>
  ): Promise<ApiResponse<DiscountCode>> {
    const res = await axiosInstance.put(
      `/discount-codes/${encodeURIComponent(id)}`,
      payload
    );
    return res.data;
  },

  async remove(id: string): Promise<ApiResponse<unknown>> {
    const res = await axiosInstance.delete(
      `/discount-codes/${encodeURIComponent(id)}`
    );
    return res.data;
  },
};

export default discountCodesApi;
