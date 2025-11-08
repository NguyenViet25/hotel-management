import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Stack,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import bookingsApi, {
  type UpdateBookingDto,
  type BookingDto,
} from "../../../../../api/bookingsApi";
import roomsApi, { type RoomDto } from "../../../../../api/roomsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  onSubmitted?: () => void;
};

type FormValues = {
  roomId: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  depositAmount: number;
  notes?: string;
};

const EditBookingFormModal: React.FC<Props> = ({
  open,
  onClose,
  booking,
  onSubmitted,
}) => {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      roomId: "",
      startDate: null,
      endDate: null,
      depositAmount: 0,
      notes: "",
    },
  });
  const [rooms, setRooms] = useState<RoomDto[]>([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await roomsApi.getRooms({ page: 1, pageSize: 100 });
        const items = (res as any).data || (res as any).items || [];
        setRooms(items);
      } catch {}
    };
    if (open) loadRooms();
  }, [open]);

  useEffect(() => {
    if (booking && open) {
      reset({
        roomId: booking.roomId,
        startDate: booking.startDate ? dayjs(booking.startDate) : null,
        endDate: booking.endDate ? dayjs(booking.endDate) : null,
        depositAmount: booking.depositAmount ?? 0,
        notes: booking.notes ?? "",
      });
    }
  }, [booking, open, reset]);

  const submit = async (values: FormValues) => {
    if (!booking) return;
    const payload: UpdateBookingDto = {
      roomId: values.roomId || undefined,
      startDate: values.startDate
        ? values.startDate.toDate().toISOString()
        : undefined,
      endDate: values.endDate
        ? values.endDate.toDate().toISOString()
        : undefined,
      depositAmount: Number(values.depositAmount) || undefined,
      notes: values.notes || undefined,
    };
    try {
      const res = await bookingsApi.update(booking.id, payload);
      if ((res as any).isSuccess) {
        onSubmitted?.();
        onClose();
        reset();
      }
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh sửa booking</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <TextField select label="Phòng" fullWidth {...field}>
                  {rooms.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.number} — {r.typeName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Từ"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Đến"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="depositAmount"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Tiền cọc"
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
          <Grid item xs={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Ghi chú"
                  multiline
                  minRows={2}
                  fullWidth
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
          <Button variant="contained" onClick={handleSubmit(submit)}>
            Lưu
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default EditBookingFormModal;
