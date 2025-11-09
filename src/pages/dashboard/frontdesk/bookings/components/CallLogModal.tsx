import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, Stack } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import bookingsApi, { type BookingDto, type CallResult } from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  onSubmitted?: () => void;
};

type FormValues = {
  callTime?: string;
  result: CallResult;
  notes?: string;
};

const CallLogModal: React.FC<Props> = ({ open, onClose, booking, onSubmitted }) => {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      callTime: undefined,
      result: 0,
      notes: "",
    },
  });

  const submit = async (values: FormValues) => {
    if (!booking) return;
    try {
      const payload = { callTime: values.callTime, result: values.result, notes: values.notes || undefined };
      const res = await bookingsApi.createCallLog(booking.id, payload);
      if (res.isSuccess) {
        onSubmitted?.();
        onClose();
        reset();
      }
    } catch (err) {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gọi xác nhận (1 ngày trước check-in)</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller name="result" control={control} render={({ field }) => (
              <TextField select label="Kết quả" fullWidth {...field}>
                <MenuItem value={0}>Xác nhận</MenuItem>
                <MenuItem value={1}>Không nghe máy</MenuItem>
                <MenuItem value={2}>Huỷ</MenuItem>
              </TextField>
            )} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="notes" control={control} render={({ field }) => (
              <TextField label="Ghi chú" multiline minRows={2} fullWidth {...field} />
            )} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: "100%" }}>
          <Button onClick={onClose}>Đóng</Button>
          <Button variant="contained" onClick={handleSubmit(submit)}>Lưu</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CallLogModal;