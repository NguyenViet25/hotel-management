import axios from "./axios";

export interface InvoiceLineDto {
  id: string;
  description: string;
  amount: number;
  sourceType: string | number;
  sourceId?: string;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  hotelId: string;
  bookingId?: string;
  orderId?: string;
  guestId?: string;
  isWalkIn: boolean;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  vatIncluded: boolean;
  pdfUrl?: string;
  status: string | number;
  statusName?: string;
  notes?: string;
  createdAt: string;
  issuedAt?: string;
  paidAt?: string;
  lines: InvoiceLineDto[];
  additionalAmount?: number;
  additionalNotes?: string;
  promotionCode?: string;
  promotionValue?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface ListPagedResponse<T> {
  isSuccess: boolean;
  message: string;
  data: PagedResult<T>;
}

export interface ItemResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface InvoiceFilterParams {
  hotelId?: string;
  bookingId?: string;
  orderId?: string;
  guestId?: string;
  status?: string | number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateWalkInInvoiceRequest {
  orderId: string;
  discountCode?: string;
  promotionCode?: string;
  promotionValue?: number;
  additionalAmount?: number;
  additionalNotes?: string;
}

export interface CreateBookingInvoiceRequest {
  bookingId: string;
  discountCode?: string;
  promotionCode?: string;
  promotionValue?: number;
  finalPayment?: { amount: number; type: number };
  checkoutTime?: string;
  notes?: string;
  additionalNotes?: string;
  additionalAmount?: number;
  additionalBookingAmount?: number;
  totalAmount?: number;
}

const invoicesApi = {
  async list(
    params: InvoiceFilterParams = {}
  ): Promise<ListPagedResponse<InvoiceDto>> {
    const qp = new URLSearchParams();
    if (params.hotelId) qp.append("hotelId", params.hotelId);
    if (params.bookingId) qp.append("bookingId", params.bookingId);
    if (params.orderId) qp.append("orderId", params.orderId);
    if (params.guestId) qp.append("guestId", params.guestId);
    if (params.status !== undefined) qp.append("status", String(params.status));
    if (params.fromDate) qp.append("fromDate", params.fromDate);
    if (params.toDate) qp.append("toDate", params.toDate);
    qp.append("page", String(params.page ?? 1));
    qp.append("pageSize", String(params.pageSize ?? 10));
    const res = await axios.get(`/invoices?${qp.toString()}`);
    return res.data;
  },

  async getById(id: string): Promise<ItemResponse<InvoiceDto>> {
    const res = await axios.get(`/invoices/${id}`);
    return res.data;
  },

  async createWalkIn(
    payload: CreateWalkInInvoiceRequest
  ): Promise<ItemResponse<InvoiceDto>> {
    const res = await axios.post(`/invoices/walk-in`, payload);
    return res.data;
  },

  async createBooking(
    payload: CreateBookingInvoiceRequest
  ): Promise<ItemResponse<InvoiceDto>> {
    const res = await axios.post(`/invoices/booking`, payload);
    return res.data;
  },
};

export default invoicesApi;
