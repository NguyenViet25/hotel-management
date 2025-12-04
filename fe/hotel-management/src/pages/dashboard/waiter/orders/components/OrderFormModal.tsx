import { zodResolver } from "@hookform/resolvers/zod";
import {
  AssignmentInd,
  Info,
  NoteAdd,
  People,
  Person,
  Phone,
} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { BookingDetailsDto } from "../../../../../api/bookingsApi";
import bookingsApi from "../../../../../api/bookingsApi";
import menusApi, { type MenuItemDto } from "../../../../../api/menusApi";
import ordersApi, {
  type CreateOrderDto,
  type OrderDetailsDto,
} from "../../../../../api/ordersApi";
import CustomSelect from "../../../../../components/common/CustomSelect";
import { toast } from "react-toastify";

interface IProps {
  open: boolean;
  onClose: () => void;
  hotelId?: string | null;
  onSubmitted?: () => void;
  initialValues?: OrderDetailsDto | null;
  isWalkIn?: boolean;
}

const schema = z.object({
  bookingId: z.string().optional(),
  customerName: z.string().min(2, "Tên khách hàng bắt buộc"),
  customerPhone: z.string().optional(),
  status: z.number().optional(),
  notes: z.string().optional(),
  guests: z.number().min(1, "Số khách phải >= 1").optional(),
  orderDate: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, "Chọn món"),
        quantity: z.number().min(1, "Số lượng phải >= 1"),
      })
    )
    .min(1, "Chọn ít nhất 1 món"),
});

type FormValues = z.infer<typeof schema>;

interface IMenuItem {
  menuItemId: string;
  quantity: number;
}

