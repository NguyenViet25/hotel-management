import { RoomStatus } from "../../../../../api/roomsApi";

export const ROOM_STATUS_OPTIONS: { value: RoomStatus; label: string }[] = [
  { value: RoomStatus.Available, label: "Sẵn sàng" },
  { value: RoomStatus.Occupied, label: "Đang sử dụng" },
  { value: RoomStatus.Cleaning, label: "Đang dọn dẹp" },
  { value: RoomStatus.OutOfService, label: "Ngừng phục vụ" },
  { value: RoomStatus.Dirty, label: "Bẩn" },
  { value: RoomStatus.Clean, label: "Đã dọn sạch" },
  { value: RoomStatus.Maintenance, label: "Bảo trì" },
];
