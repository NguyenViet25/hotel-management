import React, { useEffect, useMemo, useState } from "react";
import DataTable, {
  type Column,
} from "../../../../../components/common/DataTable";
import type { Minibar } from "../../../../../api/minibarApi";

interface MinibarTableProps {
  data: Minibar[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: Minibar) => void;
  onDelete?: (record: Minibar) => void;
  onSearch?: (search: string) => void;
}

const MinibarTable: React.FC<MinibarTableProps> = ({
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

  const columns: Column<Minibar>[] = [
    { id: "name", label: "Tên", minWidth: 180 },
    {
      id: "price",
      label: "Giá",
      minWidth: 120,
      format: (v) => `${Number(v).toLocaleString()} đ`,
    },
    { id: "quantity", label: "Số lượng", minWidth: 120 },
    { id: "roomTypeName", label: "Loại phòng", minWidth: 120 },
  ];

  return (
    <DataTable
      title="Danh sách minibar"
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

export default MinibarTable;
