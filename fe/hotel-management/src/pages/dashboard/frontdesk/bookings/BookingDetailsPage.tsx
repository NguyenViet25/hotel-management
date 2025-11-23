import { Check, Edit } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import bookingsApi, {
  EBookingStatus,
  type BookingDetailsDto,
  type UpdateBookingDto,
} from "../../../../api/bookingsApi";
import PageTitle from "../../../../components/common/PageTitle";
import BookingFormModal from "./components/BookingFormModal";
import { BookingSummary } from "./components/BookingSummary";
import CallLogsDisplay from "./components/CallLogDIsplay";
import CallLogModal from "./components/CallLogModal";
import CancelBookingModal from "./components/CancelBookingModal";
import RoomTypeAssignCheckIn from "./components/RoomTypeAssignCheckIn";
import type { IBookingSummary } from "./components/types";

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<BookingDetailsDto | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openCall, setOpenCall] = useState(false);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<0 | 1 | 2 | 3>(0);
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);

  const fetch = async () => {
    if (!id) return;
    try {
      const res = await bookingsApi.getById(id);
      if (res.isSuccess && res.data) setData(res.data);
    } catch {}
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (payload: UpdateBookingDto) => {
    if (!id) return;
    try {
      const res = await bookingsApi.update(id, payload);
      if (res.isSuccess) {
        await fetch();
      }
    } catch {}
  };

  const statusChip = useMemo(() => {
    const s = data?.status as number | undefined;
    const mapping: Record<
      number,
      {
        label: string;
        color: "default" | "primary" | "success" | "warning" | "error";
      }
    > = {
      0: { label: "Chờ duyệt", color: "default" },
      1: { label: "Đã xác nhận", color: "primary" },
      2: { label: "Đã nhận phòng", color: "success" },
      3: { label: "Hoàn tất", color: "success" },
      4: { label: "Đã hủy", color: "error" },
    };
    if (s === undefined) return null;
    const m = mapping[s] || { label: String(s), color: "default" };
    return <Chip label={m.label} color={m.color} size="small" />;
  }, [data]);

  const dateRange = useMemo(() => {
    if (!data) return { start: "—", end: "—", nights: 0 };

    const start = data.bookingRoomTypes?.[0]?.startDate || "—";
    const end = data.bookingRoomTypes?.[0]?.endDate || "—";
    const nights = Math.max(1, dayjs(end).diff(dayjs(start), "day"));
    return { start, end, nights };
  }, [data]);

  const formatCurrency = (v?: number) =>
    typeof v === "number" ? `${v.toLocaleString()} đ` : "—";

  const bookingSummary: IBookingSummary = {
    primaryGuestName: data?.primaryGuestName || "—",
    phoneNumber: data?.phoneNumber || "—",
    email: data?.email || "—",
    totalAmount: data?.totalAmount || 0,
    discountAmount: data?.discountAmount || 0,
    depositAmount: data?.depositAmount || 0,
    leftAmount: data?.leftAmount || 0,
    createdAt: data?.createdAt || "—",
    notes: data?.notes || "—",
  };

  return (
    <Stack justifyContent={"space-between"} spacing={2} mb={2}>
      <PageTitle
        title="Quản lý yêu cầu đặt phòng"
        subtitle="Xem chi tiết yêu cầu đặt phòng"
      />
      {/* Top bar */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          aria-label="Quay lại danh sách"
        >
          Quay lại
        </Button>
      </Stack>

      {/* Page title */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Booking {data?.id || "—"}
          </Typography>
          {statusChip}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Edit />}
            onClick={() => setOpenEdit(true)}
            aria-label="Chỉnh sửa booking"
          >
            Chỉnh sửa
          </Button>
          {data?.status === EBookingStatus.Pending && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setOpenCancel(true)}
              aria-label="Hủy booking"
            >
              Hủy
            </Button>
          )}

          {(data?.status === EBookingStatus.Cancelled ||
            data?.status === EBookingStatus.Pending) && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<Check />}
              onClick={() => {
                toast.warning("Tính năng đang trong quá trình hoàn thành");
              }}
              aria-label="Xác nhận booking"
            >
              Xác nhận
            </Button>
          )}
          <Button
            variant="contained"
            color="success"
            onClick={() => setOpenCheckout(true)}
          >
            Thanh toán & xuất hóa đơn
          </Button>
        </Stack>
      </Stack>

      {/* Booking Summary */}
      <Stack sx={{ mb: 2 }}>
        <BookingSummary
          data={bookingSummary}
          dateRange={{
            start: dateRange.start,
            end: dateRange.end,
            nights: dateRange.nights,
          }}
          formatCurrency={formatCurrency}
        />
      </Stack>

      {/* Call logs */}
      <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
        <CardHeader
          title={
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={0.5}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="primary"
                gutterBottom
              >
                Nhật ký cuộc gọi
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PhoneIcon />}
                onClick={() => setOpenCall(true)}
              >
                Gọi khách
              </Button>
            </Stack>
          }
        />
        <CallLogsDisplay data={data?.callLogs || []} />
      </Card>

      {/* Chi tiết phòng: gán phòng & check-in theo từng phòng của loại */}
      <Stack spacing={1}>
        <Typography variant="h6" fontWeight={800}>
          Gán Phòng & Check-in, Check-out
        </Typography>

        <RoomTypeAssignCheckIn booking={data as any} onRefresh={fetch} />
      </Stack>

      {/* Update Booking Modal */}
      <BookingFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        mode="update"
        bookingData={data as any}
        onUpdate={handleUpdate}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        booking={data as any}
        onSubmitted={fetch}
      />

      {/* Call Log Modal */}
      <CallLogModal
        open={openCall}
        onClose={() => setOpenCall(false)}
        booking={data as any}
        onSubmitted={fetch}
      />

      <Dialog open={openCheckout} onClose={() => setOpenCheckout(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thanh toán & xuất hóa đơn</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Mã giảm giá"
                fullWidth
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label="Số tiền thanh toán"
                type="number"
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                select
                label="Hình thức"
                fullWidth
                value={paymentType}
                onChange={(e) => setPaymentType(Number(e.target.value) as any)}
              >
                <MenuItem value={0}>Tiền mặt</MenuItem>
                <MenuItem value={1}>Thẻ</MenuItem>
                <MenuItem value={2}>Chuyển khoản</MenuItem>
                <MenuItem value={3}>Khác</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={<Checkbox checked={earlyCheckIn} onChange={(e) => setEarlyCheckIn(e.target.checked)} />}
                  label="Early check-in"
                />
                <FormControlLabel
                  control={<Checkbox checked={lateCheckOut} onChange={(e) => setLateCheckOut(e.target.checked)} />}
                  label="Late check-out"
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckout(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!id) return;
              try {
                const res = await bookingsApi.checkOut(id, {
                  discountCode: discountCode || undefined,
                  finalPayment: paymentAmount > 0 ? { amount: paymentAmount, type: paymentType } : undefined,
                  earlyCheckIn,
                  lateCheckOut,
                });
                if (res.isSuccess) {
                  toast.success("Xuất hóa đơn thành công");
                  setOpenCheckout(false);
                  await fetch();
                } else {
                  toast.error(res.message || "Không thể xuất hóa đơn");
                }
              } catch {
                toast.error("Đã xảy ra lỗi khi xuất hóa đơn");
              }
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default BookingDetailsPage;
