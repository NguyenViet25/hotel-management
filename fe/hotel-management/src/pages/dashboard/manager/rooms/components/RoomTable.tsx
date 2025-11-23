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
    Available: { color: "#4CAF50", label: "Sẵn sàng" },
    Occupied: { color: "#607D8B", label: "Đang sử dụng" },
    Cleaning: { color: "#2196F3", label: "Đang dọn dẹp" },
    OutOfService: { color: "#9E9E9E", label: "Ngừng phục vụ" },
    Dirty: { color: "#F44336", label: "Bẩn" },
    Clean: { color: "#4CAF50", label: "Đã dọn sạch" },
    Maintenance: { color: "#FF9800", label: "Bảo trì" },
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
