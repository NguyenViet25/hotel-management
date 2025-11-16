import React, { useEffect, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import DataTable, {
  type Column,
} from "../../../../../components/common/DataTable";
import type { TableDto, TableStatus } from "../../../../../api/tablesApi";

interface TablesTableProps {
  data: TableDto[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: TableDto) => void;
  onDelete?: (record: TableDto) => void;
  onSearch?: (search: string) => void;
}

const statusChip = (status: TableStatus) => {
  const map: Record<number, { label: string; color: any }> = {
    0: { label: "Sẵn sàng", color: "success" },
    1: { label: "Đang sử dụng", color: "primary" },
    2: { label: "Đã đặt", color: "warning" },
    3: { label: "Ngừng phục vụ", color: "error" },
  };
  const s = map[Number(status)] || { label: "—", color: "default" };
  return <Chip label={s.label} color={s.color} size="small" />;
};

const activeChip = (active?: boolean) => (
  <Chip
    label={active ? "Hoạt động" : "Vô hiệu"}
    color={active ? "info" : "default"}
    size="small"
  />
);

const TablesTable: React.FC<TablesTableProps> = ({
  data,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const total = data.length;

  useEffect(() => {
    setPage(1);
  }, [data]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, page]);

  const columns: Column<TableDto>[] = [
    { id: "name", label: "Tên bàn", minWidth: 180 },
    { id: "capacity", label: "Sức chứa", minWidth: 120 },
    {
      id: "status",
      label: "Trạng thái",
      minWidth: 140,
      format: (v) => statusChip(v as TableStatus),
    },
  ];

  return (
    <DataTable
      title="Danh sách bàn"
      columns={columns}
      data={pagedData}
      loading={loading}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      getRowId={(row) => row.id}
      onSearch={onSearch}
      pagination={{ page, pageSize, total, onPageChange: setPage }}
    />
  );
};

export default TablesTable;
