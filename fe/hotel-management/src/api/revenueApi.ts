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

export type RevenueQuery = {
  hotelId: string;
  fromDate?: string;
  toDate?: string;
  granularity?: "day" | "month";
  includeIssued?: boolean;
  includePaid?: boolean;
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
};

export default revenueApi;

