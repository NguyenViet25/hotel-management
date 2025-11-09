import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Snackbar,
  Alert,
  TextField,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import PageTitle from "../../../../components/common/PageTitle";
import ordersApi, {
  type OrderSummaryDto,
  type OrderDetailsDto,
  type OrderStatus,
} from "../../../../api/ordersApi";
import OrdersFilters from "./components/OrdersFilters";
import OrdersTable from "./components/OrdersTable";
import WalkInOrderFormModal from "./components/WalkInOrderFormModal";
import BookingOrderFormModal from "./components/BookingOrderFormModal";
import EditOrderFormModal from "./components/EditOrderFormModal";
import { People, Person, Person2, Person3 } from "@mui/icons-material";

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
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsDto | null>(
    null
  );
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  // Feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Fetch orders based on filters and pagination
  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await ordersApi.listOrders({
        hotelId: hotelId || undefined,
        status,
        search: search || undefined,
        page: pageNum,
        pageSize,
      });
      if (res.isSuccess) {
        setOrders(res.data);
        setTotal(res.meta?.total ?? res.data.length);
        setPage(res.meta?.page ?? pageNum);
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: res.message || "Không thể tải danh sách order",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Đã xảy ra lỗi khi tải danh sách order",
      });
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
      setSnackbar({
        open: true,
        severity: "error",
        message: "Không thể hủy order",
      });
    }
  };

  return (
    <Box>
      <PageTitle
        title="Quản lý yêu cầu đặt món"
        subtitle="Tạo yêu cầu đặt món khách vãng lai, khách đặt phòng, xem danh sách đang phục vụ/đã thanh toán"
      />
      <Box
        sx={{
          backgroundColor: "#fff",
          width: "100%",
          borderRadius: 2,
          borderEndEndRadius: 0,
          borderEndStartRadius: 0,
          border: "1px solid #e0e0e0",
          borderBottom: "none",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          TabIndicatorProps={{
            style: {
              backgroundColor: "#1976d2",
              height: 3,
              borderRadius: 3,
            },
          }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minHeight: 48,
              color: "#555",
              transition: "all 0.3s ease",
            },
            "& .MuiTab-root:hover": {
              backgroundColor: "#f5f5f5",
            },
            "& .Mui-selected": {
              color: "#1976d2",
              backgroundColor: "#E3F2FD",
            },
          }}
        >
          <Tab
            label="Khách vãng lai"
            sx={{
              borderRadius: 2,
              borderEndEndRadius: 0,
              borderEndStartRadius: 0,
              borderStartEndRadius: 0,
            }}
          />
          <Tab
            label="Khách đặt phòng"
            sx={{
              borderRadius: 2,
              borderEndEndRadius: 0,
              borderEndStartRadius: 0,
              borderStartStartRadius: 0,
            }}
          />
        </Tabs>
      </Box>
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
        onSearch={(e) => setSearch(e)}
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
