import type { Column } from "../../../../../components/common/DataTable";
import type { RoomType } from "../../../../../api/roomTypesApi";

export const roomTypeColumns: Column<RoomType>[] = [
  { id: "name", label: "Tên loại phòng", minWidth: 160 },
  { id: "roomCount", label: "Sức chứa", minWidth: 160 },
  {
    id: "basePrice",
    label: "Giá cơ bản",
    minWidth: 120,
    format: (value: number | null | undefined) =>
      value != null ? value.toLocaleString() : "Chưa cấu hình",
  },
  { id: "roomCount", label: "Trạng thái", minWidth: 160 },
];
