import type { Column } from "../../../../../components/common/DataTable";
import type { RoomType } from "../../../../../api/roomTypesApi";

export const roomTypeColumns: Column<RoomType>[] = [
  { id: "name", label: "Tên loại phòng", minWidth: 160 },
  {
    id: "roomCount",
    label: "Sức chứa",
    minWidth: 160,
    format: (value: string | null | undefined) =>
      value != null ? `${value} người` : "Chưa cấu hình",
  },
  {
    id: "priceFrom",
    label: "Giá từ",
    minWidth: 120,
    format: (value: number | null | undefined) =>
      value != null ? `${value.toLocaleString()} đ` : "Chưa cấu hình",
  },
  {
    id: "priceTo",
    label: "Giá đến",
    minWidth: 120,
    format: (value: number | null | undefined) =>
      value != null ? `${value.toLocaleString()} đ` : "Chưa cấu hình",
  },
  {
    id: "description",
    label: "Mô tả",
    minWidth: 120,
    format: (value: string | null | undefined) =>
      value != null ? value : "Chưa cấu hình",
  },
  // { id: "roomCount", label: "Trạng thái", minWidth: 160 },
];
