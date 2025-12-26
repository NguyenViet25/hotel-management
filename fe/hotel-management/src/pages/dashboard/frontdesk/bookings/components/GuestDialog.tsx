import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";

import UploadCCCD from "./UploadCCCD";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneSchema } from "../../../../../validation/phone";

type GuestForm = {
  name: string;
  phone: string;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
  idCard?: string;
};

type Props = {
  open: boolean;
  initial?: GuestForm | null;
  onClose: () => void;
  onSubmit: (guest: GuestForm) => void;
};

const GuestDialog: React.FC<Props> = ({ open, initial, onClose, onSubmit }) => {
  const schema = z.object({
    name: z
      .string()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .regex(
        /^[a-zA-Z]+$/,
        "Họ tên chỉ được chứa chữ các ký tự chữ cái a-z hoặc A-Z"
      ),
    idCard: z
      .string("Vui lòng nhập CCCD")
      .trim()
      .regex(/^\d{9}$|^\d{12}$/, "CMND/CCCD không hợp lệ"),
    phone: phoneSchema,
    idCardFrontImageUrl: z.string().optional(),
    idCardBackImageUrl: z.string().optional(),
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<GuestForm>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      idCardBackImageUrl: "",
      idCardFrontImageUrl: "",
      idCard: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initial || {
          name: "",
          phone: "",
          idCardBackImageUrl: "",
          idCardFrontImageUrl: "",
          idCard: "",
        }
      );
    }
  }, [open, initial, reset]);

  const idCardFrontImageUrl = watch("idCardFrontImageUrl");

  const submit = handleSubmit((data) => {
    if (!idCardFrontImageUrl) {
      toast.warning("Vui lòng upload ảnh mặt trước");
      return;
    }
    onSubmit(data);
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Thông tin khách
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 4 }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="idCard"
            render={({ field }) => (
              <TextField
                label="CMND/CCCD"
                placeholder="Nhập CMND/CCCD"
                fullWidth
                required
                error={!!errors.idCard}
                helperText={errors.idCard?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <TextField
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                fullWidth
                required
                error={!!errors.phone}
                helperText={errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                {...field}
              />
            )}
          />

          <UploadCCCD
            label="Mặt trước"
            value={watch("idCardFrontImageUrl")}
            onChange={(url) => setValue("idCardFrontImageUrl", url)}
          />

          <UploadCCCD
            label="Mặt sau"
            value={watch("idCardBackImageUrl")}
            onChange={(url) => setValue("idCardBackImageUrl", url)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={submit} disabled={!isValid}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestDialog;
