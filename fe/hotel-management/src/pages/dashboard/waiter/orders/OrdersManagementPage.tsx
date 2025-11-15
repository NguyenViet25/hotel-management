import { Check, Close } from "@mui/icons-material";
import { Alert, Box, Snackbar, Tab, Tabs } from "@mui/material";
import React, { useEffect, useLayoutEffect, useState } from "react";
import ordersApi, {
  type OrderDetailsDto,
  type OrderStatus,
  type OrderSummaryDto,
} from "../../../../api/ordersApi";
import ConfirmModal from "../../../../components/common/ConfirmModel";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import OrderFormModal from "./components/OrderFormModal";
import OrdersTable from "./components/OrdersTable";
import { useSearchParams } from "react-router-dom";

// Orders Management Page (UC-28, UC-29, UC-30)
// - Lists orders with filters (status/search)
// - Create walk-in orders and booking orders
// - Edit order (status/notes/discount)
// - Cancel order (set status to Cancelled)
const OrdersManagementPage: React.FC = () => {
  // Filters
  const [status, _] = useState<OrderStatus | undefined>("0");
  const [search, setSearch] = useState<string>("");
  const { hotelId, user } = useStore<StoreState>((state) => state);
  const [searchParams, setSearchParams] = useSearchParams();

  // Set a query param

  // Table data
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const walkInOrders = orders.filter((o) => o.isWalkIn);
  const bookingOrders = orders.filter((o) => o.isWalkIn === false);

  // Modals
  const [openOrder, setOpenOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsDto | null>(
    null
  );
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
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

  const openEditModal = async (summary: OrderDetailsDto) => {
    setSelectedOrder(summary);
    setOpenOrder(true);
  };

  const cancelOrder = async (summary: OrderSummaryDto) => {
    try {
      await ordersApi.updateWalkIn(summary.id, {
        status: 3 as any,
        notes: `Hủy yêu cầu đặt món bởi ${user?.fullname || "hệ thống."}`,
        customerName: summary.customerName,
        customerPhone: summary.customerPhone,
        hotelId: hotelId,
        id: summary.id,
      });
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

  useEffect(() => {
    setSearchParams({ tabValue: value.toString() });
  }, [value]);

  useLayoutEffect(() => {
    const tabValue = searchParams.get("tabValue");
    if (tabValue !== null) {
      setValue(Number(tabValue));
    }
  }, []);

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

      <OrdersTable
        data={value === 1 ? bookingOrders : walkInOrders}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(p) => fetchOrders(p)}
        onAddOrder={() => setOpenOrder(true)}
        onEdit={(o) => openEditModal(o as any)}
        onCancel={(o) => {
          setSelectedOrder(o as any);
          setConfirmOpen(true);
        }}
        onSearch={(e) => setSearch(e)}
      />

      <OrderFormModal
        open={openOrder}
        onClose={() => setOpenOrder(false)}
        hotelId={hotelId}
        onSubmitted={() => fetchOrders(page)}
        initialValues={selectedOrder}
        isWalkIn={value === 0}
      />

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selectedOrder) {
            cancelOrder(selectedOrder);
          }
          setConfirmOpen(false);
        }}
        title="Xác nhận hủy order"
        message={`Bạn có chắc chắn muốn hủy order được chọn không?`}
        confirmIcon={<Check />}
        cancelIcon={<Close />}
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
