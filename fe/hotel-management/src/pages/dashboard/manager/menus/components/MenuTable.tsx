import React, { useEffect, useMemo, useState } from "react";
import DataTable, {
  type Column,
} from "../../../../../components/common/DataTable";
import type { MenuItemDto } from "../../../../../api/menusApi";
import { Chip, Avatar } from "@mui/material";

interface MenuTableProps {
  data: MenuItemDto[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: MenuItemDto) => void;
  onDelete?: (record: MenuItemDto) => void;
  onSearch?: (e: string) => void;
}

const activeChip = (active?: boolean) => (
  <Chip
    label={active ? "Đang bán" : "Ngừng bán"}
    color={active ? "primary" : "error"}
    size="small"
  />
);

const MenuTable: React.FC<MenuTableProps> = ({
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

  const columns: Column<MenuItemDto>[] = [
    {
      id: "imageUrl",
      label: "Ảnh",
      minWidth: 80,
      format: (value) =>
        value ? (
          <Avatar
            src={value as string}
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          />
        ) : (
          "-"
        ),
    },
    { id: "name", label: "Tên món", minWidth: 180 },
    {
      id: "category",
      label: "Nhóm",
      minWidth: 140,
    },

    {
      id: "unitPrice",
      label: "Đơn giá",
      minWidth: 120,
      format: (v) => `${Number(v).toLocaleString()} ₫`,
    },
    {
      id: "status",
      label: "Trạng thái",
      minWidth: 120,
      format: (v) => activeChip(v == 0),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={pagedData}
      loading={loading}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      getRowId={(row) => row.id}
      onSearch={onSearch}
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
      }}
    />
  );
};

export default MenuTable;
