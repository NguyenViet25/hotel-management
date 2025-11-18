import React, { useEffect, useMemo, useState } from "react";
import { Avatar } from "@mui/material";
import DataTable, {
  type Column,
} from "../../../../../components/common/DataTable";
import type { MediaDto } from "../../../../../api/mediaApi";

interface MediaTableProps {
  data: MediaDto[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: MediaDto) => void;
  onDelete?: (record: MediaDto) => void;
  onSearch?: (search: string) => void;
}

const thumb = (url: string, contentType?: string) => (
  <Avatar
    variant="rounded"
    sx={{ width: 56, height: 56 }}
    src={contentType?.startsWith("image") ? url : undefined}
  />
);

const MediaTable: React.FC<MediaTableProps> = ({
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

  const columns: Column<MediaDto>[] = [
    {
      id: "fileUrl",
      label: "Ảnh",
      minWidth: 100,
      format: (v: string) => thumb(String(v), "image/jpeg"),
    } as any,
    { id: "fileName", label: "Tên tệp", minWidth: 200 },
    { id: "contentType", label: "Loại", minWidth: 140 },
    {
      id: "size",
      label: "Kích thước (KB)",
      minWidth: 140,
      format: (v) => Math.round(Number(v) / 1024).toLocaleString(),
    },
    {
      id: "createdAt",
      label: "Ngày tạo",
      minWidth: 180,
      format: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      title="Danh sách media"
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

export default MediaTable;
