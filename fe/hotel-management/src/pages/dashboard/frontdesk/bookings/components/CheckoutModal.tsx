import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import bookingsApi, { type BookingDto, type PaymentType } from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  onSubmitted?: (summary?: string) => void;
};

const paymentTypes: { value: PaymentType; label: string }[] = [
  { value: 0, label: "Tiền mặt" },
  { value: 1, label: "Thẻ" },
  { value: 2, label: "Chuyển khoản" },
  { value: 3, label: "Khác" },
];

const CheckoutModal: React.FC<Props> = ({ open, onClose, booking, onSubmitted }) => {
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<number | "">("");
  const [finalPaymentType, setFinalPaymentType] = useState<PaymentType>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!booking) return;
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsApi.checkOut(booking.id, {
        earlyCheckIn,
        lateCheckOut,
        discountCode: discountCode || undefined,
        finalPayment:
          finalPaymentAmount !== "" && Number(finalPaymentAmount) > 0
            ? { amount: Number(finalPaymentAmount), type: finalPaymentType }
            : undefined,
      });
      if ((res as any)?.isSuccess) {
        const total = (res as any)?.data?.totalPaid;
        const summary = typeof total === "number" ? `Tổng đối soát: ${total.toLocaleString()} VND` : undefined;
        onSubmitted?.(summary);
        onClose();
      } else {
        setError((res as any)?.message || "Không thể check-out");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Check-out & đối soát</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Hệ thống tự động tính phát sinh (minibar, giờ thêm, khách thêm) nếu có.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControlLabel
            control={<Checkbox checked={earlyCheckIn} onChange={(e) => setEarlyCheckIn(e.target.checked)} />}
            label="Có check-in sớm"
          />
          <FormControlLabel
            control={<Checkbox checked={lateCheckOut} onChange={(e) => setLateCheckOut(e.target.checked)} />}
            label="Có check-out muộn"
          />
          <TextField
            label="Mã giảm giá (tuỳ chọn)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Thanh toán cuối (VND)"
              type="number"
              value={finalPaymentAmount}
              onChange={(e) => setFinalPaymentAmount(e.target.value === "" ? "" : Number(e.target.value))}
              fullWidth
            />
            <TextField
              select
              label="Hình thức"
              value={finalPaymentType}
              onChange={(e) => setFinalPaymentType(Number(e.target.value) as PaymentType)}
              fullWidth
            >
              {paymentTypes.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !booking}>
          {loading ? "Đang xử lý..." : "Xác nhận Check-out"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutModal;