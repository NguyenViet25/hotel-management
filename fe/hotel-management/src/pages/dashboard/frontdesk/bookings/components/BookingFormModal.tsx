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
  type CreateBookingDto,
  type PaymentType,
} from "../../../../../api/bookingsApi";
import roomsApi, { type RoomDto } from "../../../../../api/roomsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  hotelId?: string;
};

type FormValues = {
  roomId: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  guestName: string;
  guestPhone: string;
  depositAmount: number;
  depositType: PaymentType;
  notes?: string;
};

const BookingFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmitted,
  hotelId,
}) => {
  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      roomId: "",
      startDate: dayjs(),
      endDate: dayjs().add(1, "day"),
      guestName: "",
      guestPhone: "",
      depositAmount: 0,
      depositType: 0,
      notes: "",
    },
  });
  const [rooms, setRooms] = useState<RoomDto[]>([]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await roomsApi.getRooms({
          hotelId,
          page: 1,
          pageSize: 100,
        });
        const items = (res as any).data || (res as any).items || [];
        setRooms(items);
      } catch {}
    };
    if (open) loadRooms();
  }, [open, hotelId]);

  const submit = async (values: FormValues) => {
    if (!values.startDate || !values.endDate) return;
    const payload: CreateBookingDto = {
      hotelId:
        hotelId || rooms.find((r) => r.id === values.roomId)?.hotelId || "",
      roomId: values.roomId,
      startDate: values.startDate.toDate().toISOString(),
      endDate: values.endDate.toDate().toISOString(),
      primaryGuest: { fullName: values.guestName, phone: values.guestPhone },
      depositAmount: Number(values.depositAmount) || 0,
      depositPayment: {
        amount: Number(values.depositAmount) || 0,
        type: values.depositType,
      },
      notes: values.notes || undefined,
    };
    try {
      const res = await bookingsApi.create(payload);
      if ((res as any).isSuccess) {
        onSubmitted?.();
        onClose();
        reset();
      }
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo booking</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller
              name="roomId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField select label="Phòng" fullWidth required {...field}>
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
                rules={{ required: true }}
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
                rules={{ required: true }}
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
              name="guestName"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField label="Tên khách" fullWidth required {...field} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="guestPhone"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField label="SĐT" fullWidth required {...field} />
              )}
            />
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
          <Grid item xs={12} sm={6}>
            <Controller
              name="depositType"
              control={control}
              render={({ field }) => (
                <TextField select label="Hình thức cọc" fullWidth {...field}>
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
            Tạo
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default BookingFormModal;
