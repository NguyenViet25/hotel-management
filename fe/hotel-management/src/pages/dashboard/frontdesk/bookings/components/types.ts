export interface IBookingSummary {
  primaryGuestName: string;
  phoneNumber: string;
  email: string;
  totalAmount: number;
  discountAmount: number;
  depositAmount: number;
  leftAmount: number;
  createdAt: string;
  notes: string;
}
