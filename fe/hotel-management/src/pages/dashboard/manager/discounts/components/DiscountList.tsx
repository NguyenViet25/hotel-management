import { Chip } from "@mui/material";
import React from "react";
import type { DiscountCode } from "../../../../../api/discountCodesApi";
import type { Column } from "../../../../../components/common/DataTable";
import DataTable from "../../../../../components/common/DataTable";

export type DiscountListProps = {
  rows: DiscountCode[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: DiscountCode) => void;
  onDelete?: (record: DiscountCode) => void;
  onSearch?: (text: string) => void;
};

const DiscountList: React.FC<DiscountListProps> = ({
  rows,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
}) => {
  const columns: Column<DiscountCode>[] = [
    { id: "code", label: "Mã", sortable: true },
    {
      id: "scope",
      label: "Loại",
      format: (v) => (
        <Chip size="small" label={v === "food" ? "Ăn uống" : "Đặt phòng"} />
      ),
    },
    {
      id: "value",
      label: "Giá trị",
      sortable: true,
      format: (v) => `${v}`,
    },
    {
      id: "description",
      label: "Điều kiện",
      format: (v) =>
        (v ? String(v).slice(0, 50) : "") +
        (v && String(v).length > 50 ? "…" : ""),
    },
    {
      id: "startDate",
      label: "Ngày bắt đầu",
      format: (v) => new Date(v).toLocaleDateString(),
    },
    {
      id: "endDate",
      label: "Ngày hết hạn",
      format: (v) => new Date(v).toLocaleDateString(),
    },
    {
      id: "isActive",
      label: "Trạng thái",
      format: (v) => (
        <Chip
          size="small"
          label={v ? "Đang hoạt động" : "Ngưng hoạt động"}
          color={v ? "success" : "error"}
        ></Chip>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      loading={loading}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onSearch={onSearch}
      getRowId={(r) => r.id || r.code}
    />
  );
};

export default DiscountList;
