import { zodResolver } from "@hookform/resolvers/zod";
import { AddCircle } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import HotelIcon from "@mui/icons-material/Hotel";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingRoomTypeDto,
  type CreateBookingDto,
  type UpdateBookingDto,
} from "../../../../../api/bookingsApi";
import roomTypesApi, { type RoomType } from "../../../../../api/roomTypesApi";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import RoomBookingSection from "./RoomBookingSection";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  mode?: "create" | "update";
  bookingData?: BookingDetailsDto | null;
  onUpdate?: (data: UpdateBookingDto) => void;
};

// Price/projection calculation will be handled client-side
const dayjsValidator = z.custom<Dayjs>((v) => dayjs.isDayjs(v) && v.isValid(), {
  message: "Ngày không hợp lệ",
});

const roomItemSchema = z
  .object({
    roomId: z.string().min(1, "Vui lòng chọn loại phòng"),
    startDate: dayjsValidator.nullable(),
    endDate: dayjsValidator.nullable(),
    totalRooms: z.coerce
      .number("Số lượng phòng phải là số")
      .int("Số lượng phòng phải là số nguyên")
      .min(1, "Tối thiểu 1 phòng"),
    price: z.coerce.number("Giá phòng phải là số").min(1, "Giá tối thiểu là 1"),
    rooms: z.array(
      z
        .object({
          roomId: z.string().min(1, "Vui lòng chọn phòng"),
        })
        .optional()
    ),
  })
  .refine(
    (data) =>
      !!data.startDate &&
      !!data.endDate &&
      (data.endDate as Dayjs).isAfter(data.startDate as Dayjs),
    { message: "Đến ngày phải sau Từ ngày", path: ["endDate"] }
  );

