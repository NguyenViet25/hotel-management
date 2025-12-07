import { zodResolver } from "@hookform/resolvers/zod";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BedIcon from "@mui/icons-material/Bed";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type {
  MinibarCreate,
  MinibarUpdate,
  Minibar,
} from "../../../../../api/minibarApi";
import roomTypesApi, { type RoomType } from "../../../../../api/roomTypesApi";
import mediaApi from "../../../../../api/mediaApi";
import LinkIcon from "@mui/icons-material/Link";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { MonetizationOn } from "@mui/icons-material";

type Mode = "create" | "edit";

const schema = z.object({
  name: z.string().min(1, "Tên bắt buộc"),
  price: z.number("Giá phải là số").min(0, "Giá không âm"),
  quantity: z.number("Số lượng phải là số").min(0, "Không âm"),
  roomTypeId: z.string().min(1, "Chọn loại phòng"),
  imageUrl: z.string().optional().or(z.literal("")),
});

interface MinibarFormModalProps {
  open: boolean;
  mode?: Mode;
  hotelId: string;
  initialValues?: Minibar;
  onClose: () => void;
  onSubmit: (payload: MinibarCreate | MinibarUpdate) => Promise<void> | void;
}

const MinibarFormModal: React.FC<MinibarFormModalProps> = ({
  open,
  mode = "create",
  hotelId,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      price: initialValues?.price ?? 0,
      quantity: initialValues?.quantity ?? 0,
      roomTypeId: initialValues?.roomTypeId ?? "",
      imageUrl: initialValues?.imageUrl ?? "",
    },
  });

  const [uploading, setUploading] = React.useState(false);

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset({
        name: initialValues.name,
        price: initialValues.price,
        quantity: initialValues.quantity,
        roomTypeId: initialValues.roomTypeId,
        imageUrl: initialValues.imageUrl ?? "",
      });
    }
  }, [mode, initialValues, reset]);

  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);
  useEffect(() => {
    const loadRoomTypes = async () => {
      if (!hotelId) return;
      try {
        const res = await roomTypesApi.getRoomTypes({ hotelId, pageSize: 100 });
        setRoomTypes(res.data || []);
        if (!initialValues && res.data?.[0]?.id) {
          setValue("roomTypeId", res.data[0].id);
        }
      } catch {}
    };
    loadRoomTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const submitHandler = async (values: any) => {
    const payload: MinibarCreate | MinibarUpdate = {
      hotelId,
      roomTypeId: values.roomTypeId,
      name: values.name,
      price: values.price,
      quantity: values.quantity,
      imageUrl: values.imageUrl || undefined,
    };
    await onSubmit(payload);
    reset();
    onClose();
  };

  const roomTypeOptions = useMemo(() => roomTypes || [], [roomTypes]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {mode === "create" ? "Thêm minibar" : "Sửa minibar"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                label="Tên"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.name}
                placeholder="Nhập tên minibar"
                helperText={errors.name?.message as string}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalDrinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <TextField
                {...field}
                label="Đơn giá"
                type="text"
                fullWidth
                value={
                  field.value !== undefined && field.value !== null
                    ? new Intl.NumberFormat("vi-VN").format(Number(field.value))
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  const num = raw ? Number(raw) : 0;
                  field.onChange(num);
                }}
                error={!!errors.price}
                helperText={errors.price?.message}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonetizationOn />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="body2" color="text.secondary">
                        VND
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="quantity"
            render={({ field }) => (
              <TextField
                label="Số lượng"
                type="number"
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.quantity}
                helperText={errors.quantity?.message as string}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2Icon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <FormControl fullWidth>
            <InputLabel id="room-type-label">Loại phòng</InputLabel>
            <Controller
              control={control}
              name="roomTypeId"
              render={({ field }) => (
                <Select
                  labelId="room-type-label"
                  label="Loại phòng"
                  value={field.value}
                  onChange={(e) => field.onChange(String(e.target.value))}
                  error={!!errors.roomTypeId}
                  startAdornment={
                    <InputAdornment position="start">
                      <BedIcon />
                    </InputAdornment>
                  }
                >
                  {roomTypeOptions.map((rt) => (
                    <MenuItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  label="Hình (URL)"
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.imageUrl}
                  helperText={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {(errors.imageUrl?.message as string) ||
                        "Dán liên kết ảnh hoặc tải ảnh lên"}
                      <IconButton component="label" disabled={uploading}>
                        <PhotoCamera />
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            try {
                              setUploading(true);
                              const res = await mediaApi.upload(f);
                              if (res?.isSuccess && res.data?.fileUrl) {
                                setValue("imageUrl", res.data.fileUrl, {
                                  shouldValidate: true,
                                });
                              }
                            } catch {
                            } finally {
                              setUploading(false);
                            }
                            e.currentTarget.value = "";
                          }}
                        />
                      </IconButton>
                    </Stack>
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}
          />
          {watch("imageUrl") && (
            <Box
              sx={{
                mt: 0.5,
                borderRadius: 1,
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: 260,
              }}
            >
              <img
                src={watch("imageUrl")}
                alt="preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ width: "100%", px: 2, pb: 2 }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(submitHandler)}
            disabled={isSubmitting}
          >
            {mode === "create" ? "Tạo" : "Lưu"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default MinibarFormModal;
