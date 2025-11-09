import axiosInstance from "./axios";

export type DayOfWeekPriceDto = {
  dayOfWeek: number; // 0=Sunday ... 6=Saturday
  price: number;
};

export type BulkDayOfWeekPriceDto = {
  dayPrices: DayOfWeekPriceDto[];
};

export type SetBasePriceDto = {
  hotelId: string;
  roomTypeId: string;
  price: number;
};

export type SetDayOfWeekPriceDto = {
  hotelId: string;
  roomTypeId: string;
  dayOfWeek: number; // 0=Sunday ... 6=Saturday
  price: number;
};

export type DateRangePriceDto = {
  hotelId: string;
  roomTypeId: string;
  startDate: string; // ISO date string, e.g. 2024-12-25
  endDate: string; // ISO date string
  price: number;
};

export const pricingApi = {
  async setBasePrice(payload: SetBasePriceDto): Promise<void> {
    await axiosInstance.post("/pricing/base", payload);
  },

  async setDayOfWeekPrice(payload: SetDayOfWeekPriceDto): Promise<void> {
    await axiosInstance.post("/pricing/day-of-week", payload);
  },

  async setBulkDayOfWeekPrices(
    hotelId: string,
    roomTypeId: string,
    dayPrices: DayOfWeekPriceDto[]
  ): Promise<void> {
    const body: BulkDayOfWeekPriceDto = { dayPrices };
    await axiosInstance.post(
      `/pricing/day-of-week/bulk?hotelId=${encodeURIComponent(
        hotelId
      )}&roomTypeId=${encodeURIComponent(roomTypeId)}`,
      body
    );
  },

  async createDateRangePrice(payload: DateRangePriceDto): Promise<void> {
    await axiosInstance.post("/pricing/date-range", payload);
  },

  async updateDateRangePrice(
    priceId: string,
    payload: Omit<DateRangePriceDto, "hotelId" | "roomTypeId"> & {
      hotelId: string;
      roomTypeId: string;
    }
  ): Promise<void> {
    await axiosInstance.put(
      `/pricing/date-range/${encodeURIComponent(priceId)}`,
      payload
    );
  },

  async deleteDateRangePrice(priceId: string): Promise<void> {
    await axiosInstance.delete(
      `/pricing/date-range/${encodeURIComponent(priceId)}`
    );
  },
};

export default pricingApi;
