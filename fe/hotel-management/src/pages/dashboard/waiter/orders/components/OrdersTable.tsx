import React from "react";
import { Chip, Avatar } from "@mui/material";
import DataTable, { type Column } from "../../../../../components/common/DataTable";
import type { OrderSummaryDto } from "../../../../../api/ordersApi";

interface OrdersTableProps {
  data: OrderSummaryDto[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onAddWalkIn?: () => void;
  onAddBooking?: () => void;
  onEdit?: (record: OrderSummaryDto) => void;
  onCancel?: (record: OrderSummaryDto) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const OrdersTable: React.FC<OrdersTableProps> = ({
  data,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onAddWalkIn,
  onAddBooking,
  onEdit,
  onCancel,
}) => {
  const columns: Column<OrderSummaryDto>[] = [
    {
      id: "id",
      label: "Mã đơn",
      format: (v) => String(v).slice(0, 8).toUpperCase(),
      minWidth: 100,
    },
    {
      id: "isWalkIn",
      label: "Loại khách",
      format: (v, row: OrderSummaryDto) => (
        <Chip
          label={row.isWalkIn ? "Walk-in" : "Booking"}
          color={row.isWalkIn ? "default" : "primary"}
          size="small"
        />
      ),
      minWidth: 120,
    },
    {
      id: "customerName",
      label: "Khách hàng",
      format: (v, row: OrderSummaryDto) => (
        <span>{row.customerName ?? "—"}</span>
      ),
      minWidth: 160,
    },
    {
      id: "status",
      label: "Trạng thái",
      format: (v: string) => {
        const color = v === "Serving" ? "warning" : v === "Paid" ? "success" : v === "Draft" ? "default" : "error";
        return <Chip label={v} color={color as any} size="small" />;
      },
      minWidth: 140,
    },
    {
      id: "itemsCount",
      label: "Số món",
      minWidth: 90,
    },
    {
      id: "itemsTotal",
      label: "Tổng tiền",
      format: (v: number) => formatCurrency(v),
      minWidth: 140,
    },
    {
      id: "createdAt",
      label: "Tạo lúc",
      format: (v: string) => new Date(v).toLocaleString("vi-VN"),
      minWidth: 180,
    },
  ];

  return (
    <DataTable
      title="Danh sách Order"
      columns={columns}
      data={data}
      loading={loading}
      pagination={{
        page,
        pageSize,
        total,
        onPageChange,
      }}
      onAdd={onAddWalkIn}
      onEdit={onEdit}
      onDelete={onCancel}
      getRowId={(row) => row.id}
      actionColumn
    />
  );
};

export default OrdersTable;