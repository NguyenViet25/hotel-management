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
  const map: Record<string, { bg: string; text: string; label: string }> = {
    Available: { bg: "#F2F4F7", text: "#344054", label: "Sẵn sàng" },
    Occupied: { bg: "#E8ECF7", text: "#1F2A44", label: "Đang sử dụng" },
    Cleaning: { bg: "#FEF3C7", text: "#92400E", label: "Đang dọn dẹp" },
    OutOfService: { bg: "#EDEDED", text: "#555", label: "Ngừng phục vụ" },
    Dirty: { bg: "#FDECEC", text: "#C62828", label: "Bẩn" },
    Clean: { bg: "#DDF7E5", text: "#1B5E20", label: "Đã dọn sạch" },
    Maintenance: { bg: "#E8ECF7", text: "#1F2A44", label: "Bảo trì" },
  };
  const cfg = map[s] || { bg: "#F2F4F7", text: "#344054", label: String(status) };
  return <Chip size="small" label={cfg.label} sx={{ bgcolor: cfg.bg, color: cfg.text, fontWeight: 700 }} />;
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
