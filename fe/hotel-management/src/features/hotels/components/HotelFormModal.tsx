import { zodResolver } from "@hookform/resolvers/zod";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BadgeIcon from "@mui/icons-material/Badge";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import KeyIcon from "@mui/icons-material/Key";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Hotel } from "../../../api/hotelService";
import { useHotels } from "../hooks/useHotels";

interface HotelFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  hotel?: Hotel;
}

const createSchema = z.object({
  code: z.string().min(3, "Mã cơ sở phải có ít nhất 3 ký tự"),
  name: z.string().min(3, "Tên cơ sở phải có ít nhất 3 ký tự"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/i, "Số điện thoại không hợp lệ")
    .optional(),
  email: z.string().email("Email không hợp lệ").optional(),
});

const updateSchema = z.object({
  name: z.string().min(3, "Tên cơ sở phải có ít nhất 3 ký tự"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/i, "Số điện thoại không hợp lệ")
    .optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  isActive: z.boolean().optional(),
});

const HotelFormModal: React.FC<HotelFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  hotel,
}) => {
  const isEditMode = !!hotel;
  const { createHotel, updateHotel } = useHotels();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(isEditMode ? updateSchema : createSchema),
    defaultValues: isEditMode
      ? {
          name: hotel?.name || "",
          address: hotel?.address || "",
          phone: hotel?.phone || "",
          email: hotel?.email || "",
          isActive: hotel?.isActive || false,
        }
      : {
          code: "",
          name: "",
          address: "",
          phone: "",
          email: "",
        },
  });

  useEffect(() => {
    if (isEditMode && hotel) {
      reset({
        name: hotel?.name || "",
        address: hotel?.address || "",
        phone: hotel?.phone || "",
        email: hotel?.email || "",
        isActive: hotel?.isActive || false,
      });
    }
  }, [isEditMode, hotel, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && hotel) {
        await updateHotel(hotel.id, data);
      } else {
        await createHotel(data);
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error("Lỗi khi lưu cơ sở:", error);
    }
  };

  return (
    <Dialog open={visible} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isEditMode ? (
          <>
            <EditLocationAltIcon color="primary" />
            <Typography variant="h6">Chỉnh sửa cơ sở</Typography>
          </>
        ) : (
          <>
            <AddBusinessIcon color="primary" />
            <Typography variant="h6">Tạo cơ sở mới</Typography>
          </>
        )}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {!isEditMode && (
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mã cơ sở"
                    placeholder="Nhập mã cơ sở"
                    fullWidth
                    size="medium"
                    error={!!errors.code}
                    helperText={errors.code?.message as string}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            )}

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tên cơ sở"
                  placeholder="Nhập tên cơ sở"
                  fullWidth
                  size="medium"
                  error={!!errors.name}
                  helperText={errors.name?.message as string}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ cơ sở"
                  fullWidth
                  size="medium"
                  error={!!errors.address}
                  helperText={errors.address?.message as string}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  placeholder="Nhập email liên hệ"
                  fullWidth
                  size="medium"
                  error={!!errors.email}
                  helperText={errors.email?.message as string}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  fullWidth
                  size="medium"
                  error={!!errors.phone}
                  helperText={errors.phone?.message as string}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {isEditMode && (
              <Controller
                name="isActive"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        {...field}
                      />
                    }
                    label={value ? "Đang hoạt động" : "Ngừng hoạt động"}
                  />
                )}
              />
            )}
          </Box>

          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Button
              onClick={onCancel}
              color="inherit"
              startIcon={<CancelIcon />}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}
            >
              {isEditMode ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default HotelFormModal;
