import React, { useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, InputAdornment, Stack } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EventIcon from "@mui/icons-material/Event";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import bookingsApi, { type UpdateBookingDto, type BookingDto } from "../../../../../api/bookingsApi";
import type { RoomDto } from "../../../../../api/roomsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  rooms: RoomDto[];
  onSubmitted?: () => void;
};

type FormValues = {
  roomId: string;
  startDate: any;
  endDate: any;
  depositAmount: number;
  notes?: string;
};

const EditBookingFormModal: React.FC<Props> = ({ open, onClose, booking, rooms, onSubmitted }) => {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      roomId: "",
      startDate: dayjs(),
      endDate: dayjs().add(1, "day"),
      depositAmount: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (booking) {
      reset({
        roomId: booking.roomId,
        startDate: dayjs(booking.startDate),
        endDate: dayjs(booking.endDate),
        depositAmount: booking.depositAmount,
        notes: booking.notes ?? "",
      });
    }
  }, [booking, reset]);

  const submit = async (values: FormValues) => {
    if (!booking) return;
    const payload: UpdateBookingDto = {
      roomId: values.roomId,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      depositAmount: Number(values.depositAmount) || 0,
      notes: values.notes || undefined,
    };
    try {
      const res = await bookingsApi.update(booking.id, payload);
      if (res.isSuccess) {
        onSubmitted?.();
        onClose();
      }
    } catch (err) {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh sửa booking</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Controller name="roomId" control={control} rules={{ required: true }} render={({ field }) => (
                <TextField select label="Phòng" required fullWidth {...field}>
                  {rooms.map((r) => (
                    <MenuItem key={r.id} value={r.id}>{`${r.number} (${r.typeName ?? r.typeId})`}</MenuItem>
                  ))}
                </TextField>
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="startDate" control={control} rules={{ required: true }} render={({ field }) => (
                <DatePicker label="Từ" value={field.value} onChange={field.onChange} slotProps={{ textField: { fullWidth: true, InputProps: { startAdornment: <InputAdornment position="start"><EventIcon fontSize="small" /></InputAdornment> } } }} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="endDate" control={control} rules={{ required: true }} render={({ field }) => (
                <DatePicker label="Đến" value={field.value} onChange={field.onChange} slotProps={{ textField: { fullWidth: true, InputProps: { startAdornment: <InputAdornment position="start"><EventIcon fontSize="small" /></InputAdornment> } } }} />
              )} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller name="depositAmount" control={control} render={({ field }) => (
                <TextField label="Tiền cọc" type="number" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment> }} {...field} />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="notes" control={control} render={({ field }) => (
                <TextField label="Ghi chú" multiline minRows={2} fullWidth {...field} />
              )} />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: "100%" }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit(submit)}>Lưu</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default EditBookingFormModal;