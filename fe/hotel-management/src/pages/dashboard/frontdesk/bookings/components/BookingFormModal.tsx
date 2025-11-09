import { RoomPreferences } from "@mui/icons-material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import HotelIcon from "@mui/icons-material/Hotel";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SaveIcon from "@mui/icons-material/Save";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import bookingsApi, {
  type CreateBookingDto,
} from "../../../../../api/bookingsApi";
import roomTypesApi, { type RoomType } from "../../../../../api/roomTypesApi";

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
  guestEmail?: string;
  totalRooms?: number;
  depositAmount: number;
  discountAmount?: number;
  discountPercent?: number;
  totalAmount?: number;
  notes?: string;
  price: number;
};

const BookingFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmitted,
  hotelId,
}) => {
  const [rooms, setRooms] = useState<RoomType[]>([]);

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>(
    {
      defaultValues: {
        roomId: rooms.length > 0 ? rooms[0].id : "",
        startDate: dayjs(),
        endDate: dayjs().add(1, "day"),
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        totalRooms: 1,
        depositAmount: 0,
        discountAmount: 0,
        discountPercent: 0,
        notes: "",
        price: 0,
        totalAmount: 0,
      },
    }
  );

  const roomId = watch("roomId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const discountPercent = watch("discountPercent") || 0;
  const discountAmount = watch("discountAmount") || 0;
  const totalRooms = watch("totalRooms") || 1;

  useEffect(() => {
    if (rooms.length > 0) {
      setValue("roomId", rooms[0].id);
      setValue("price", rooms[0].priceFrom || 0);
    }
  }, [rooms]);

  useEffect(() => {
    const price = rooms.find((r) => r.id === roomId)?.priceFrom || 0;
    const days = endDate?.diff(startDate, "day") || 0;
    const discountPercentAmount = price * (discountPercent / 100);
    const totalAmount =
      price * days * totalRooms - discountAmount - discountPercentAmount;

    setValue("price", price);
    setValue("totalAmount", totalAmount);
  }, [roomId, startDate, endDate, discountAmount, discountPercent, totalRooms]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await roomTypesApi.getRoomTypes({
          hotelId,
          page: 1,
          pageSize: 100,
        });

        setRooms((res as any).items || res.data || []);
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
      primaryGuest: {
        fullName: values.guestName,
        phone: values.guestPhone,
        email: values.guestEmail || undefined,
      },
      depositAmount: Number(values.depositAmount) || 0,

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <HotelIcon color="primary" />
          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            Đặt phòng có cọc
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack spacing={2}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.secondary"
            >
              1. Thông tin khách hàng
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="guestName"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    label="Họ tên KH"
                    fullWidth
                    required
                    placeholder="Nhập họ tên khách hàng"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    {...field}
                  />
                )}
              />
              <Controller
                name="guestPhone"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    label="SĐT"
                    fullWidth
                    required
                    placeholder="Nhập số điện thoại khách hàng"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    {...field}
                  />
                )}
              />
              <Controller
                name="guestEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    placeholder="Nhập email khách hàng"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    {...field}
                  />
                )}
              />
            </Stack>
          </Stack>

          <Divider />
          <Stack spacing={2}>
            <Stack spacing={2} direction="row" alignItems="center">
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
              >
                2. Thông tin phòng
              </Typography>
              {/* 
              <Button
                size="small"
                variant="contained"
                startIcon={<RemoveRedEye fontSize="small" />}
              >
                Xem giá loại phòng
              </Button> */}
            </Stack>
            <Controller
              name="roomId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  select
                  label="Loại phòng"
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MeetingRoomIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                >
                  {rooms.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      <Stack>
                        <Typography fontWeight={600}> {r.name}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {r.priceFrom.toLocaleString()} đ -{" "}
                          {r.priceTo.toLocaleString()} đ
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Giá phòng (VND)"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">VND</InputAdornment>
                      ),
                      inputProps: { min: 1 },
                      sx: { height: "100%" },
                    }}
                    {...field}
                  />
                )}
              />
              <Controller
                name="totalRooms"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Số lượng phòng"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <RoomPreferences fontSize="small" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1 },
                      sx: { height: "100%" },
                    }}
                    {...field}
                  />
                )}
              />
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DatePicker
                      label="Từ ngày"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarTodayIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DatePicker
                      label="Đến ngày"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarTodayIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={2}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.secondary"
            >
              3. Thanh toán
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="depositAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Tiền cọc"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">VND</InputAdornment>
                      ),
                    }}
                    {...field}
                  />
                )}
              />
              <Controller
                name="discountPercent"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Giảm giá (%)"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">%</InputAdornment>
                      ),
                    }}
                    {...field}
                  />
                )}
              />
              <Controller
                name="discountAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Giảm giá cố định (VND)"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">VND</InputAdornment>
                      ),
                    }}
                    {...field}
                  />
                )}
              />
              <Controller
                name="totalAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Tiền phòng ước tính (sau giảm)"
                    type="number"
                    fullWidth
                    disabled
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">VND</InputAdornment>
                      ),
                      sx: { color: "black" },
                    }}
                    {...field}
                  />
                )}
              />
            </Stack>
          </Stack>

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                label="Ghi chú"
                multiline
                minRows={2}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                {...field}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ width: "100%" }}
        >
          <Button onClick={onClose} startIcon={<CloseIcon />}>
            Đóng
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(submit)}
            startIcon={<SaveIcon />}
          >
            Lưu yêu cầu
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default BookingFormModal;
