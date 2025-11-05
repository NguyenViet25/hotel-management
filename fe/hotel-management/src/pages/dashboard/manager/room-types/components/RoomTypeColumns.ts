import type { Column } from "../../../../../components/common/DataTable";
import type { RoomType } from "../../../../../api/roomTypesApi";

export const roomTypeColumns: Column<RoomType>[] = [
  { id: "id", label: "ID", minWidth: 160 },
  { id: "name", label: "Tên loại phòng", minWidth: 160 },
  { id: "description", label: "Mô tả", minWidth: 200 },
  {
    id: "basePrice",
    label: "Giá cơ bản",
    minWidth: 120,
    format: (value: number | null | undefined) =>
      value != null ? value.toLocaleString() : "Chưa cấu hình",
  },
];