const OrderFormModal: React.FC<IProps> = ({
  open,
  onClose,
  hotelId,
  onSubmitted,
  initialValues,
  isWalkIn = true,
}) => {
  const isEdit = Boolean(initialValues);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialValues,
      customerName: initialValues?.customerName || "",
      customerPhone: initialValues?.customerPhone || "",
      items: initialValues?.items || [],
      status: initialValues?.status || 1,
      guests: initialValues?.guests || 1,
      orderDate: initialValues?.servingDate || dayjs().toISOString(),
    },
  });

  const values = watch();

  const [menuItems, setMenuItemss] = useState<MenuItemDto[]>([]);
  const [bookings, setBookings] = useState<BookingDetailsDto[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const foodMenuItems = useMemo(
    () => menuItems.filter((mi) => (mi.category || "").trim() !== "Set"),
    [menuItems]
  );
  const setMenuItems = useMemo(
    () => menuItems.filter((mi) => (mi.category || "").trim() === "Set"),
    [menuItems]
  );

  const parseSetItems = (mi?: MenuItemDto | null) => {
    const desc = (mi?.description || "").trim();
    const parts = desc
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return parts.map((name) => {
      const match = foodMenuItems.find(
        (f) => (f.name || "").toLowerCase() === name.toLowerCase()
      );
      return { name, imageUrl: match?.imageUrl, unitPrice: match?.unitPrice };
    });
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoadingItems(true);
      try {
        const res = await menusApi.getMenuItems({
          page: 1,
          pageSize: 100,
          isActive: true,
        });
        if (res.isSuccess) setMenuItemss(res.data);
      } catch {}
      setLoadingItems(false);
    };

    const fetchBookings = async () => {
      setLoadingItems(true);
      try {
        const res = await bookingsApi.listActive({ hotelId: hotelId ?? "" });
        console.log("res", res);
        if (res.isSuccess) setBookings(res.data || []);
      } catch {}
      setLoadingItems(false);
    };

    if (open) fetchMenuItems();
    if (!isWalkIn) fetchBookings();
  }, [open, isWalkIn]);

  const addItemRow = (values: IMenuItem[], source?: "food" | "set") => {
    const next: any[] = [...values, { menuItemId: "", quantity: 1, source }];
    setValue("items", next as any);
  };

  const removeItemRow = (values: IMenuItem[], index: number) => {
    const nextItems = values.filter((_, i) => i !== index);
    setValue("items", nextItems);
  };

  const submit = async (values: FormValues) => {
    const payload: CreateOrderDto = {
      hotelId: hotelId ?? "",
      customerName: values.customerName,
      customerPhone: values.customerPhone || undefined,
      items: values.items
        .filter((i) => i.menuItemId && i.quantity > 0)
        .map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      isWalkIn: isWalkIn,
      bookingId: values.bookingId || undefined,
      notes: values.notes,
      guests: values.guests || 1,
      servingDate: values.orderDate || dayjs().toISOString(),
      status: Number(values.status || "1"),
    };
    try {
      if (isWalkIn) {
        const res = await (isEdit
          ? ordersApi.updateWalkIn(initialValues!.id, {
              id: initialValues?.id || "",
              ...payload,
            } as any)
          : ordersApi.createWalkIn(payload));
        if (res.isSuccess) {
          onSubmitted?.();
          onClose();
          reset({ customerName: "", customerPhone: "", items: [] });
        }
      } else {
        const res = await (isEdit
          ? ordersApi.updateForBooking(initialValues!.id, {
              id: initialValues?.id || "",
              ...payload,
            } as any)
          : ordersApi.createForBooking(payload));
        if (res.isSuccess) {
          onSubmitted?.();
          onClose();
          reset({ customerName: "", customerPhone: "", items: [] });
        }
      }

      toast.success(
        isEdit ? "Cập nhật yêu cầu thành công" : "Tạo yêu cầu thành công"
      );
    } catch {}
  };

  function calculateTotalPrice(items: IMenuItem[]): number {
    return items.reduce((acc, cur) => {
      const item = menuItems.find((i) => i.id === cur.menuItemId);
      return acc + (item?.unitPrice || 0) * cur.quantity;
    }, 0);
  }

  useEffect(() => {
    if (initialValues) {
      setValue("notes", initialValues.notes || "");
      setValue("bookingId", initialValues.bookingId || undefined);
      setValue("customerName", initialValues.customerName || "");
      setValue("customerPhone", initialValues.customerPhone || "");
      setValue("status", initialValues.status || 1);
      setValue("guests", initialValues.guests || 1);
      setValue("items", initialValues.items || []);
      setValue("orderDate", initialValues.createdAt || dayjs().toISOString());
    }
  }, [initialValues, setValue]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset({
          customerName: "",
          customerPhone: "",
          notes: "",
          items: [],
          bookingId: undefined,
        });
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 20, pb: 0 }}>
        {isEdit
          ? `Cập nhật yêu cầu đặt món khách ${
              isWalkIn ? "vãng lai" : "đặt phòng"
            }`
          : `Tạo yêu cầu đặt món khách ${isWalkIn ? "vãng lai" : "đặt phòng"}`}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3} pt={2}>
          {/* Customer Info */}
          {!isWalkIn && (
            <Controller
              name="bookingId"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  name={field.name}
                  value={field.value as any}
                  onChange={(e) => {
                    const selectedBooking = bookings.find(
                      (b) => b.id === e.target.value
                    );
                    setValue(
                      "customerName",
                      selectedBooking?.primaryGuestName || ""
                    );
                    setValue(
                      "customerPhone",
                      selectedBooking?.phoneNumber || ""
                    );
                    field.onChange(e);
                  }}
                  label="Chọn đơn đặt phòng"
                  startIcon={
                    <InputAdornment position="start">
                      <Info color="primary" />
                    </InputAdornment>
                  }
                  options={bookings.map((b) => ({
                    value: b.id,
                    label: (
                      <Stack direction="column" spacing={0.5}>
                        <Typography fontWeight={600}>
                          Họ và tên: {b.primaryGuestName}
                        </Typography>
                        <Typography>SĐT: {b.phoneNumber}</Typography>
                        <Typography>
                          Ngày đặt phòng:{" "}
                          {new Date(b.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Loại phòng đặt:{" "}
                          {b.bookingRoomTypes
                            .map((t) => `${t.totalRoom} ${t.roomTypeName}`)
                            .join(", ")}
                        </Typography>
                        {/* <Typography>
                          Trạng thái:{" "}
                          {b.status === 1 ? "Xác nhận" : "Chưa xác nhận"}
                        </Typography> */}
                      </Stack>
                    ),
                  }))}
                  placeholder="Chọn đơn đặt phòng"
                />
              )}
            />
          )}
          <Stack spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
              <Controller
                name="orderDate"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    label="Thời gian phục vụ"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(v) =>
                      field.onChange(v ? v.toISOString() : undefined)
                    }
                  />
                )}
              />
            </LocalizationProvider>
            {isWalkIn && (
              <>
                <Controller
                  name="customerName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Tên khách"
                      required
                      {...field}
                      placeholder={isWalkIn ? "Nhập tên khách hàng" : ""}
                      fullWidth
                      disabled={!isWalkIn}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.customerName}
                      helperText={errors.customerName?.message}
                    />
                  )}
                />

                <Controller
                  name="customerPhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="SĐT (tuỳ chọn)"
                      {...field}
                      disabled={!isWalkIn}
                      placeholder={isWalkIn ? "Nhập số điện thoại" : ""}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </>
            )}
            {isEdit && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    name={field.name}
                    value={field.value as any}
                    onChange={field.onChange}
                    label="Trạng thái"
                    startIcon={
                      <InputAdornment position="start">
                        <AssignmentInd color="primary" />
                      </InputAdornment>
                    }
                    options={[
                      { value: 1, label: "Chờ xác nhận" },
                      { value: 2, label: "Đã xác nhận" },
                      { value: 3, label: "Đang nấu" },
                      { value: 4, label: "Sẵn sàng" },
                      { value: 5, label: "Đã phục vụ" },
                      { value: 6, label: "Đã hủy" },
                    ]}
                    placeholder="Chọn trạng thái"
                  />
                )}
              />
            )}

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Ghi chú (tuỳ chọn)"
                  {...field}
                  placeholder="Nhập ghi chú"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NoteAdd color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Stack>

          <Controller
            name="guests"
            control={control}
            render={({ field }) => (
              <TextField
                label="Số lượng khách"
                required
                placeholder={"Nhập số lượng khách"}
                fullWidth
                type="number"
                {...field}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <People color="primary" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
                error={!!errors.guests}
                helperText={errors.guests?.message}
              />
            )}
          />

          {/* Items Section */}
          <Controller
            name="items"
            control={control}
            render={({ field }) => (
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Món ăn
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    color="primary"
                    onClick={() => addItemRow(field.value as any, "food")}
                    sx={{ minWidth: 130 }}
                  >
                    Thêm món
                  </Button>
                </Stack>

                {(field.value || [])
                  .map((item: any, idx: number) => ({ item, idx }))
                  .filter(({ item }) => {
                    const sel = menuItems.find((m) => m.id === item.menuItemId);
                    const cat = (sel?.category || "").trim();
                    return (
                      (item.source ?? (cat === "Set" ? "set" : "food")) ===
                      "food"
                    );
                  })
                  .map(({ item, idx }) => (
                    <Stack
                      key={idx}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems="center"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        boxShadow: 1,
                        backgroundColor: "#fafafa",
                        "&:hover": { boxShadow: 3 },
                        height: "100%",
                      }}
                    >
                      {/* Order number */}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          width: 30,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {idx + 1}.
                      </Typography>

                      {/* Menu item select */}
                      <TextField
                        select
                        label="Chọn món"
                        value={item.menuItemId}
                        onChange={(e) => {
                          const next: any[] = [...field.value];
                          next[idx] = {
                            ...item,
                            menuItemId: e.target.value,
                            source: "food",
                          };
                          field.onChange(next);
                        }}
                        sx={{ minWidth: 240, flexGrow: 1 }}
                        disabled={loadingItems}
                        error={!!errors.items?.[idx]?.menuItemId}
                        helperText={errors.items?.[idx]?.menuItemId?.message}
                        SelectProps={{
                          MenuProps: {
                            PaperProps: { style: { maxHeight: 190 } },
                          },
                        }}
                      >
                        {foodMenuItems.map((mi) => (
                          <MenuItem key={mi.id} value={mi.id}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <img
                                src={mi.imageUrl || "/assets/logo.png"}
                                alt={mi.name}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 6,
                                  objectFit: "cover",
                                  border: "1px solid #eee",
                                }}
                              />
                              <Stack>
                                <Typography>{mi.name}</Typography>
                                <Typography color="text.secondary">
                                  {mi.unitPrice.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  })}
                                </Typography>
                              </Stack>
                            </Stack>
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Quantity */}
                      <TextField
                        type="number"
                        label="Số lượng"
                        value={item.quantity}
                        onChange={(e) => {
                          const next: any[] = [...field.value];
                          next[idx] = {
                            ...item,
                            quantity: Math.max(1, Number(e.target.value || 1)),
                          };
                          field.onChange(next);
                        }}
                        sx={{
                          width: 140,
                          height: "100%", // 🔥 force equal height
                          "& .MuiInputBase-root": {
                            height: item.menuItemId ? "78px" : "100%", // 🔥 force equal height
                            display: "flex",
                            alignItems: "center",
                          },
                        }}
                        inputProps={{ min: 1 }}
                      />

                      {/* Delete button */}
                      <IconButton
                        color="error"
                        onClick={() => removeItemRow(field.value, idx)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Set
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    color="warning"
                    onClick={() => addItemRow(field.value as any, "set")}
                    sx={{ minWidth: 130 }}
                  >
                    Thêm set
                  </Button>
                </Stack>

                {(field.value || [])
                  .map((item: any, idx: number) => ({ item, idx }))
                  .filter(({ item }) => {
                    const sel = menuItems.find((m) => m.id === item.menuItemId);
                    const cat = (sel?.category || "").trim();
                    return (
                      (item.source ?? (cat === "Set" ? "set" : "food")) ===
                      "set"
                    );
                  })
                  .map(({ item, idx }) => (
                    <Stack
                      key={idx}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems="center"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        boxShadow: 1,
                        backgroundColor: "#fff8e1",
                        "&:hover": { boxShadow: 3 },
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          width: 30,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {idx + 1}.
                      </Typography>

                      <TextField
                        select
                        label="Chọn set"
                        value={item.menuItemId}
                        onChange={(e) => {
                          const next: any[] = [...field.value];
                          next[idx] = {
                            ...item,
                            menuItemId: e.target.value,
                            source: "set",
                          };
                          field.onChange(next);
                        }}
                        sx={{ minWidth: 240, flexGrow: 1 }}
                        disabled={loadingItems}
                        error={!!errors.items?.[idx]?.menuItemId}
                        helperText={errors.items?.[idx]?.menuItemId?.message}
                        SelectProps={{
                          MenuProps: {
                            PaperProps: { style: { maxHeight: 190 } },
                          },
                        }}
                      >
                        {setMenuItems.map((mi) => (
                          <MenuItem key={mi.id} value={mi.id}>
                            <Tooltip
                              arrow
                              placement="right"
                              title={(() => {
                                const items = parseSetItems(mi);
                                return (
                                  <Stack spacing={0.5} sx={{ p: 0.5 }}>
                                    {items.length === 0 ? (
                                      <Typography color="text.secondary">
                                        Chưa có món trong set
                                      </Typography>
                                    ) : (
                                      items.map((si, idx) => (
                                        <Stack
                                          key={idx}
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                        >
                                          <Typography>{`${idx + 1}. ${
                                            si.name
                                          }`}</Typography>
                                          {typeof si.unitPrice === "number" && (
                                            <Typography color="text.secondary">
                                              {si.unitPrice.toLocaleString(
                                                "vi-VN",
                                                {
                                                  style: "currency",
                                                  currency: "VND",
                                                }
                                              )}
                                            </Typography>
                                          )}
                                        </Stack>
                                      ))
                                    )}
                                  </Stack>
                                );
                              })()}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <img
                                  src={mi.imageUrl || "/assets/logo.png"}
                                  alt={mi.name}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 6,
                                    objectFit: "contain",
                                    border: "1px solid #eee",
                                  }}
                                />
                                <Stack>
                                  <Typography>{mi.name}</Typography>
                                  <Typography color="text.secondary">
                                    {mi.unitPrice.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Tooltip>
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        type="number"
                        label="Số lượng"
                        value={item.quantity}
                        onChange={(e) => {
                          const next: any[] = [...field.value];
                          next[idx] = {
                            ...item,
                            quantity: Math.max(1, Number(e.target.value || 1)),
                          };
                          field.onChange(next);
                        }}
                        sx={{
                          width: 140,
                          height: "100%",
                          "& .MuiInputBase-root": {
                            height: item.menuItemId ? "78px" : "100%",
                            display: "flex",
                            alignItems: "center",
                          },
                        }}
                        inputProps={{ min: 1 }}
                      />

                      <IconButton
                        color="error"
                        onClick={() => removeItemRow(field.value, idx)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}

                {errors.items && (
                  <Typography variant="caption" color="error">
                    {errors.items.message as string}
                  </Typography>
                )}
              </Stack>
            )}
          />

          {/* Total */}
          <Typography
            variant="h6"
            color="primary"
            fontWeight="bold"
            textAlign="right"
          >
            Tổng cộng:{" "}
            {calculateTotalPrice(
              (values.items || []) as IMenuItem[]
            ).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit(submit)}
        >
          {isEdit ? "Cập nhật yêu cầu" : "Tạo yêu cầu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderFormModal;
