import React from "react";
import DataTable, { type Column } from "../../../../../components/common/DataTable";
import type { MenuItemDto } from "../../../../../api/menusApi";
import { Chip, Avatar } from "@mui/material";

interface MenuTableProps {
  data: MenuItemDto[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: MenuItemDto) => void;
  onDelete?: (record: MenuItemDto) => void;
}

const statusChip = (status: string) => {
  const map: Record<string, { label: string; color: "success" | "warning" | "default" }> = {
    Available: { label: "Đang bán", color: "success" },
    Unavailable: { label: "Tạm ngừng", color: "warning" },
    SeasonallyUnavailable: { label: "Theo mùa", color: "default" },
  };
  const val = map[status] || { label: status, color: "default" };
  return <Chip label={val.label} color={val.color} size="small" />;
};

const activeChip = (active?: boolean) => (
  <Chip label={active ? "Kích hoạt" : "Đã tắt"} color={active ? "success" : "default"} size="small" />
);

const MenuTable: React.FC<MenuTableProps> = ({ data, loading, onAdd, onEdit, onDelete }) => {
  const columns: Column<MenuItemDto>[] = [
    {
      id: "imageUrl",
      label: "Ảnh",
      minWidth: 80,
      format: (value) => (value ? <Avatar src={value as string} variant="rounded" sx={{ width: 40, height: 40 }} /> : "-")
    },
    { id: "name", label: "Tên món", minWidth: 180 },
    { id: "group.name", label: "Nhóm", minWidth: 140, format: (_, row?: any) => row?.group?.name ?? "-" },
    { id: "group.shift", label: "Ca", minWidth: 120, format: (_, row?: any) => row?.group?.shift ?? "-" },
    { id: "unitPrice", label: "Đơn giá", minWidth: 120, align: "right", format: (v) => `${Number(v).toLocaleString()} ₫` },
    { id: "status", label: "Trạng thái", minWidth: 120, format: (v) => statusChip(String(v)) },
    { id: "isActive", label: "Kích hoạt", minWidth: 120, format: (v) => activeChip(Boolean(v)) },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      getRowId={(row) => row.id}
    />
  );
};

export default MenuTable;