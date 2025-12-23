import roomsApi, {
  RoomStatus,
  type ItemResponse,
  type RoomDto,
} from "../api/roomsApi";

export function statusUiFromTimeline(status: RoomStatus): {
  label: string;
  color: string;
} {
  const s = status;
  if (s === RoomStatus.Available) return { label: "Trống", color: "#2e7d32" };
  if (s === RoomStatus.Occupied)
    return { label: "Đã Có Khách", color: "#c62828" };
  if (s === RoomStatus.Cleaning)
    return { label: "Đang Dọn Dẹp", color: "#f9a825" };
  if (s === RoomStatus.Maintenance || s === RoomStatus.OutOfService)
    return { label: "Bảo Trì", color: "#424242" };
  if (s === RoomStatus.Dirty) return { label: "Phòng bẩn", color: "#ef6c00" };
  if (s === RoomStatus.Clean) return { label: "Đã dọn sạch", color: "#1976d2" };
  return { label: "N/A", color: "#9e9e9e" };
}

export function statusUiFromEnum(status: RoomStatus): {
  label: string;
  color: string;
} {
  return statusUiFromTimeline(status);
}

export async function updateRoomStatus(
  roomId: string,
  status: RoomStatus
): Promise<ItemResponse<RoomDto>> {
  const res = await roomsApi.getRoomById(roomId);
  const r = res.data;
  return roomsApi.updateRoom(roomId, {
    hotelId: r.hotelId,
    number: r.number,
    floor: r.floor,
    roomTypeId: r.roomTypeId,
    status,
  });
}
