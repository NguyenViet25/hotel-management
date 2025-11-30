import LocalDiningIcon from "@mui/icons-material/LocalDining";
import HotelIcon from "@mui/icons-material/Hotel";
import { Chip, Tooltip, Typography } from "@mui/material";
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
    {
      id: "code",
      label: "Mã",
      sortable: true,
      format: (v) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {String(v)}
        </Typography>
      ),
    },
    {
      id: "scope",
      label: "Loại",
      align: "center",
      render: (row) => (
        <Chip
          size="small"
          icon={row.scope === "food" ? <LocalDiningIcon /> : <HotelIcon />}
          label={row.scope === "food" ? "Ăn uống" : "Đặt phòng"}
          color={row.scope === "food" ? "success" : "primary"}
          variant="filled"
        />
      ),
    },
    {
      id: "value",
      label: "Giá trị(%)",
      sortable: true,
      align: "center",
      render: (row) => {
        const v = Number(row.value) || 0;
        return (
          <Chip
            size="small"
            label={`${v}%`}
            sx={{ fontWeight: 800, letterSpacing: 0.5, minWidth: 64 }}
          />
        );
      },
    },
    {
      id: "description",
      label: "Điều kiện",
      render: (row) => (
        <Tooltip title={row.description || ""} arrow>
          <Typography variant="body2" sx={{ maxWidth: 280 }} noWrap>
            {(row.description ? String(row.description).slice(0, 50) : "") +
              (row.description && String(row.description).length > 50
                ? "…"
                : "")}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: "startDate",
      label: "Ngày bắt đầu",
      format: (v) => new Date(v).toLocaleDateString(),
    },
    {
      id: "endDate",
      label: "Ngày hết hạn",
      render: (row) => {
        const end = new Date(row.endDate);
        const now = new Date();
        const daysLeft = Math.ceil(
          (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const color = daysLeft <= 3 ? "warning.main" : "text.secondary";
        const weight = daysLeft <= 3 ? 600 : undefined;
        return (
          <Typography variant="body2" sx={{ color, fontWeight: weight }}>
            {end.toLocaleDateString()}
          </Typography>
        );
      },
    },
    {
      id: "isActive",
      label: "Trạng thái",
      format: (v) => (
        <Chip
          size="small"
          label={v ? "Đang hoạt động" : "Ngưng hoạt động"}
          color={v ? "success" : "error"}
          variant={v ? "filled" : "outlined"}
        />
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
      borderRadius={3}
    />
  );
};

export default DiscountList;
