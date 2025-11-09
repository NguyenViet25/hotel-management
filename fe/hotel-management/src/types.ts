export interface HotelSummaryDto {
  id: string; // Guid -> string
  code: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string; // DateTime -> ISO string (use Date if you parse it)
}
