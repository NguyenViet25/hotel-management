import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  InputAdornment,
  Stack,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHotels } from "../hooks/useHotels";
import type { Hotel } from "../../../api/hotelService";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import KeyIcon from "@mui/icons-material/Key";
import BadgeIcon from "@mui/icons-material/Badge";
import HomeIcon from "@mui/icons-material/Home";

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
});

const updateSchema = z.object({
  name: z.string().min(3, "Tên cơ sở phải có ít nhất 3 ký tự"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
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
          isActive: hotel?.isActive || false,
        }
      : {
          code: "",
          name: "",
          address: "",
        },
  });

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
