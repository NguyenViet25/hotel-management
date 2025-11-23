import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import invoicesApi, { type InvoiceDto } from "../../../../api/invoicesApi";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import OrderFormModal from "../../waiter/orders/components/OrderFormModal";
import PromotionDialog from "./components/PromotionDialog";
import ordersApi from "../../../../api/ordersApi";

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

  const columns: Column<InvoiceRow & { actions?: React.ReactNode }>[] = useMemo(
    () => [
      {
        id: "invoiceNumber",
        label: "Số hóa đơn",
        minWidth: 160,
        render: (row) => (
          <Typography fontWeight={600}>{row.invoiceNumber || "N/A"}</Typography>
        ),
      },
      { id: "guestName", label: "Khách", minWidth: 160 },
      { id: "roomNumber", label: "Phòng", minWidth: 120 },
      { id: "type", label: "Loại", minWidth: 120 },
      {
        id: "totalAmount",
        label: "Tổng tiền",
        minWidth: 140,
        format: (v) => `${Number(v || 0).toLocaleString()} đ`,
      },
      {
        id: "status",
        label: "Trạng thái",
        minWidth: 140,
        render: (row) => <Chip label={row.status} />,
      },
      {
        id: "createdAt",
        label: "Ngày tạo",
        minWidth: 160,
        format: (v) => {
          const s = v as string | undefined;
          return s ? new Date(s).toLocaleString() : "";
        },
      },
      { id: "actions", label: "Tác vụ", minWidth: 220, align: "center" },
    ],
    []
  );

  const fetchList = async (nextPage = 1) => {
    setLoading(true);
    try {
      const res = await invoicesApi.list({
        hotelId: hotelId || undefined,
        page: nextPage,
        pageSize,
      });

      const invRows: InvoiceRow[] = (res.data?.items || []).map(
        (i: InvoiceDto) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          guestName: i.guestId || "",
          roomNumber: i.bookingId ? "" : "",
          type: i.isWalkIn ? "Walk-in" : "Booking",
          totalAmount: i.totalAmount || 0,
          status: (i.statusName as string) || String(i.status),
          createdAt: i.createdAt,
        })
      );

      const combined = invRows.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRows(combined);
      setPage(nextPage);
      setTotal(res.data?.totalCount ?? combined.length);
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
    fetchList(1);
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

  const tableData = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      actions: (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ flexWrap: "wrap" }}
        >
          <Button size="small" variant="outlined" onClick={() => onView(r)}>
            Xem
          </Button>
          <Button size="small" variant="contained" onClick={() => onPrint(r)}>
            In
          </Button>
        </Stack>
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  return (
    <Box>
      <PageTitle
        title="Hóa đơn"
        subtitle="Quản lý hóa đơn Walk-in và Booking"
      />

      <DataTable
        title="Danh sách hóa đơn"
        columns={columns}
        data={tableData}
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (p) => fetchList(p),
        }}
        onSearch={(text) => {
          setSearch(text);
          fetchList(1);
        }}
        actionColumn={false}
        getRowId={(r: any) => r.id}
      />

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
          fetchList(page);
        }}
      />

      <PromotionDialog
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        onApply={async (code) => {
          if (!promoOrderId) {
            setDiscountCode(code.code);
            setPromoOpen(false);
            return;
          }
          try {
            const res = await ordersApi.applyDiscount(promoOrderId, {
              code: code.code,
            });
            if ((res as any).isSuccess) {
              setSnackbar({
                open: true,
                severity: "success",
                message: "Áp dụng khuyến mãi thành công",
              });
              fetchList(page);
            } else {
              setSnackbar({
                open: true,
                severity: "error",
                message: (res as any).message || "Không thể áp dụng",
              });
            }
          } catch (err: any) {
            setSnackbar({
              open: true,
              severity: "error",
              message: err?.message || "Đã xảy ra lỗi",
            });
          } finally {
            setPromoOpen(false);
            setPromoOrderId(null);
          }
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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <TextField
                label="Mã giảm giá"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={() => setPromoOpen(true)}>
                Chọn mã
              </Button>
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
                const res = await invoicesApi.createBooking({
                  bookingId: selectedBookingId,
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
                  fetchList(page);
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
