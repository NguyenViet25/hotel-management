import React from "react";
import DataTable, { type Column } from "../../../../../components/common/DataTable";
import type { RoomType } from "../../../../../api/roomTypesApi";
import { roomTypeColumns } from "./RoomTypeColumns";

export interface RoomTypeTableProps {
  data: RoomType[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onEdit: (rt: RoomType) => void;
  onDelete: (rt: RoomType) => void;
}

const RoomTypeTable: React.FC<RoomTypeTableProps> = ({
  data,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const columns: Column<RoomType>[] = roomTypeColumns;

  return (
    <DataTable<RoomType>
      columns={columns}
      data={data}
      title="Danh sách loại phòng"
      loading={loading}
      pagination={{ page, pageSize, total, onPageChange }}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      getRowId={(row) => row.id}
    />
  );
};

export default RoomTypeTable;