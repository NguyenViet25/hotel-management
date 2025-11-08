import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import bookingsApi, {
  type CancelBookingDto,
  type BookingDto,
  type PaymentType,
} from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  onSubmitted?: () => void;
};

type FormValues = {
  reason: string;
  refundAmount: number;
  refundType: PaymentType;
  deductAmount?: number;
};

const CancelBookingModal: React.FC<Props> = ({
  open,
  onClose,
  booking,
  onSubmitted,
}) => {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      reason: "",
      refundAmount: 0,
      refundType: 0,
      deductAmount: 0,
    },
  });

  const submit = async (values: FormValues) => {
    if (!booking) return;
    const payload: CancelBookingDto = {
      reason: values.reason,
      refundAmount: Number(values.refundAmount) || 0,
      refundType: values.refundType,
      deductAmount:
        (values.deductAmount ?? 0) > 0
          ? Number(values.deductAmount)
          : undefined,
    };
    try {
      const res = await bookingsApi.cancel(booking.id, payload);
      if (res.isSuccess) {
        onSubmitted?.();
        onClose();
        reset();
      }
    } catch (err) {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Hủy booking & xử lý tiền cọc</DialogTitle>
      <DialogContent>
        {booking && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Booking: {booking.id} — Phòng {booking.roomNumber} — Khách{" "}
            {booking.primaryGuest?.fullName}
          </Typography>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller
              name="reason"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  label="Lý do"
                  required
                  multiline
                  minRows={2}
                  fullWidth
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="refundAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Hoàn cọc"
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="refundType"
              control={control}
              render={({ field }) => (
                <TextField select label="Hình thức hoàn" fullWidth {...field}>
                  <MenuItem value={0}>Tiền mặt</MenuItem>
                  <MenuItem value={1}>Thẻ</MenuItem>
                  <MenuItem value={2}>Chuyển khoản</MenuItem>
                  <MenuItem value={3}>Khác</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="deductAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Khấu trừ (tuỳ chọn)"
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ width: "100%" }}
        >
          <Button onClick={onClose}>Đóng</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit(submit)}
          >
            Xác nhận hủy
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CancelBookingModal;
