import { zodResolver } from "@hookform/resolvers/zod";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { phoneSchema } from "../../../../../validation/phone";
import {
  type CreateGuestRequest,
  type GuestDto,
  type UpdateGuestRequest,
} from "../../../../../api/guestsApi";
import guestsApi from "../../../../../api/guestsApi";
import UploadCCCD from "../../../frontdesk/bookings/components/UploadCCCD";
import { toast } from "react-toastify";

type Props =
  | {
      open: boolean;
      mode: "create";
      initial?: undefined;
      onClose: () => void;
      onSubmit: (payload: CreateGuestRequest) => Promise<void>;
    }
  | {
      open: boolean;
      mode: "edit";
      initial?: GuestDto;
      onClose: () => void;
      onSubmit: (payload: UpdateGuestRequest) => Promise<void>;
    };
const createSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên tối thiểu 2 ký tự")
    .regex(
      /^[a-zA-Z]+$/,
      "Họ tên chỉ được chứa chữ các ký tự chữ cái a-z hoặc A-Z"
    ),
  phone: phoneSchema,
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  idCard: z
    .string("Vui lòng nhập CCCD")
    .trim()
    .regex(/^\d{9}$|^\d{12}$/, "CMND/CCCD không hợp lệ"),
  idCardFrontImageUrl: z.string().optional().or(z.literal("")),
  idCardBackImageUrl: z.string().optional().or(z.literal("")),
});
const updateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên tối thiểu 2 ký tự")
    .regex(
      /^[a-zA-Z]+$/,
      "Họ tên chỉ được chứa chữ các ký tự chữ cái a-z hoặc A-Z"
    ),
  phone: phoneSchema.optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  idCard: z
    .string("Vui lòng nhập CCCD")
    .trim()
    .regex(/^\d{9}$|^\d{12}$/, "CMND/CCCD không hợp lệ"),
  idCardFrontImageUrl: z.string().optional(),
  idCardBackImageUrl: z.string().optional(),
});

const GuestFormModal: React.FC<Props> = ({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}) => {
  const isEditMode = mode === "edit";
  const [dupError, setDupError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(isEditMode ? updateSchema : createSchema),
    defaultValues: isEditMode
      ? {
          fullName: initial?.fullName || "",
          phone: initial?.phone || "",
          email: initial?.email || "",
          idCard: initial?.idCard || "",
          idCardFrontImageUrl: initial?.idCardFrontImageUrl || "",
          idCardBackImageUrl: initial?.idCardBackImageUrl || "",
        }
      : {
          fullName: "",
          phone: "",
          email: "",
          idCard: "",
          idCardFrontImageUrl: "",
          idCardBackImageUrl: "",
        },
  });

  useEffect(() => {
    if (isEditMode && initial) {
      reset({
        fullName: initial.fullName || "",
        phone: initial.phone || "",
        email: initial.email || "",
        idCard: initial.idCard || "",
        idCardFrontImageUrl: initial.idCardFrontImageUrl || "",
        idCardBackImageUrl: initial.idCardBackImageUrl || "",
      });
    } else {
      reset({
        fullName: "",
        phone: "",
        email: "",
        idCard: "",
        idCardFrontImageUrl: "",
        idCardBackImageUrl: "",
      });
    }
  }, [isEditMode, initial, open, reset]);

  const onFormSubmit = async (data: any) => {
    try {
      if (!isEditMode) {
        const payload: CreateGuestRequest = {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || undefined,
          idCard: data.idCard,
          idCardFrontImageUrl: data.idCardFrontImageUrl || undefined,
          idCardBackImageUrl: data.idCardBackImageUrl || undefined,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateGuestRequest = {
          fullName: data.fullName || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          idCard: data.idCard || undefined,
          idCardFrontImageUrl: data.idCardFrontImageUrl || undefined,
          idCardBackImageUrl: data.idCardBackImageUrl || undefined,
        };
        await onSubmit(payload);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Thêm khách" : "Cập nhật thông tin khách"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            {dupError && (
              <Alert
                severity="error"
                sx={{ color: "error.main", fontSize: 13 }}
              >
                {dupError}
              </Alert>
            )}
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Họ tên"
                  placeholder="Nhập họ tên"
                  fullWidth
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message as string}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
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
                  label="Điện thoại"
                  placeholder="Nhập số điện thoại"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message as string}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                    setDupError("");
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
                  placeholder="Nhập email"
                  fullWidth
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
              name="idCard"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CMND/CCCD"
                  placeholder="Nhập CMND/CCCD"
                  fullWidth
                  error={!!errors.idCard}
                  helperText={errors.idCard?.message as string}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardIcon />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                    setDupError("");
                  }}
                />
              )}
            />
            <Controller
              name="idCardFrontImageUrl"
              control={control}
              render={({ field: { value, onChange } }) => (
                <UploadCCCD
                  label="CCCD mặt trước"
                  value={value || ""}
                  onChange={(url) => onChange(url || "")}
                />
              )}
            />
            <Controller
              name="idCardBackImageUrl"
              control={control}
              render={({ field: { value, onChange } }) => (
                <UploadCCCD
                  label="CCCD mặt sau"
                  value={value || ""}
                  onChange={(url) => onChange(url || "")}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button variant="contained" type="submit">
            {mode === "create" ? "Thêm" : "Lưu"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GuestFormModal;
