import axiosInstance from "./axios";

export type PricingQuoteItemDto = {
  date: string; // ISO date
  price: number;
};

export type PricingQuoteResponse = {
  items: PricingQuoteItemDto[];
  total: number;
};

export type ApiResponse<T> = {
  isSuccess: boolean;
  message?: string | null;
  data?: T;
  errors?: Record<string, string[]> | null;
};

export type GetPricingQuoteRequest = {
  roomTypeId: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
};

export const pricingApi = {
  async quote(
    payload: GetPricingQuoteRequest
  ): Promise<ApiResponse<PricingQuoteResponse>> {
    const params = new URLSearchParams();
    params.append("roomTypeId", payload.roomTypeId);
    params.append("checkInDate", payload.checkInDate);
    params.append("checkOutDate", payload.checkOutDate);
    const res = await axiosInstance.get(`/pricing/quote?${params.toString()}`);
    return res.data;
  },
};

export default pricingApi;
