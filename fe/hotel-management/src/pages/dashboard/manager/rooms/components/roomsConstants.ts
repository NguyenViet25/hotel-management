import type { RoomDto } from "../../../../../api/roomsApi";

export const ROOM_STATUS_OPTIONS: { value: RoomDto["status"]; label: string }[] = [
  { value: "Available", label: "Sẵn sàng" },
  { value: "UnderMaintenance", label: "Bảo trì" },
  { value: "OutOfService", label: "Ngừng phục vụ" },
  { value: "TemporarilyUnavailable", label: "Tạm ngưng" },
];