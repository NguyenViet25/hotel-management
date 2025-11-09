import React, { useMemo } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, InputAdornment, Stack } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EventIcon from "@mui/icons-material/Event";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import bookingsApi, { type CreateBookingDto, type PaymentType } from "../../../../../api/bookingsApi";
import type { RoomDto } from "../../../../../api/roomsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  hotelId?: string;
  rooms: RoomDto[];
  onSubmitted?: () => void;
};

type FormValues = {
  roomId: string;
  startDate: any;
  endDate: any;
  primaryGuestName: string;
  primaryGuestPhone: string;
  depositAmount: number;
  depositPaymentType: PaymentType;
  notes?: string;
};

const BookingFormModal: React.FC<Props> = ({ open, onClose, hotelId, rooms, onSubmitted }) => {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      roomId: "",
      startDate: dayjs(),
      endDate: dayjs().add(1, "day"),
      primaryGuestName: "",
      primaryGuestPhone: "",
      depositAmount: 0,
      depositPaymentType: 0,
      notes: "",
    },
  });

  const submit = async (values: FormValues) => {
    const payload: CreateBookingDto = {
      hotelId: hotelId ?? "",
      roomId: values.roomId,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      primaryGuest: {
        fullName: values.primaryGuestName,
        phone: values.primaryGuestPhone,
      },
      depositAmount: Number(values.depositAmount) || 0,
      depositPayment: { amount: Number(values.depositAmount) || 0, type: values.depositPaymentType },
      notes: values.notes || undefined,
    };
    try {
      const res = await bookingsApi.create(payload);
      if (res.isSuccess) {
        onSubmitted?.();
        onClose();
        reset();
      }
    } catch (err) {}
  };

  const paymentOptions = useMemo(() => [
    { value: 0, label: "Tiền mặt" },
    { value: 1, label: "Thẻ" },
    { value: 2, label: "Chuyển khoản" },
    { value: 3, label: "Khác" },
  ], []);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo booking với tiền cọc</DialogTitle>
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
              <Controller name="primaryGuestName" control={control} rules={{ required: true }} render={({ field }) => (
                <TextField label="Tên khách" required fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> }} {...field} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="primaryGuestPhone" control={control} rules={{ required: true }} render={({ field }) => (
                <TextField label="SĐT" required fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }} {...field} />
              )} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller name="depositAmount" control={control} render={({ field }) => (
                <TextField label="Tiền cọc" type="number" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment> }} {...field} />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="depositPaymentType" control={control} render={({ field }) => (
                <TextField select label="Hình thức cọc" fullWidth {...field}>
                  {paymentOptions.map((p) => (
                    <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                  ))}
                </TextField>
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
          <Button variant="contained" onClick={handleSubmit(submit)}>Tạo</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default BookingFormModal;