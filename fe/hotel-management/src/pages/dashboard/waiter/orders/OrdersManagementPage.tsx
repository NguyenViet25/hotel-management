import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, Snackbar, Alert, TextField, Button } from "@mui/material";
import PageTitle from "../../../../components/common/PageTitle";
import ordersApi, { type OrderSummaryDto, type OrderDetailsDto, type OrderStatus } from "../../../../api/ordersApi";
import OrdersFilters from "./components/OrdersFilters";
import OrdersTable from "./components/OrdersTable";
import WalkInOrderFormModal from "./components/WalkInOrderFormModal";
import BookingOrderFormModal from "./components/BookingOrderFormModal";
import EditOrderFormModal from "./components/EditOrderFormModal";

// Orders Management Page (UC-28, UC-29, UC-30)
// - Lists orders with filters (status/search)
// - Create walk-in orders and booking orders
// - Edit order (status/notes/discount)
// - Cancel order (set status to Cancelled)
const OrdersManagementPage: React.FC = () => {
  // Filters
  const [status, setStatus] = useState<OrderStatus | undefined>("Serving");
  const [search, setSearch] = useState<string>("");
  const [hotelId, setHotelId] = useState<string>("");

  // Table data
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modals
  const [openWalkIn, setOpenWalkIn] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsDto | null>(null);

  // Feedback
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>(
    { open: false, message: "", severity: "success" }
  );

  // Fetch orders based on filters and pagination
  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await ordersApi.listOrders({ hotelId: hotelId || undefined, status, search: search || undefined, page: pageNum, pageSize });
      if (res.isSuccess) {
        setOrders(res.data);
        setTotal(res.meta?.total ?? res.data.length);
        setPage(res.meta?.page ?? pageNum);
      } else {
        setSnackbar({ open: true, severity: "error", message: res.message || "Không thể tải danh sách order" });
      }
    } catch (err) {
      setSnackbar({ open: true, severity: "error", message: "Đã xảy ra lỗi khi tải danh sách order" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, hotelId]);

  const openEditModal = async (summary: OrderSummaryDto) => {
    try {
      const res = await ordersApi.getById(summary.id);
      if (res.isSuccess) {
        setSelectedOrder(res.data);
        setOpenEdit(true);
      }
    } catch {}
  };

  const cancelOrder = async (summary: OrderSummaryDto) => {
    try {
      await ordersApi.update(summary.id, { status: "Cancelled" });
      setSnackbar({ open: true, severity: "success", message: "Đã hủy order" });
      fetchOrders(page);
    } catch {
      setSnackbar({ open: true, severity: "error", message: "Không thể hủy order" });
    }
  };

  return (
    <Box>
      <PageTitle title="Quản lý Order" subtitle="Tạo walk-in, gắn order vào booking, xem danh sách đang phục vụ/đã thanh toán" />

      {/* Basic hotelId input to scope orders and creation */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          label="Hotel ID (tuỳ chọn)"
          value={hotelId}
          onChange={(e) => setHotelId(e.target.value)}
          sx={{ minWidth: 280 }}
        />
        <Button variant="outlined" onClick={() => fetchOrders(1)}>Làm mới</Button>
      </Stack>

      {/* Filters for UC-30 */}
      <OrdersFilters status={status} search={search} onStatusChange={setStatus} onSearchChange={setSearch} />

      {/* Table listing */}
      <OrdersTable
        data={orders}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(p) => fetchOrders(p)}
        onAddWalkIn={() => setOpenWalkIn(true)}
        onAddBooking={() => setOpenBooking(true)}
        onEdit={(o) => openEditModal(o)}
        onCancel={(o) => cancelOrder(o)}
      />

      {/* Create walk-in */}
      <WalkInOrderFormModal
        open={openWalkIn}
        onClose={() => setOpenWalkIn(false)}
        hotelId={hotelId}
        onSubmitted={() => fetchOrders(page)}
      />

      {/* Create booking */}
      <BookingOrderFormModal
        open={openBooking}
        onClose={() => setOpenBooking(false)}
        hotelId={hotelId}
        onSubmitted={() => fetchOrders(page)}
      />

      {/* Edit order */}
      <EditOrderFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        order={selectedOrder}
        onSubmitted={() => fetchOrders(page)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagementPage;