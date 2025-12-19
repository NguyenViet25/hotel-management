// RoomStatusLog
export interface RoomStatusLog {
  id: string;
  hotelId: string;
  roomId: string;
  taskId: string;
  status: string;
  timestamp: string; // ISO date string
  notes?: string;
  evidenceUrls?: string[];
}

// MinibarBooking
export interface MinibarBooking {
  id: string;
  minibarId: string;
  bookingId: string;
  houseKeepingTaskId: string;
  comsumedQuantity: number;
  originalQuantity: number;
  minibarBookingStatus: number;
}

// HousekeepingTaskDto
