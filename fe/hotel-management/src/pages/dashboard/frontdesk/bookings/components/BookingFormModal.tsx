import { zodResolver } from "@hookform/resolvers/zod";
import { AddCircle } from "@mui/icons-material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  Collapse,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
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
import pricingApi, {
  type PricingQuoteResponse,
} from "../../../../../api/pricingApi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";

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
      .min(1, "Tối thiểu 1 phòng")
      .max(100, "Tối đa 100 phòng"),
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
    setError,
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
  const [quotesByIndex, setQuotesByIndex] = useState<
    Record<number, PricingQuoteResponse | null>
  >({});
  const [itemOpen, setItemOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (roomTypes.length > 0 && mode === "create") {
      // Initialize first room section defaults
      setValue("roomTypes.0.roomId", roomTypes[0].id);
      setValue("roomTypes.0.price", roomTypes[0].priceFrom || 0);
    }
  }, [roomTypes, mode]);

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
          const startDate = r.startDate;
          const endDate = r.endDate;
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

        const start = r.startDate ? dayjs(r.startDate) : null;
        const end = r.endDate ? dayjs(r.endDate) : null;

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
            temp.push({
              date: dateStr,
              price: overridePrice ?? inputPrice,
            });
            cursor = cursor.add(1, "day");
          }
          items = temp as any;
        } else {
          // Replace base-price days with current input price; keep overrides
          items = items.map((it) => {
            const d = dayjs(it.date).format("YYYY-MM-DD");
            const isOverride = overrideSet.has(d);
            return {
              ...it,
              price: isOverride ? it.price : inputPrice,
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
    };
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          setError(
            `roomTypes.${idx}.totalRooms` as any,
            {
              type: "manual",
              message: "Tối đa 100 phòng",
            } as any
          );
          dynError = true;
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
          startDate: dayjs(rt.startDate).format("YYYY-MM-DDTHH:mm:ss"),
          endDate: dayjs(rt.endDate).format("YYYY-MM-DDTHH:mm:ss"),
          rooms: rt.rooms.map((r) => ({
            roomId: r?.roomId,
            startDate: dayjs(rt.startDate).format("YYYY-MM-DDTHH:mm:ss"),
            endDate: dayjs(rt.endDate).format("YYYY-MM-DDTHH:mm:ss"),
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
                  <CardContent sx={{ pb: itemOpen[idx] !== false ? 2 : 0 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        mb: itemOpen[idx] !== false ? 1 : 0,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setItemOpen((s) => ({
                          ...s,
                          [idx]: s[idx] === false ? true : false,
                        }))
                      }
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Mục #{idx + 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {roomTypes.find(
                            (t) => t.id === roomsWatch[idx]?.roomId
                          )?.name || "—"}
                          {" • "}
                          {roomsWatch[idx]?.startDate
                            ? dayjs(roomsWatch[idx]?.startDate).format("DD/MM")
                            : "—"}
                          {" - "}
                          {roomsWatch[idx]?.endDate
                            ? dayjs(roomsWatch[idx]?.endDate).format("DD/MM")
                            : "—"}
                          {" • SL: "}
                          {roomsWatch[idx]?.totalRooms || 0}
                          {" • Đơn giá: "}
                          {new Intl.NumberFormat("vi-VN").format(
                            roomsWatch[idx]?.price ||
                              roomTypes.find(
                                (t) => t.id === roomsWatch[idx]?.roomId
                              )?.priceFrom ||
                              0
                          )}{" "}
                          đ{" • Tổng: "}
                          {new Intl.NumberFormat("vi-VN").format(
                            ((quotesByIndex[idx]?.total || 0) as number) *
                              (roomsWatch[idx]?.totalRooms || 1)
                          )}{" "}
                          đ
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={1}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(idx);
                          }}
                          aria-label="remove room-type"
                        >
                          <CloseIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemOpen((s) => ({
                              ...s,
                              [idx]: s[idx] === false ? true : false,
                            }));
                          }}
                          aria-label="toggle-item"
                        >
                          {itemOpen[idx] !== false ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Collapse in={itemOpen[idx] !== false}>
                      <RoomBookingSection
                        index={idx}
                        control={control}
                        errors={errors}
                        roomTypes={roomTypes}
                        onRemove={() => remove(idx)}
                        hideHeader
                        setReloadCount={setReloadCount}
                      />
                      <Stack sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Đơn giá:{" "}
                          {new Intl.NumberFormat("vi-VN").format(
                            roomsWatch[idx]?.price ||
                              roomTypes.find(
                                (t) => t.id === roomsWatch[idx]?.roomId
                              )?.priceFrom ||
                              0
                          )}{" "}
                          đ
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Giá cơ bản:{" "}
                          {new Intl.NumberFormat("vi-VN").format(
                            roomTypes.find(
                              (t) => t.id === roomsWatch[idx]?.roomId
                            )?.priceFrom || 0
                          )}{" "}
                          -{" "}
                          {new Intl.NumberFormat("vi-VN").format(
                            roomTypes.find(
                              (t) => t.id === roomsWatch[idx]?.roomId
                            )?.priceTo || 0
                          )}{" "}
                          đ
                        </Typography>
                      </Stack>
                      {quotesByIndex[idx]?.items?.length ? (
                        <Box
                          sx={{
                            mt: 2,
                            "& .fc .price-event": {
                              backgroundColor: (theme) =>
                                theme.palette.primary.light,
                              border: "none",
                              color: (theme) =>
                                theme.palette.primary.contrastText,
                              padding: "2px 6px",
                              borderRadius: 12,
                              fontSize: "0.75rem",
                              display: "inline-block",
                              marginTop: "2px",
                            },
                            "& .fc-daygrid-day": {
                              cursor: "pointer",
                            },
                            "& .fc-daygrid-day.fc-day-today": {
                              backgroundColor: (theme) =>
                                theme.palette.action.hover,
                            },
                          }}
                        >
                          <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            locales={[viLocale]}
                            locale="vi"
                            initialView="dayGridMonth"
                            initialDate={dayjs(
                              roomsWatch[idx]?.startDate
                            ).toDate()}
                            selectable={false}
                            dayMaxEvents
                            events={quotesByIndex[idx]!.items.map((it) => ({
                              id: it.date,
                              start: it.date,
                              allDay: true,
                              title: `₫${(it.price || 0).toLocaleString(
                                "vi-VN"
                              )}`,
                              className: "price-event",
                            }))}
                            headerToolbar={{
                              left: "prev,next today",
                              center: "title",
                              right: "",
                            }}
                            height="auto"
                          />
                        </Box>
                      ) : null}
                      {quotesByIndex[idx]?.items?.length ? (
                        <Stack spacing={0.5} sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Bảng giá theo ngày
                          </Typography>
                          <Stack spacing={0.5}>
                            {quotesByIndex[idx]!.items.map((it, i) => {
                              const price = it.price || 0;
                              const totalRooms =
                                roomsWatch[idx]?.totalRooms || 0;
                              const prev =
                                i > 0
                                  ? quotesByIndex[idx]!.items[i - 1].price
                                  : price;
                              const changed = price !== prev;
                              return (
                                <Stack
                                  key={`${it.date}-${i}`}
                                  direction="row"
                                  justifyContent="space-between"
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {dayjs(it.date).format("DD/MM/YYYY")}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: changed
                                        ? "warning.main"
                                        : "text.primary",
                                      fontWeight: changed ? 700 : 500,
                                    }}
                                  >
                                    {new Intl.NumberFormat("vi-VN").format(
                                      price
                                    )}{" "}
                                    đ{" "}
                                    {totalRooms > 1
                                      ? `× ${totalRooms} phòng = ${new Intl.NumberFormat(
                                          "vi-VN"
                                        ).format(price * totalRooms)} đ`
                                      : ""}
                                  </Typography>
                                </Stack>
                              );
                            })}
                          </Stack>
                          <Typography
                            textAlign={"end"}
                            variant="body2"
                            sx={{ mt: 0.5 }}
                            fontWeight={"bold"}
                          >
                            Tổng ({roomsWatch[idx]?.totalRooms || 1} phòng):{" "}
                            {new Intl.NumberFormat("vi-VN").format(
                              (quotesByIndex[idx]!.total || 0) *
                                (roomsWatch[idx]?.totalRooms || 1)
                            )}{" "}
                            đ
                          </Typography>
                        </Stack>
                      ) : null}
                    </Collapse>
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
                message: "Vui lòng kiểm tra lỗi trong yêu cầu đặt phòng",
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
  );
};

export default BookingFormModal;
