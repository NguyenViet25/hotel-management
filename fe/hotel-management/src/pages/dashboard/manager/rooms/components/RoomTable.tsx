import React, { useMemo } from "react";
import { Chip } from "@mui/material";
import DataTable, {
  type Column,
} from "../../../../../components/common/DataTable";
import {
  getRoomStatusString,
  type RoomDto,
  type RoomStatus,
} from "../../../../../api/roomsApi";

type RoomTableProps = {
  rooms: RoomDto[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onEdit: (room: RoomDto) => void;
  onDelete: (room: RoomDto) => void;
  onChangeStatus: (room: RoomDto) => void;
  onSearch?: (txt: string) => void;
};

const statusChip = (status: RoomStatus) => {
  const s = getRoomStatusString(status);

  const map: Record<string, { color: string; label: string }> = {
    Available: { color: "#4CAF50", label: "Sẵn sàng" }, // green
    Occupied: { color: "#F44336", label: "Đang sử dụng" }, // red
    Cleaning: { color: "#2196F3", label: "Đang dọn dẹp" }, // blue
    OutOfService: { color: "#FF9800", label: "Ngừng phục vụ" }, // orange
    Dirty: { color: "#795548", label: "Bẩn" }, // brown
    Clean: { color: "#00BCD4", label: "Đã dọn sạch" }, // teal
    Maintenance: { color: "#9C27B0", label: "Bảo trì" }, // purple
  };
  const cfg = map[s] || { color: "default", label: String(status) };
  return (
    <Chip
      size="small"
      label={cfg.label}
      color="primary"
      sx={{ backgroundColor: cfg.color }}
    />
  );
};

const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  onChangeStatus,
}) => {
  const columns = useMemo<Column<RoomDto>[]>(
    () => [
      { id: "number", label: "Số phòng", minWidth: 100 },
      { id: "floor", label: "Tầng", minWidth: 80 },
      { id: "roomTypeName", label: "Loại phòng", minWidth: 140 },
      {
        id: "status",
        label: "Trạng thái",
        minWidth: 140,
        format: (v) => statusChip(v),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={rooms}
      title="Danh sách phòng"
      loading={loading}
      pagination={{ page, pageSize, total, onPageChange }}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onLock={onChangeStatus}
      getRowId={(row: RoomDto) => row.id}
      onSearch={onSearch}
    />
  );
};

export default RoomTable;
