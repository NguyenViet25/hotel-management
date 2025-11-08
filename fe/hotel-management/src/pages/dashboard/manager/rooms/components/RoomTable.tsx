import React, { useMemo } from "react";
import { Chip } from "@mui/material";
import DataTable, {
  type Column,
} from "../../../../../components/common/DataTable";
import type { RoomDto } from "../../../../../api/roomsApi";

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

const statusChip = (status: RoomDto["status"]) => {
  const map: Record<
    string,
    { color: "success" | "warning" | "error" | "default"; label: string }
  > = {
    Available: { color: "success", label: "Sẵn sàng" },
    UnderMaintenance: { color: "warning", label: "Bảo trì" },
    OutOfService: { color: "error", label: "Ngừng phục vụ" },
    TemporarilyUnavailable: { color: "default", label: "Tạm ngưng" },
  };
  const cfg = map[status] || { color: "default", label: String(status) };
  return <Chip size="small" label={cfg.label} color={cfg.color} />;
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
      { id: "typeName", label: "Loại phòng", minWidth: 140 },
      {
        id: "status",
        label: "Trạng thái",
        minWidth: 140,
        format: (v) => statusChip(v as RoomDto["status"]),
      },
      { id: "hotelName", label: "Khách sạn", minWidth: 160 },
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
