import React from "react";
import type { Column } from "../../../../../components/common/DataTable";
import type { RoomType } from "../../../../../api/roomTypesApi";

export const roomTypeColumns: Column<RoomType>[] = [
  {
    id: "imageUrl",
    label: "Ảnh",
    minWidth: 80,
    render: (row) => {
      const src = row.imageUrl;
      return src
        ? React.createElement("img", {
            src,
            alt: row.name,
            style: {
              width: 48,
              height: 36,
              objectFit: "cover",
              borderRadius: 6,
            },
          })
        : "—";
    },
  },
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
