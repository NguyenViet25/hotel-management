import axios from "./axios";
import type { GuestDto } from "./guestsApi";
import type { BookingSummaryDto } from "./bookingsApi";
import type { OrderSummaryDto } from "./ordersApi";

export interface CustomerDetailsDto {
  customer: GuestDto;
  bookings: BookingSummaryDto[];
  orders: OrderSummaryDto[];
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data: T;
}

const customersApi = {
  async getDetails(id: string): Promise<ItemResponse<CustomerDetailsDto>> {
    const res = await axios.get(`/customers/${id}`);
    return res.data;
  },
};

export default customersApi;

