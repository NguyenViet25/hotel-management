import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Snackbar,
  Alert,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import DataTable, { type Column } from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingsQueryDto,
} from "../../../../api/bookingsApi";
import ordersApi, { type OrderSummaryDto } from "../../../../api/ordersApi";
import PromotionDialog from "./components/PromotionDialog";
import OrderFormModal from "../../waiter/orders/components/OrderFormModal";

type InvoiceRow = {
  id: string;
  invoiceNumber?: string;
  guestName?: string;
  roomNumber?: string;
  type: "Booking" | "Walk-in";
  totalAmount: number;
  status: string;
  createdAt: string;
};

const InvoiceManagementPage: React.FC = () => {
  const { hotelId } = useStore() as StoreState;

  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({ open: false, severity: "success", message: "" });
  const [openWalkIn, setOpenWalkIn] = useState(false);
  const [openBookingOrder, setOpenBookingOrder] = useState(false);
  const [bookingCheckoutOpen, setBookingCheckoutOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [discountCode, setDiscountCode] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<0 | 1 | 2 | 3>(0);
  const [earlyCheckIn, setEarlyCheckIn] = useState<boolean>(false);
  const [lateCheckOut, setLateCheckOut] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoOrderId, setPromoOrderId] = useState<string | null>(null);

  const columns: GridColDef<InvoiceRow>[] = useMemo(
    () => [
      {
        field: "invoiceNumber",
        headerName: "Số hóa đơn",
        minWidth: 160,
        renderCell: (params) => (
          <Typography fontWeight={600}>{params.value || "N/A"}</Typography>
        ),
      },
      { field: "guestName", headerName: "Khách", minWidth: 160 },
      { field: "roomNumber", headerName: "Phòng", minWidth: 120 },
      { field: "type", headerName: "Loại", minWidth: 120 },
      {
        field: "totalAmount",
        headerName: "Tổng tiền",
        minWidth: 140,
        valueFormatter: (params: any) =>
          `${Number(params.value || 0).toLocaleString()} đ`,
      },
      {
        field: "status",
        headerName: "Trạng thái",
        minWidth: 140,
        renderCell: (p) => <Chip label={p.value as string} />,
      },
      {
        field: "createdAt",
        headerName: "Ngày tạo",
        minWidth: 160,
        valueFormatter: (params: any) => {
          const v = params.value as string | undefined;
          return v ? new Date(v).toLocaleString() : "";
        },
      },
      {
        field: "actions",
        headerName: "Thao tác",
        sortable: false,
        minWidth: 220,
        renderCell: (p) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onView(p.row)}
            >
              Xem
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => onPrint(p.row)}
            >
              In
            </Button>
            
          </Stack>
        ),
      },
    ],
    []
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const q: BookingsQueryDto = {
        hotelId: hotelId || undefined,
        page: 1,
        pageSize: 20,
        sortBy: "createdAt",
        sortDir: "desc",
      };
      const [bookingRes, ordersRes] = await Promise.all([
        bookingsApi.list(q),
        ordersApi.listOrders({
          hotelId: hotelId || undefined,
          page: 1,
          pageSize: 20,
        }),
      ]);

      const bookingRows: InvoiceRow[] = (bookingRes.data || []).map(
        (b: BookingDetailsDto) => {
          const room = b.bookingRoomTypes?.[0]?.bookingRooms?.[0]?.roomName;
          return {
            id: `BK-${b.id}`,
            invoiceNumber: `BK-${b.id.substring(0, 8)}`,
            guestName: b.primaryGuestName || "",
            roomNumber: room || "",
            type: "Booking",
            totalAmount: b.totalAmount || 0,
            status:
              b.status === 2
                ? "Checked-in"
                : b.status === 3
                ? "Checked-out"
                : "Pending",
            createdAt: b.createdAt,
          };
        }
      );

      const orderRows: InvoiceRow[] = (ordersRes.data || []).map(
        (o: OrderSummaryDto) => ({
          id: `OD-${o.id}`,
          invoiceNumber: `OD-${o.id.substring(0, 8)}`,
          guestName: o.customerName || "",
          roomNumber: "",
          type: o.isWalkIn ? "Walk-in" : "Booking",
          totalAmount: o.itemsTotal || 0,
          status:
            o.status === "2"
              ? "Completed"
              : o.status === "1"
              ? "Serving"
              : o.status === "0"
              ? "Draft"
              : "Cancelled",
          createdAt: o.createdAt,
        })
      );

      setRows(
        [...bookingRows, ...orderRows].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err: any) {
      setSnackbar({
        open: true,
        severity: "error",
        message: err?.message || "Không thể tải danh sách hóa đơn",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const onView = (row: InvoiceRow) => {
    setSnackbar({
      open: true,
      severity: "success",
      message: `Mở hóa đơn ${row.invoiceNumber}`,
    });
  };

  const onPrint = (row: InvoiceRow) => {
    window.print();
  };

  

  return (
    <Box>
      <PageTitle
        title="Hóa đơn"
        subtitle="Quản lý hóa đơn Walk-in và Booking"
      />

      <Stack direction="row" spacing={1} mb={2}>
        <Button variant="contained" onClick={() => setOpenWalkIn(true)}>
          Tạo hóa đơn Walk-in
        </Button>
        <Button variant="outlined" onClick={() => setBookingCheckoutOpen(true)}>
          Tạo hóa đơn Booking
        </Button>
      </Stack>

      <div style={{ height: 560, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableColumnMenu
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <OrderFormModal
        open={openWalkIn}
        onClose={() => setOpenWalkIn(false)}
        isWalkIn
        onSubmitted={() => {
          setSnackbar({
            open: true,
            severity: "success",
            message: "Đã tạo order vãng lai",
          });
          fetchData();
        }}
      />

      <PromotionDialog
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        onApply={(code) => {
          setDiscountCode(code.code);
          setPromoOpen(false);
        }}
      />

      <Dialog
        open={bookingCheckoutOpen}
        onClose={() => setBookingCheckoutOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tạo hóa đơn Booking</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Booking ID"
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              placeholder="Nhập hoặc dán mã booking"
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
              <TextField
                label="Mã giảm giá"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={() => setPromoOpen(true)}>Chọn mã</Button>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Số tiền thanh toán"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                fullWidth
              />
              <TextField
                select
                label="Hình thức"
                value={paymentType}
                onChange={(e) => setPaymentType(Number(e.target.value) as any)}
                fullWidth
              >
                <MenuItem value={0}>Tiền mặt</MenuItem>
                <MenuItem value={1}>Thẻ</MenuItem>
                <MenuItem value={2}>Chuyển khoản</MenuItem>
                <MenuItem value={3}>Khác</MenuItem>
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Early check-in"
                value={earlyCheckIn ? 1 : 0}
                onChange={(e) => setEarlyCheckIn(Number(e.target.value) === 1)}
                fullWidth
              >
                <MenuItem value={0}>Không</MenuItem>
                <MenuItem value={1}>Có</MenuItem>
              </TextField>
              <TextField
                select
                label="Late check-out"
                value={lateCheckOut ? 1 : 0}
                onChange={(e) => setLateCheckOut(Number(e.target.value) === 1)}
                fullWidth
              >
                <MenuItem value={0}>Không</MenuItem>
                <MenuItem value={1}>Có</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingCheckoutOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedBookingId) return;
              try {
                const res = await bookingsApi.checkOut(selectedBookingId, {
                  discountCode: discountCode || undefined,
                  finalPayment:
                    paymentAmount > 0
                      ? { amount: paymentAmount, type: paymentType }
                      : undefined,
                  earlyCheckIn,
                  lateCheckOut,
                });
                if (res.isSuccess) {
                  setSnackbar({
                    open: true,
                    severity: "success",
                    message: "Đã tạo hóa đơn booking",
                  });
                  setBookingCheckoutOpen(false);
                  fetchData();
                } else {
                  setSnackbar({
                    open: true,
                    severity: "error",
                    message: res.message || "Không thể tạo hóa đơn",
                  });
                }
              } catch (err: any) {
                setSnackbar({
                  open: true,
                  severity: "error",
                  message: err?.message || "Đã xảy ra lỗi",
                });
              }
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceManagementPage;
