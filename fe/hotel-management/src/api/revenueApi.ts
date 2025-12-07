import axios from "./axios";

export type RevenuePointDto = {
  date: string;
  total: number;
};

export type RevenueStatsDto = {
  total: number;
  count: number;
  points: RevenuePointDto[];
};

export type RevenueCategoryPointDto = {
  date: string;
  roomTotal: number;
  fnbTotal: number;
  otherTotal: number;
  discountTotal: number;
};

export type RevenueBreakdownDto = {
  roomTotal: number;
  fnbTotal: number;
  otherTotal: number;
  discountTotal: number;
  points: RevenueCategoryPointDto[];
};

export type RevenueQuery = {
  hotelId: string;
  fromDate?: string;
  toDate?: string;
  granularity?: "day" | "month";
  includeIssued?: boolean;
  includePaid?: boolean;
  sourceType?: number;
};

export type ApiResponse<T> = {
  isSuccess: boolean;
  message?: string | null;
  data: T;
};

const revenueApi = {
  async getRevenue(query: RevenueQuery): Promise<ApiResponse<RevenueStatsDto>> {
    const params = new URLSearchParams();
    params.append("hotelId", query.hotelId);
    if (query.fromDate) params.append("fromDate", query.fromDate);
    if (query.toDate) params.append("toDate", query.toDate);
    if (query.granularity) params.append("granularity", query.granularity);
    if (query.includeIssued !== undefined)
      params.append("includeIssued", String(query.includeIssued));
    if (query.includePaid !== undefined)
      params.append("includePaid", String(query.includePaid));
    const res = await axios.get(`/invoices/revenue?${params.toString()}`);
    return res.data;
  },
  async getBreakdown(
    query: RevenueQuery
  ): Promise<ApiResponse<RevenueBreakdownDto>> {
    const params = new URLSearchParams();
    params.append("hotelId", query.hotelId);
    if (query.fromDate) params.append("fromDate", query.fromDate);
    if (query.toDate) params.append("toDate", query.toDate);
    if (query.granularity) params.append("granularity", query.granularity);
    const res = await axios.get(
      `/invoices/revenue/breakdown?${params.toString()}`
    );
    return res.data;
  },
  async getDetails(
    query: RevenueQuery
  ): Promise<ApiResponse<RevenueDetailItemDto[]>> {
    const params = new URLSearchParams();
    params.append("hotelId", query.hotelId);
    if (query.fromDate) params.append("fromDate", query.fromDate);
    if (query.toDate) params.append("toDate", query.toDate);
    if (query.sourceType !== undefined)
      params.append("sourceType", String(query.sourceType));
    const res = await axios.get(
      `/invoices/revenue/details?${params.toString()}`
    );
    return res.data;
  },
};

export type RevenueDetailItemDto = {
  invoiceId: string;
  bookingId?: string;
  orderId?: string;
  createdAt: string;
  description: string;
  amount: number;
  sourceType: number;
};

export default revenueApi;
