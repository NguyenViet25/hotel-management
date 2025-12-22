import { Print, RemoveRedEye } from "@mui/icons-material";
import { Chip, IconButton, Stack } from "@mui/material";
import React from "react";
import type { OrderSummaryDto } from "../../../../../api/ordersApi";
import DataTable, {
  type Column,
} from "../../../../../components/common/DataTable";

interface OrdersTableProps {
  data: OrderSummaryDto[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onAddOrder?: () => void;
  onEdit?: (record: OrderSummaryDto) => void;
  onCancel?: (record: OrderSummaryDto) => void;
  onSearch?: (search: string) => void;
  onCreateInvoice?: (record: OrderSummaryDto) => void;
  onSelectPromotion?: (record: OrderSummaryDto) => void;
  invoiceMap?: Record<string, { id: string; invoiceNumber?: string }>;
  onPrintInvoice?: (record: OrderSummaryDto, invoiceId: string) => void;
  onView?: (record: OrderSummaryDto) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

const OrdersTable: React.FC<OrdersTableProps> = ({
  data,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onAddOrder,
  onEdit,
  onSearch,
  onCancel,
  onCreateInvoice,
  onSelectPromotion,
  invoiceMap,
  onPrintInvoice,
  onView,
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
      format: (row: string) => (
        <Chip
          label={row ? "Vãng lai" : "Đặt phòng"}
          color={row ? "default" : "primary"}
          size="small"
        />
      ),
      minWidth: 120,
    },
    {
      id: "customerName",
      label: "Khách hàng",
      format: (row: string) => <span>{row ?? "—"}</span>,
      minWidth: 140,
    },
    {
      id: "customerPhone",
      label: "Số điện thoại",
      format: (row: string) => <span>{row ?? "—"}</span>,
      minWidth: 140,
    },
    {
      id: "status",
      label: "Trạng thái",
      format: (v: number) => {
        const color =
          v === 0
            ? "warning"
            : v === 1
            ? "primary"
            : v === 2
            ? "success"
            : "error";
        const label =
          v === 0
            ? "Đã tạo"
            : v === 1
            ? "Đang xử lý"
            : v === 2
            ? "Hoành thành"
            : "Hủy";
        return <Chip label={label} color={color as any} size="small" />;
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
      id: "notes",
      label: "Ghi chú",
      format: (v: string) => (v ? v : "—"),
      minWidth: 180,
    },
    {
      id: "createdAt",
      label: "Thời gian phục vụ",
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
      onAdd={onAddOrder}
      onEdit={onEdit}
      onDelete={undefined}
      onView={onView}
      getRowId={(row) => row.id}
      actionColumn
      renderActions={(row) => {
        if (!row.isWalkIn) return null;
        const existing = invoiceMap?.[row.id];
        if (existing && onPrintInvoice) {
          return (
            <IconButton
              size="small"
              color="success"
              onClick={() => onPrintInvoice(row, existing.id)}
              aria-label="view invoice"
            >
              <RemoveRedEye fontSize="small" />
            </IconButton>
          );
        }
        return (
          <IconButton
            size="small"
            color="success"
            onClick={() => onCreateInvoice?.(row)}
            aria-label="create invoice"
            disabled={row.status === 6}
          >
            <Print fontSize="small" />
          </IconButton>
        );
      }}
      onSearch={onSearch}
      borderRadius={0}
    />
  );
};

export default OrdersTable;
