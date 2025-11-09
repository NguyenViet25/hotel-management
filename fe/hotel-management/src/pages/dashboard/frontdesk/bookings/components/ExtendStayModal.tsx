import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Alert,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import bookingsApi, { type BookingDto } from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  onSubmitted?: () => void;
};

const ExtendStayModal: React.FC<Props> = ({ open, onClose, booking, onSubmitted }) => {
  const [newEnd, setNewEnd] = useState<Dayjs | null>(booking ? dayjs(booking.endDate) : null);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!booking || !newEnd) return;
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsApi.extendStay(booking.id, {
        newEndDate: newEnd.toDate().toISOString(),
        discountCode: discountCode || undefined,
      });
      if ((res as any)?.isSuccess && (res as any)?.data) {
        const data = (res as any).data;
        setPrice(data.price ?? null);
        onSubmitted?.();
        onClose();
      } else {
        setError((res as any)?.message || "Không thể gia hạn");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gia hạn thêm đêm</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Ngày trả phòng mới"
              value={newEnd}
              onChange={(v) => setNewEnd(v)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
          <TextField
            label="Mã giảm giá (tuỳ chọn)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            fullWidth
          />
          {price !== null && (
            <Typography variant="body2" color="text.secondary">
              Giá dự kiến: {price.toLocaleString()} VND
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !booking || !newEnd}>
          {loading ? "Đang xử lý..." : "Xác nhận gia hạn"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtendStayModal;