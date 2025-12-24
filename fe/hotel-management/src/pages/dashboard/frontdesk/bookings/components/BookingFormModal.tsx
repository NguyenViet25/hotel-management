import { zodResolver } from "@hookform/resolvers/zod";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import HotelIcon from "@mui/icons-material/Hotel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Popover,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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
import pricingApi, {
  type PricingQuoteResponse,
} from "../../../../../api/pricingApi";
import roomTypesApi, { type RoomType } from "../../../../../api/roomTypesApi";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import { phoneSchema } from "../../../../../validation/phone";
import PriceCalendarRoomTypeDialog from "./PriceCalendarRoomTypeDialog";

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

const roomItemSchema = z.object({
  roomId: z.string().min(1, "Vui lòng chọn loại phòng"),
  totalRooms: z.coerce
    .number("Số lượng phòng phải là số")
    .int("Số lượng phòng phải là số nguyên")
    .min(1, "Tối thiểu 1 phòng"),
  price: z.coerce.number("Giá phòng phải là số").min(1, "Giá tối thiểu là 1"),
  rooms: z
    .array(
      z
        .object({
          roomId: z.string().min(1, "Vui lòng chọn phòng"),
        })
        .optional()
    )
    .optional(),
});

const schema = z
  .object({
    guestName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    guestPhone: phoneSchema,
    guestEmail: z
      .string()
      .email("Email không hợp lệ")
      .optional()
      .or(z.literal("")),
    checkInDate: dayjsValidator,
    checkOutDate: dayjsValidator,
    roomTypes: z.array(roomItemSchema).min(1, "Thêm ít nhất 1 phòng"),
    depositAmount: z.coerce
      .number("Tiền cọc phải là số")
      .min(0, "Tiền cọc không âm"),
    totalAmount: z.coerce
      .number("Tổng tiền phải là số")
      .min(0, "Không âm")
      .optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      !!data.checkInDate &&
      !!data.checkOutDate &&
      dayjs(data.checkOutDate as Dayjs).isAfter(
        dayjs(data.checkInDate as Dayjs)
      ),
    { message: "Đến ngày phải sau Từ ngày", path: ["checkOutDate"] }
  )
  .refine(
    (data) =>
      (data.roomTypes || []).reduce(
        (sum, r) => sum + (Number(r.totalRooms) || 0),
        0
      ) > 0,
    { message: "Chọn ít nhất 1 phòng", path: ["roomTypes"] }
  );

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
    clearErrors,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      checkInDate: dayjs(),
      checkOutDate: dayjs().add(1, "day"),
      roomTypes: [],
      depositAmount: 0,
      notes: "",
      totalAmount: 0,
    },
  });

  const { append, remove } = useFieldArray({
    name: "roomTypes",
    control,
  });

  const roomsWatch = watch("roomTypes") || [];
  const globalStart = watch("checkInDate");
  const globalEnd = watch("checkOutDate");
  const depositAmount = watch("depositAmount") || 0;
  const discountAmount = 0;
  const totalAmount = watch("totalAmount") || 0;
  const afterDiscount = totalAmount - discountAmount - depositAmount;
  const [quotesByIndex, setQuotesByIndex] = useState<
    Record<number, PricingQuoteResponse | null>
  >({});
  const [availabilityByIndex, setAvailabilityByIndex] = useState<
    Record<number, number>
  >({});
  const [availabilityByType, setAvailabilityByType] = useState<
    Record<string, number>
  >({});
  const [itemOpen, setItemOpen] = useState<Record<number, boolean>>({});
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [priceDialogRt, setPriceDialogRt] = useState<BookingRoomTypeDto | null>(
    null
  );
  const [desiredCounts, setDesiredCounts] = useState<Record<string, number>>(
    {}
  );
  const [pricePopoverType, setPricePopoverType] = useState<string | null>(null);
  const [pricePopoverAnchor, setPricePopoverAnchor] =
    useState<HTMLElement | null>(null);

  useEffect(() => {}, [roomTypes, mode]);

  useEffect(() => {
    if (mode !== "create") return;
    roomsWatch.forEach((r, idx) => {
      const p = roomTypes.find((t) => t.id === r.roomId)?.priceFrom || 0;
      if (p && p !== r.price) setValue(`roomTypes.${idx}.price`, p);
    });
  }, [roomsWatch.map((r) => r.roomId).join("|"), roomTypes, mode]);

  useEffect(() => {
    const fetchQuotes = async () => {
      const newQuotes: Record<number, PricingQuoteResponse | null> = {
        ...quotesByIndex,
      };
      await Promise.all(
        roomsWatch.map(async (r, idx) => {
          const roomTypeId = r.roomId;
          const startDate = globalStart;
          const endDate = globalEnd;
          if (
            roomTypeId &&
            startDate &&
            endDate &&
            dayjs(endDate).isAfter(dayjs(startDate))
          ) {
            try {
              const res = await pricingApi.quote({
                roomTypeId,
                checkInDate: dayjs(startDate).format("YYYY-MM-DD"),
                checkOutDate: dayjs(endDate).format("YYYY-MM-DD"),
              });
              if (res.isSuccess && res.data) {
                newQuotes[idx] = res.data;
              } else {
                newQuotes[idx] = null;
              }
            } catch {
              newQuotes[idx] = null;
            }
          } else {
            newQuotes[idx] = null;
          }
        })
      );
      // Adjust calendar prices:
      // - Keep specific override prices intact (from roomTypes.priceByDates)
      // - For base-price days, use the current input price (rt.price). If missing, use priceFrom.
      const enrichedQuotes: Record<number, PricingQuoteResponse | null> = {};
      roomsWatch.forEach((r, idx) => {
        const rt = roomTypes.find((t) => t.id === r.roomId);
        const overrides = (rt?.priceByDates || []).map((d) =>
          dayjs(d.date).format("YYYY-MM-DD")
        );
        const overrideSet = new Set(overrides);
        const inputPrice = r.price || rt?.priceFrom || 0;

        const start = globalStart ? dayjs(globalStart) : null;
        const end = globalEnd ? dayjs(globalEnd) : null;

        // Build items either from API or locally if API not available
        let items =
          newQuotes[idx]?.items && newQuotes[idx]?.items.length
            ? newQuotes[idx]!.items
            : [];

        if (
          (!items || items.length === 0) &&
          start &&
          end &&
          start.isBefore(end)
        ) {
          const temp: { date: string; price: number }[] = [];
          let cursor = start.clone();
          while (cursor.isBefore(end)) {
            const dateStr = cursor.format("YYYY-MM-DD");
            const overridePrice = rt?.priceByDates?.find(
              (p) => dayjs(p.date).format("YYYY-MM-DD") === dateStr
            )?.price;
            const weekend = cursor.day() === 5 || cursor.day() === 6;
            const base = weekend
              ? rt?.priceTo ?? inputPrice
              : rt?.priceFrom ?? inputPrice;
            temp.push({
              date: dateStr,
              price: overridePrice ?? base,
            });
            cursor = cursor.add(1, "day");
          }
          items = temp as any;
        } else {
          // Replace base-price days with current input price; keep overrides
          items = items.map((it) => {
            const d = dayjs(it.date).format("YYYY-MM-DD");
            const isOverride = overrideSet.has(d);
            const dow = dayjs(d).day();
            const weekend = dow === 5 || dow === 6;
            const base = weekend
              ? rt?.priceTo ?? inputPrice
              : rt?.priceFrom ?? inputPrice;
            return {
              ...it,
              price: isOverride ? it.price : base,
            };
          });
        }

        const total = items.reduce((s, it) => s + (it.price || 0), 0);
        enrichedQuotes[idx] = { items, total };
      });

      setQuotesByIndex(enrichedQuotes);
      const total = roomsWatch.reduce((sum, r, idx) => {
        const quote = enrichedQuotes[idx];
        const perRoomTotal = quote?.total ?? 0;
        return sum + perRoomTotal * (r.totalRooms || 0);
      }, 0);
      setValue("totalAmount", total);
      const availability: Record<number, number> = {};
      await Promise.all(
        roomsWatch.map(async (r, idx) => {
          const roomTypeId = r.roomId;
          const startDate = globalStart;
          const endDate = globalEnd;
          if (
            roomTypeId &&
            startDate &&
            endDate &&
            dayjs(endDate).isAfter(dayjs(startDate))
          ) {
            try {
              const a = await bookingsApi.roomAvailability({
                hotelId,
                from: dayjs(startDate).format("YYYY-MM-DD"),
                to: dayjs(endDate).format("YYYY-MM-DD"),
                typeId: roomTypeId,
              });
              availability[idx] = a?.data?.totalAvailable ?? 0;
            } catch {
              availability[idx] = 0;
            }
          } else {
            availability[idx] = 0;
          }
        })
      );
      setAvailabilityByIndex(availability);
    };
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsWatch, roomTypes, reloadCount]);

  useEffect(() => {
    const fetchAvailabilityByType = async () => {
      const startDate = globalStart;
      const endDate = globalEnd;
      if (!startDate || !endDate || !dayjs(endDate).isAfter(dayjs(startDate))) {
        setAvailabilityByType({});
        return;
      }
      const map: Record<string, number> = {};
      await Promise.all(
        roomTypes.map(async (t) => {
          try {
            const a = await bookingsApi.roomAvailability({
              hotelId,
              from: dayjs(startDate).format("YYYY-MM-DD"),
              to: dayjs(endDate).format("YYYY-MM-DD"),
              typeId: t.id,
            });
            map[t.id] = a?.data?.totalAvailable ?? 0;
          } catch {
            map[t.id] = 0;
          }
        })
      );
      setAvailabilityByType(map);
    };
    fetchAvailabilityByType();
  }, [
    roomTypes.map((t) => t.id).join("|"),
    globalStart,
    globalEnd,
    reloadCount,
    hotelId,
  ]);

  useEffect(() => {
    if (mode === "update") return;
    roomTypes.forEach((t) => {
      const avail = availabilityByType[t.id] ?? 0;
      const current = desiredCounts[t.id] ?? 0;
      if (current > avail) {
        setDesiredCounts((s) => ({ ...s, [t.id]: avail }));
        const idx = (roomsWatch || []).findIndex((r) => r.roomId === t.id);
        if (idx >= 0) setValue(`roomTypes.${idx}.totalRooms`, avail as any);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityByType, roomTypes.map((t) => t.id).join("|")]);
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
          totalRooms: rt.totalRoom || rooms.length || 1,
          price: rt.price || 0,
          rooms,
        };
      });
      if (mapped.length > 0) setValue("roomTypes", mapped as any);
      if (brts.length > 0) {
        const counts: Record<string, number> = {};
        brts.forEach((rt) => {
          const c = rt.totalRoom || rt.bookingRooms?.length || 1;
          counts[rt.roomTypeId] = c;
        });
        setDesiredCounts(counts);
      }
      // Set global date range based on booking data
      const minStart = brts
        .map((rt) => dayjs(rt.startDate))
        .reduce(
          (min, d) => (min && min.isBefore(d) ? min : d),
          dayjs(brts[0]?.startDate)
        );
      const maxEnd = brts
        .map((rt) => dayjs(rt.endDate))
        .reduce(
          (max, d) => (max && max.isAfter(d) ? max : d),
          dayjs(brts[0]?.endDate)
        );
      if (minStart && maxEnd) {
        setValue("checkInDate", minStart as any);
        setValue("checkOutDate", maxEnd as any);
      }

      setValue("depositAmount", (bookingData as any).depositAmount || 0);
      setValue("notes", (bookingData as any).notes || "");
      setValue("totalAmount", (bookingData as any).totalAmount || 0);
    } catch {}
  }, [mode, bookingData, setValue]);

  const submit = async (values: FormValues) => {
    try {
      const totalSelected = (values.roomTypes || []).reduce(
        (sum, r) => sum + (Number(r.totalRooms) || 0),
        0
      );
      if (values.roomTypes.length === 0 || totalSelected <= 0) {
        setSnackbar({
          open: true,
          message: "Vui lòng chọn ít nhất 1 phòng",
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
      let dynError = false;
      values.roomTypes.forEach((rt, idx) => {
        const t = roomTypes.find((x) => x.id === rt.roomId);
        const min = t?.priceFrom ?? 0;
        const max = t?.priceTo ?? Number.MAX_SAFE_INTEGER;
        if (rt.price < min || rt.price > max) {
          setError(
            `roomTypes.${idx}.price` as any,
            {
              type: "manual",
              message: `Đơn giá phải trong khoảng ${new Intl.NumberFormat(
                "vi-VN"
              ).format(min)} - ${new Intl.NumberFormat("vi-VN").format(max)} đ`,
            } as any
          );
          dynError = true;
        }
        if ((rt.totalRooms as any) > 100) {
          // removed static max 100 validation; dynamic availability validation is below
        }
        if ((rt.totalRooms as any) < 1) {
          setError(
            `roomTypes.${idx}.totalRooms` as any,
            {
              type: "manual",
              message: "Tối thiểu 1 phòng",
            } as any
          );
          dynError = true;
        }
      });
      if (dynError) {
        setSnackbar({
          open: true,
          message: "Vui lòng kiểm tra lỗi trong yêu cầu đặt phòng",
          severity: "error",
        });
        return;
      }
      const availabilityResults = await Promise.all(
        values.roomTypes.map(async (rt) => {
          try {
            const res = await bookingsApi.roomAvailability({
              hotelId,
              from: dayjs(globalStart as Dayjs).format("YYYY-MM-DD"),
              to: dayjs(globalEnd as Dayjs).format("YYYY-MM-DD"),
              typeId: rt.roomId,
            });
            return res?.data?.totalAvailable ?? 0;
          } catch {
            return 0;
          }
        })
      );
      let availabilityError = false;
      const originalCountsMap: Record<string, number> = {};
      if (mode === "update" && bookingData) {
        for (const rt of (bookingData as any)?.bookingRoomTypes || []) {
          const count = rt.totalRoom || rt.bookingRooms?.length || 0;
          originalCountsMap[rt.roomTypeId] = count;
        }
      }
      values.roomTypes.forEach((rt, idx) => {
        clearErrors(`roomTypes.${idx}.totalRooms` as any);
        const available = availabilityResults[idx] || 0;
        const originalCount =
          originalCountsMap[rt.roomId as string] ?? undefined;
        const unchanged =
          mode === "update" &&
          originalCount !== undefined &&
          (rt.totalRooms || 0) === originalCount;
        if (!unchanged && (rt.totalRooms || 0) > available) {
          setError(
            `roomTypes.${idx}.totalRooms` as any,
            {
              type: "manual",
              message: `Vượt quá số lượng phòng trống: còn ${available} phòng`,
            } as any
          );
          availabilityError = true;
        }
      });
      if (availabilityError) {
        setSnackbar({
          open: true,
          message: "Số lượng phòng vượt quá số lượng còn trống",
          severity: "error",
        });
        return;
      }

      // Update booking flow
      if (mode === "update" && bookingData?.id) {
        const originalTotalRooms = (
          (bookingData as any)?.bookingRoomTypes || []
        ).reduce(
          (sum: number, rt: any) =>
            sum + (rt.totalRoom || rt.bookingRooms?.length || 0),
          0
        );
        const newTotalRooms = (values.roomTypes || []).reduce(
          (sum, rt) => sum + (rt.totalRooms || 0),
          0
        );

        // if (originalTotalRooms !== newTotalRooms) {
        //   setSnackbar({
        //     open: true,
        //     message:
        //       "Không thể cập nhật: tổng số phòng đã thay đổi. Vui lòng giữ nguyên số lượng phòng.",
        //     severity: "error",
        //   });
        //   return;
        // }

        const payload: UpdateBookingDto = {
          hotelId: hotelId,
          primaryGuest: {
            fullname: values.guestName || "",
            phone: values.guestPhone,
            email: values.guestEmail || undefined,
          },
          deposit: values.depositAmount || 0,
          discount: 0,
          startDate: dayjs(globalStart).format("YYYY-MM-DD"),
          endDate: dayjs(globalEnd).format("YYYY-MM-DD"),
          total: values.totalAmount || 0,
          left: (values.totalAmount || 0) - (values.depositAmount || 0) - 0,
          notes: values.notes || undefined,
          roomTypes: values.roomTypes.map((rt) => ({
            roomTypeId: rt.roomId,
            price: rt.price || 0,
            capacity: 0,
            totalRoom: rt.totalRooms || 0,
            startDate: dayjs(globalStart).format("YYYY-MM-DDTHH:mm:ss"),
            endDate: dayjs(globalEnd).format("YYYY-MM-DDTHH:mm:ss"),
            rooms: rt.rooms!.map((r) => ({
              roomId: r?.roomId,
              startDate: globalStart,
              endDate: globalEnd,
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
        startDate: dayjs(globalStart).format("YYYY-MM-DD"),
        endDate: dayjs(globalEnd).format("YYYY-MM-DD"),
        roomTypes: values.roomTypes.map((rt) => ({
          roomTypeId: rt.roomId,
          price: rt.price || 0,
          capacity: 0,
          totalRoom: rt.totalRooms || 0,
          startDate: dayjs(globalStart).format("YYYY-MM-DDTHH:mm:ss"),
          endDate: dayjs(globalEnd).format("YYYY-MM-DDTHH:mm:ss"),
          rooms: rt.rooms.map((r) => ({
            roomId: r?.roomId,
            startDate: dayjs(globalStart).format("YYYY-MM-DDTHH:mm:ss"),
            endDate: dayjs(globalEnd).format("YYYY-MM-DDTHH:mm:ss"),
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
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                <Controller
                  name="guestName"
                  control={control}
                  size="small"
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
                  size="small"
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
              </Stack>
            </Stack>
            <Controller
              name="guestEmail"
              control={control}
              size="small"
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RemoveRedEye />}
                    onClick={() => {
                      if (!priceDialogRt && roomTypes[0]) {
                        const rt = roomTypes[0];
                        setPriceDialogRt({
                          bookingRoomTypeId: "",
                          roomTypeId: rt.id,
                          roomTypeName: rt.name,
                          capacity: 0,
                          price: rt.priceFrom || 0,
                          totalRoom: 1,
                          startDate: dayjs(globalStart as Dayjs).format(
                            "YYYY-MM-DD"
                          ),
                          endDate: dayjs(globalEnd as Dayjs).format(
                            "YYYY-MM-DD"
                          ),
                          bookingRooms: [],
                        });
                      }
                      setPriceDialogOpen(true);
                    }}
                  >
                    Xem giá theo phòng
                  </Button>
                </Stack>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Controller
                  name="checkInDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      size="small"
                      minDate={dayjs()}
                      label="Từ ngày"
                      value={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        setReloadCount((prev) => prev + 1);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors?.checkInDate,
                          helperText: (errors as any)?.checkInDate?.message,
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
                <Controller
                  name="checkOutDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      minDate={dayjs().add(1, "day")}
                      label="Đến ngày"
                      value={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        setReloadCount((prev) => prev + 1);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors?.checkOutDate,
                          helperText: (errors as any)?.checkOutDate?.message,
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
              </Stack>

              <Box sx={{ mt: 1 }}>
                <Stack spacing={1}>
                  {roomTypes.map((rt) => {
                    const available = availabilityByType[rt.id] ?? 0;
                    const qty = desiredCounts[rt.id] ?? 0;
                    const idx = (roomsWatch || []).findIndex(
                      (r) => r.roomId === rt.id
                    );
                    const perRoomTotal =
                      idx >= 0 ? quotesByIndex[idx]?.total ?? 0 : 0;
                    const rowTotal = (perRoomTotal || 0) * (qty || 0);
                    return (
                      <Grid key={rt.id} container>
                        <Grid size={{ xs: 12, md: 9 }}>
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {rt.name}{" "}
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setPricePopoverType(rt.id);
                                  setPricePopoverAnchor(e.currentTarget);
                                }}
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {available > 0
                                ? `(Còn ${available} phòng trống)`
                                : `(Hết phòng)`}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Grid container spacing={2} alignItems={"center"}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={qty}
                                label="Số lượng"
                                onChange={(e) => {
                                  setReloadCount((p) => p + 1);
                                  const raw = Number(e.target.value) || 0;
                                  const num = Math.max(
                                    0,
                                    Math.min(raw, available)
                                  );
                                  setDesiredCounts((s) => ({
                                    ...s,
                                    [rt.id]: num,
                                  }));
                                  const idx = (roomsWatch || []).findIndex(
                                    (r) => r.roomId === rt.id
                                  );
                                  if (num <= 0) {
                                    if (idx >= 0) remove(idx);
                                  } else {
                                    if (idx >= 0) {
                                      setValue(
                                        `roomTypes.${idx}.totalRooms`,
                                        num as any
                                      );
                                      setValue(
                                        `roomTypes.${idx}.price`,
                                        rt.priceFrom || 0
                                      );
                                    } else {
                                      append({
                                        roomId: rt.id,
                                        totalRooms: num,
                                        price: rt.priceFrom || 0,
                                        rooms: [],
                                      });
                                    }
                                  }
                                }}
                                inputProps={{ min: 0, max: available }}
                                disabled={available <= 0}
                                sx={{ width: "100%" }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  {new Intl.NumberFormat("vi-VN").format(
                                    rowTotal
                                  )}{" "}
                                  đ
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    );
                  })}
                </Stack>
              </Box>
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
                      type="text"
                      fullWidth
                      error={!!errors.depositAmount}
                      helperText={errors.depositAmount?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">VND</InputAdornment>
                        ),
                      }}
                      {...field}
                      value={
                        field.value !== undefined && field.value !== null
                          ? new Intl.NumberFormat("vi-VN").format(
                              Number(field.value)
                            )
                          : ""
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        const num = raw ? Number(raw) : 0;
                        field.onChange(num);
                      }}
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
              onClick={handleSubmit(submit as any, () =>
                setSnackbar({
                  open: true,
                  message: "Vui lòng chọn ít nhất 1 phòng",
                  severity: "error",
                })
              )}
              startIcon={<SaveIcon />}
            >
              {mode === "update" ? "Cập nhật" : "Lưu yêu cầu"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Box>
        <PriceCalendarRoomTypeDialog
          open={priceDialogOpen}
          onClose={() => {
            setPriceDialogOpen(false);
            setPriceDialogRt(null);
          }}
          roomTypeId={
            (priceDialogRt?.roomTypeId as string) || roomTypes[0]?.id || ""
          }
          value={Object.fromEntries(
            (
              roomTypes.find(
                (t) =>
                  t.id ===
                  ((priceDialogRt?.roomTypeId as string) ||
                    roomTypes[0]?.id ||
                    "")
              )?.priceByDates || []
            ).map((p) => [dayjs(p.date).format("YYYY-MM-DD"), p.price])
          )}
        />
        <Popover
          open={!!pricePopoverAnchor}
          anchorEl={pricePopoverAnchor}
          onClose={() => {
            setPricePopoverAnchor(null);
            setPricePopoverType(null);
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box sx={{ p: 1.5, minWidth: 240 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Chi tiết giá theo ngày
            </Typography>
            {(() => {
              const idx = (roomsWatch || []).findIndex(
                (r) => r.roomId === pricePopoverType
              );
              const quote = idx >= 0 ? quotesByIndex[idx] || null : null;
              const items = quote?.items || [];
              if (!quote || items.length === 0) {
                return (
                  <Typography variant="body2" color="text.secondary">
                    Chưa chọn loại phòng hoặc chưa có dữ liệu báo giá
                  </Typography>
                );
              }
              return (
                <Stack spacing={0.75}>
                  {items.map((it) => (
                    <Stack
                      key={`${pricePopoverType}-${it.date}`}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2">
                        {dayjs(it.date).format("DD/MM/YYYY")}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Intl.NumberFormat("vi-VN").format(it.price || 0)} đ
                      </Typography>
                    </Stack>
                  ))}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Tổng 1 phòng</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {new Intl.NumberFormat("vi-VN").format(quote.total || 0)}{" "}
                      đ
                    </Typography>
                  </Stack>
                </Stack>
              );
            })()}
          </Box>
        </Popover>
      </Box>
    </>
  );
};

export default BookingFormModal;
