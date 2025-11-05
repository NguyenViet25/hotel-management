import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Grid,
  Paper,
  Tabs,
  Tab,
  Typography,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { RoomType, CreateRoomTypeRequest, UpdateRoomTypeRequest } from "../../../../../api/roomTypesApi";
import roomTypesApi from "../../../../../api/roomTypesApi";
import pricingApi, { type DayOfWeekPriceDto } from "../../../../../api/pricingApi";
import RoomTypeFormSectionBase from "./RoomTypeFormSectionBase";
import RoomTypeFormSectionWeekday from "./RoomTypeFormSectionWeekday";
import RoomTypeFormSectionDateRange from "./RoomTypeFormSectionDateRange";

export interface RoomTypeFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: RoomType | null;
  hotelId?: string; // required for create
  onCreated?: (id: string) => void;
}

const weekdayArraySchema = yup
  .array()
  .of(yup.number().transform((val) => (isNaN(val as any) ? 0 : Number(val))).min(0).required())
  .length(7, "Cần đủ 7 giá theo thứ");

const dateRangeSchema = yup.object({
  startDate: yup.date().typeError("Ngày bắt đầu không hợp lệ").required("Chọn ngày bắt đầu"),
  endDate: yup
    .date()
    .typeError("Ngày kết thúc không hợp lệ")
    .required("Chọn ngày kết thúc")
    .min(yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu"),
  price: yup
    .number()
    .transform((val) => (isNaN(val as any) ? 0 : Number(val)))
    .min(0, "Giá phải >= 0")
    .required("Nhập giá"),
});

const schema = yup.object({
  hotelId: yup.string().optional(),
  name: yup.string().required("Vui lòng nhập tên loại phòng"),
  description: yup.string().optional(),
  guests: yup
    .number()
    .transform((val) => (isNaN(val as any) ? 0 : Number(val)))
    .min(1, "Sức chứa tối thiểu là 1")
    .required("Nhập sức chứa"),
  images: yup.array().of(yup.string().url("URL ảnh không hợp lệ")).optional(),
  basePrice: yup
    .number()
    .transform((val) => (isNaN(val as any) ? 0 : Number(val)))
    .min(0, "Giá base phải >= 0")
    .required("Nhập giá base"),
  weekdayPrices: weekdayArraySchema,
  dateRanges: yup.array().of(dateRangeSchema).optional(),
});

type FormValues = yup.InferType<typeof schema>;

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({ open, onClose, initialData, hotelId, onCreated }) => {
  const isEdit = !!initialData;
  const [tabIndex, setTabIndex] = useState(0);

  const defaultWeekdayPrices = useMemo(() => Array(7).fill(0), []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      hotelId: hotelId ?? "",
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      guests: 2,
      images: [],
      basePrice: 0,
      weekdayPrices: defaultWeekdayPrices,
      dateRanges: [],
    },
  });

  const submitHandler = async (values: FormValues) => {
    try {
      if (isEdit && initialData) {
        const payload: UpdateRoomTypeRequest = {
          name: values.name,
          description: values.description ?? "",
        };
        await roomTypesApi.updateRoomType(initialData.id, payload);
        onClose();
        reset();
        return;
      }

      const createPayload: CreateRoomTypeRequest = {
        hotelId: values.hotelId || hotelId || "",
        name: values.name,
        description: values.description ?? "",
        images: (values.images || []).filter(Boolean),
        amenityIds: [],
      };
      const created = await roomTypesApi.createRoomType(createPayload);
      const roomTypeId = created.id;
      const hotelIdToUse = created.hotelId ?? (values.hotelId || hotelId || "");

      // Base price
      if (values.basePrice >= 0) {
        await pricingApi.setBasePrice({ hotelId: hotelIdToUse, roomTypeId, price: values.basePrice });
      }

      // Weekday prices: only send non-zero entries
      const weekdayPrices: DayOfWeekPriceDto[] = values.weekdayPrices
        .map((price, idx) => ({ dayOfWeek: idx, price }))
        .filter((p) => p.price > 0);
      if (weekdayPrices.length > 0) {
        await pricingApi.setBulkDayOfWeekPrices(hotelIdToUse, roomTypeId, weekdayPrices);
      }

      // Date-range prices
      if (values.dateRanges && values.dateRanges.length > 0) {
        for (const dr of values.dateRanges) {
          if (dr.price > 0 && dr.startDate && dr.endDate) {
            const startIso = new Date(dr.startDate as any).toISOString().slice(0, 10);
            const endIso = new Date(dr.endDate as any).toISOString().slice(0, 10);
            await pricingApi.createDateRangePrice({
              hotelId: hotelIdToUse,
              roomTypeId,
              startDate: startIso,
              endDate: endIso,
              price: dr.price,
            });
          }
        }
      }

      onCreated?.(roomTypeId);
      onClose();
      reset();
    } catch (err: any) {
      setError("root", { message: err?.message || "Có lỗi khi tạo loại phòng hoặc thiết lập giá" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? "Chỉnh sửa loại phòng" : "Thêm loại phòng & Giá"}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Thiết lập base/weekday/date-range cho loại phòng
        </Typography>

        {/* Common fields */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            {!isEdit && !hotelId && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hotel ID"
                  fullWidth
                  {...register("hotelId")}
                  error={!!errors.hotelId}
                  helperText={errors.hotelId?.message}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên"
                fullWidth
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="guests"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sức chứa"
                    type="number"
                    fullWidth
                    error={!!errors.guests}
                    helperText={errors.guests?.message}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
            </Grid>
          <Grid item xs={12}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={3}
              {...register("description")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="images[0]"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ảnh (URL, tùy chọn)"
                  fullWidth
                  error={!!errors.images?.[0]}
                  helperText={(errors.images?.[0] as any)?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

        {/* Tabs for pricing sections */}
        <Paper variant="outlined" sx={{ bgcolor: "grey.100", mb: 2 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="fullWidth">
            <Tab label="Giá base" />
            <Tab label="Giá theo thứ" />
            <Tab label="Giá theo ngày" />
          </Tabs>
        </Paper>

        <Stack spacing={2}>
          {tabIndex === 0 && <RoomTypeFormSectionBase control={control} errors={errors as any} />}
          {tabIndex === 1 && <RoomTypeFormSectionWeekday control={control} errors={errors as any} />}
          {tabIndex === 2 && <RoomTypeFormSectionDateRange control={control} errors={errors as any} />}
        </Stack>

        {errors.root?.message && (
          <Alert severity="error" sx={{ mt: 2 }}>{errors.root.message}</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button onClick={handleSubmit(submitHandler)} variant="contained" disabled={isSubmitting}>
          {isEdit ? "Lưu" : "Tạo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomTypeForm;