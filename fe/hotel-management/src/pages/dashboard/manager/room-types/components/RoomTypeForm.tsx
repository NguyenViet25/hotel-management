import { yupResolver } from "@hookform/resolvers/yup";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import type {
  CreateRoomTypeRequest,
  RoomType,
  UpdateRoomTypeRequest,
} from "../../../../../api/roomTypesApi";
import roomTypesApi from "../../../../../api/roomTypesApi";
import RoomTypeFormSectionBase from "./RoomTypeFormSectionBase";
import RoomTypeFormSectionDateRange from "./RoomTypeFormSectionDateRange";
import { useStore, type StoreState } from "../../../../../hooks/useStore";

export interface RoomTypeFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: RoomType | null;
  hotelId?: string; // required for create
  onSubmit: (data: any) => void;
}

const schema = yup.object({
  hotelId: yup.string().optional(),
  name: yup.string().required("Vui lòng nhập tên loại phòng"),
  description: yup.string().optional(),
  imageUrl: yup.string().optional(),
  capacity: yup
    .number()
    .transform((val) => (isNaN(val as any) ? 0 : Number(val)))
    .min(1, "Sức chứa tối thiểu là 1")
    .required("Nhập sức chứa"),
  basePriceFrom: yup
    .number()
    .transform((val) => (isNaN(val as any) ? 0 : Number(val)))
    .min(0, "Giá base phải >= 0")
    .required("Nhập giá base"),
  basePriceTo: yup
    .number()
    .transform((val) => (isNaN(val as any) ? 0 : Number(val)))
    .min(0, "Giá base phải >= 0")
    .required("Nhập giá base")
    .test(
      "gt-from",
      "Giá đến phải lớn hơn Giá từ",
      function (value) {
        const from = this.parent?.basePriceFrom ?? 0;
        return typeof value === "number" && value > from;
      }
    ),
  prices: yup.array().of(
    yup.object({
      date: yup.date().required(),
      price: yup.number().min(0).required(),
    })
  ),
});

type FormValues = yup.InferType<typeof schema>;

const RoomTypeForm: React.FC<RoomTypeFormProps> = ({
  open,
  onClose,
  initialData,
  hotelId,
  onSubmit,
}) => {
  console.log("initialData", initialData);
  const isEdit = !!initialData;
  const [tabIndex, setTabIndex] = useState(0);
  const { user } = useStore<StoreState>((state) => state);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      hotelId: user?.hotelId || "",
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      capacity: initialData?.roomCount ?? 2,
      basePriceFrom: initialData?.priceFrom ?? 0,
      basePriceTo: initialData?.priceTo ?? 0,
      prices: [],
    },
  });

  useEffect(() => {
    if (isEdit && initialData) {
      reset({
        hotelId: user?.hotelId || "",
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        imageUrl: initialData?.imageUrl ?? "",
        capacity: initialData?.roomCount ?? 2,
        basePriceFrom: initialData?.priceFrom ?? 0,
        basePriceTo: initialData?.priceTo ?? 0,
        prices:
          initialData.priceByDates?.map((p) => ({
            date: new Date((p as any).date),
            price: p.price,
          })) || [],
      });
    }
  }, [isEdit, initialData, reset]);

  const submitHandler = async (values: FormValues) => {
    try {
      if (isEdit && initialData) {
        const payload: UpdateRoomTypeRequest = {
          hotelId: user?.hotelId || "",
          name: values.name,
          description: values.description ?? "",
          capacity: values.capacity,
          priceFrom: values.basePriceFrom,
          priceTo: values.basePriceTo,
          priceByDates: values.prices || [],
          imageUrl: values.imageUrl || undefined,
        };
        onSubmit(payload);
        return;
      }

      const createPayload: CreateRoomTypeRequest = {
        hotelId: values.hotelId || hotelId || "",
        name: values.name,
        description: values.description ?? "",
        capacity: values.capacity,
        priceFrom: values.basePriceFrom,
        priceTo: values.basePriceTo,
        priceByDates: values.prices || [],
        imageUrl: values.imageUrl || undefined,
      };

      onSubmit(createPayload);
    } catch (err: any) {
      setError("root", {
        message: err?.message || "Có lỗi khi tạo loại phòng hoặc thiết lập giá",
      });
    } finally {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle fontWeight={600}>
        {isEdit ? "Chỉnh sửa loại phòng" : "Thêm loại phòng & Giá"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Thiết lập thông tin và giá cho loại phòng
        </Typography>

        {/* Common fields */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          sx={{ borderRadius: 2 }}
          gap={2}
        >
          <Tooltip title="Nhập tên loại phòng hiển thị cho khách">
            <TextField
              label="Tên"
              fullWidth
              margin="normal"
              {...register("name")}
              error={!!errors.name}
              placeholder="Nhập tên loại phòng"
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeWorkIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Tooltip>
          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <Tooltip title="Số khách tối đa của loại phòng">
                <TextField
                  {...field}
                  label="Sức chứa"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.capacity}
                  helperText={errors.capacity?.message}
                  inputProps={{ min: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PeopleAltIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Tooltip>
            )}
          />
        </Stack>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Tooltip title="Nhập mô tả loại phòng">
              <TextField
                {...field}
                label="Mô tả"
                type="text"
                fullWidth
                margin="normal"
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{ alignItems: "center" }}
                placeholder="Nhập mô tả loại phòng"
                multiline
                inputProps={{ min: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Tooltip>
          )}
        />
        <Tooltip title="Nhập URL ảnh đại diện của loại phòng">
          <TextField
            label="Image URL"
            fullWidth
            margin="normal"
            {...register("imageUrl")}
            placeholder="https://..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImageIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            error={!!errors.imageUrl}
            helperText={errors.imageUrl?.message}
          />
        </Tooltip>
        {/* Tabs for pricing sections */}
        <Paper
          variant="outlined"
          sx={{ bgcolor: "grey.100", my: 2, borderRadius: 2 }}
        >
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            variant="fullWidth"
          >
            <Tab label="Khoảng giá base" />
            <Tab label="Giá theo ngày" />
          </Tabs>
        </Paper>

        <Stack spacing={2}>
          {tabIndex === 0 && (
            <RoomTypeFormSectionBase control={control} errors={errors as any} />
          )}

          {tabIndex === 1 && (
            <RoomTypeFormSectionDateRange
              control={control}
              errors={errors as any}
            />
          )}
        </Stack>

        {errors.root?.message && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.root.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit(submitHandler)}
          startIcon={<SaveIcon />}
          variant="contained"
          disabled={isSubmitting}
        >
          {isEdit ? "Lưu" : "Tạo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomTypeForm;