const schema = z.object({
  guestName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  guestPhone: z
    .string()
    .min(10, "SĐT tối thiểu 10 ký tự")
    .max(20, "SĐT tối đa 20 ký tự")
    .regex(/^[+0-9\-\s()]+$/, "SĐT chỉ gồm số và ký tự phổ biến"),
  guestEmail: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  roomTypes: z.array(roomItemSchema).min(1, "Thêm ít nhất 1 phòng"),

  depositAmount: z.coerce
    .number("Tiền cọc phải là số")
    .min(0, "Tiền cọc không âm"),
  totalAmount: z.coerce
    .number("Tổng tiền phải là số")
    .min(0, "Không âm")
    .optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// Currency helper
const formatCurrency = (value: number) => value.toLocaleString();

const BookingFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmitted,
  mode = "create",
  bookingData,
  onUpdate,
}) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const { user } = useStore<StoreState>((state) => state);
  const [reloadCount, setReloadCount] = useState<number>(0);
  const hotelId = user?.hotelId || "";
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      roomTypes: [
        {
          roomId: "",
          startDate: dayjs(),
          endDate: dayjs().add(1, "day"),
          totalRooms: 1,
          price: 0,
          rooms: [],
        },
      ],
      depositAmount: 0,
      notes: "",
      totalAmount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "roomTypes",
    control,
  });

  const roomsWatch = watch("roomTypes") || [];
  const depositAmount = watch("depositAmount") || 0;
  const discountAmount = 0;
  const totalAmount = watch("totalAmount") || 0;
  const afterDiscount = totalAmount - discountAmount - depositAmount;

  useEffect(() => {
    if (roomTypes.length > 0 && mode === "create") {
      // Initialize first room section defaults
      setValue("roomTypes.0.roomId", roomTypes[0].id);
      setValue("roomTypes.0.price", roomTypes[0].priceFrom || 0);
    }
  }, [roomTypes, mode]);

  useEffect(() => {
    // Keep price synced when room type changes
    roomsWatch.forEach((r, idx) => {
      const p = roomTypes.find((t) => t.id === r.roomId)?.priceFrom || 0;
      if (p && p !== r.price) setValue(`roomTypes.${idx}.price`, p);
    });
  }, [roomsWatch.map((r) => r.roomId).join("|"), roomTypes]);

  useEffect(() => {
    // Recalculate total amount whenever rooms change
    const total = roomsWatch.reduce((sum, r) => {
      const days =
        r.endDate && r.startDate
          ? Math.max(dayjs(r.endDate).diff(dayjs(r.startDate), "day"), 0)
          : 0;
      const amount = (r.price || 0) * days * (r.totalRooms || 0);
      return sum + amount;
    }, 0);

    setValue("totalAmount", total);
  }, [roomsWatch, roomTypes, reloadCount]);

  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const res = await roomTypesApi.getRoomTypes({
          hotelId,
          page: 1,
          pageSize: 100,
        });
        setRoomTypes((res as any).items || res.data || []);
      } catch {}
    };
    if (open) loadRoomTypes();
  }, [open, hotelId]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Prefill form when updating an existing booking
  useEffect(() => {
    if (mode !== "update" || !bookingData) return;
    try {
      setValue("guestName", bookingData.primaryGuestName || "");
      setValue("guestPhone", bookingData.phoneNumber || "");
      setValue("guestEmail", bookingData.email || "");

      const brts: BookingRoomTypeDto[] =
        (bookingData as any).bookingRoomTypes || [];
      const mapped = brts.map((rt) => {
        const rooms = (rt.bookingRooms || []).map((r) => ({
          roomId: r.roomId,
        }));

        const startDate = dayjs(rt.startDate);
        const endDate = dayjs(rt.endDate);
        return {
          roomId: rt.roomTypeId,
          startDate,
          endDate,
          totalRooms: rt.totalRoom || rooms.length || 1,
          price: rt.price || 0,
          rooms,
        };
      });
      if (mapped.length > 0) setValue("roomTypes", mapped as any);
      setValue("depositAmount", (bookingData as any).depositAmount || 0);
      setValue("notes", (bookingData as any).notes || "");
      setValue("totalAmount", (bookingData as any).totalAmount || 0);
    } catch {}
  }, [mode, bookingData, setValue]);

  const submit = async (values: FormValues) => {
    try {
      if (values.roomTypes.length === 0) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn loại phòng",
          severity: "error",
        });
        return;
      }

      if (afterDiscount < 0) {
        setSnackbar({
          open: true,
          message: "Số tiền còn lại không hợp lệ",
          severity: "error",
        });
        return;
      }

      // Update booking flow
      if (mode === "update" && bookingData?.id) {
        const payload: UpdateBookingDto = {
          hotelId: hotelId,
          primaryGuest: {
            fullname: values.guestName || "",
            phone: values.guestPhone,
            email: values.guestEmail || undefined,
          },
          deposit: values.depositAmount || 0,
          discount: 0,
          total: values.totalAmount || 0,
          left: (values.totalAmount || 0) - (values.depositAmount || 0) - 0,
          notes: values.notes || undefined,
          roomTypes: values.roomTypes.map((rt) => ({
            roomTypeId: rt.roomId,
            price: rt.price || 0,
            capacity: 0,
            totalRoom: rt.totalRooms || 0,
            startDate: rt.startDate,
            endDate: rt.endDate,
            rooms: rt.rooms.map((r) => ({
              roomId: r?.roomId,
              startDate: rt.startDate,
              endDate: rt.endDate,
              guests: [],
            })),
          })) as any,
        };
        onUpdate?.(payload);
        onClose();
        reset();
        return;
      }

      const payload: CreateBookingDto = {
        hotelId: hotelId,
        primaryGuest: {
          fullname: values.guestName || "",
          phone: values.guestPhone,
          email: values.guestEmail || undefined,
        },
        deposit: values.depositAmount || 0,
        discount: 0,
        total: values.totalAmount || 0,
        left: (values.totalAmount || 0) - (values.depositAmount || 0) - 0,
        notes: values.notes || undefined,
        roomTypes: values.roomTypes.map((rt) => ({
          roomTypeId: rt.roomId,
          price: rt.price || 0,
          capacity: 0,
          totalRoom: rt.totalRooms || 0,
          startDate: rt.startDate,
          endDate: rt.endDate,
          rooms: rt.rooms.map((r) => ({
            roomId: r?.roomId,
            startDate: rt.startDate,
            endDate: rt.endDate,
            guests: [],
          })),
        })) as any,
      };
      const results = await bookingsApi.create(payload);

      const ok = results.isSuccess;
      if (ok) {
        onSubmitted?.();
        onClose();
        reset();
      }
    } catch (e: any) {
      console.log("e", e);
      const msg =
        e?.message || "Không thể tạo booking. Vui lòng kiểm tra dữ liệu.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <HotelIcon color="primary" />
          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {mode === "update"
              ? "Chỉnh sửa yêu cầu đặt phòng"
              : "Tạo yêu cầu đặt phòng"}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 1.5 }}>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {/* Customer info */}
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
                    error={!!errors.guestName}
                    helperText={errors.guestName?.message}
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
                    error={!!errors.guestPhone}
                    helperText={errors.guestPhone?.message}
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
                    error={!!errors.guestEmail}
                    helperText={errors.guestEmail?.message}
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

          {/* Room sections */}
          <Stack spacing={2}>
            <Stack
              spacing={2}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
              >
                2. Thông tin phòng
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<AddCircle />}
                onClick={() =>
                  append({
                    roomId: roomTypes[0]?.id || "",
                    startDate: dayjs(),
                    endDate: dayjs().add(1, "day"),
                    totalRooms: 1,
                    price: roomTypes[0]?.priceFrom || 0,
                    rooms: [],
                  })
                }
              >
                Thêm mục
              </Button>
            </Stack>

            <Stack spacing={2}>
              {fields.map((f, idx) => (
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <RoomBookingSection
                      index={idx}
                      control={control}
                      errors={errors}
                      roomTypes={roomTypes}
                      onRemove={() => remove(idx)}
                      setReloadCount={setReloadCount}
                    />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Summary & Payment */}
          <Stack spacing={2}>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.secondary"
            >
              3. Tóm tắt & Thanh toán
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Tổng tiền"
                value={formatCurrency(watch("totalAmount") || 0)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">VND</InputAdornment>
                  ),
                  disabled: true,
                }}
              />

              <Controller
                name="depositAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Tiền cọc"
                    type="number"
                    fullWidth
                    error={!!errors.depositAmount}
                    helperText={errors.depositAmount?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">VND</InputAdornment>
                      ),
                    }}
                    {...field}
                  />
                )}
              />

              <TextField
                label="Còn lại"
                value={formatCurrency(afterDiscount)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">VND</InputAdornment>
                  ),
                  disabled: true,
                }}
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
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
            onClick={handleSubmit(submit as any)}
            startIcon={<SaveIcon />}
          >
            {mode === "update" ? "Cập nhật" : "Lưu yêu cầu"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default BookingFormModal;
