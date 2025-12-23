import React, { useEffect, useMemo, useState } from "react";
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
  const [guest, setGuest] = useState<GuestForm>({
    name: "",
    phone: "",
    idCardBackImageUrl: "",
    idCardFrontImageUrl: "",
    idCard: "",
  });

  useEffect(() => {
    if (open)
      setGuest(
        initial || {
          name: "",
          phone: "",
          idCardBackImageUrl: "",
          idCardFrontImageUrl: "",
          idCard: "",
        }
      );
  }, [open, initial]);

  const isPhoneValid = useMemo(() => {
    const v = (guest.phone || "").trim();
    const re = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    return re.test(v);
  }, [guest.phone]);

  const allRequiredFilled = useMemo(() => {
    return Boolean(guest.name && guest.phone && guest.idCard);
  }, [guest]);

  const submit = () => {
    if (!allRequiredFilled || !isPhoneValid) return;

    if (!guest.idCardFrontImageUrl) {
      toast.warning("Vui lòng upload ảnh mặt trước");
      return;
    }

    onSubmit(guest);
  };

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
          {/* Full Name */}
          <TextField
            label="Họ và tên"
            value={guest.name}
            placeholder="Nhập họ và tên"
            onChange={(e) => setGuest({ ...guest, name: e.target.value })}
            fullWidth
            required
            error={!guest.name}
            helperText={!guest.name ? "Bắt buộc nhập họ và tên" : undefined}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          {/* ID Card */}
          <TextField
            label="Căn cước công dân"
            placeholder="Nhập căn cước công dân"
            value={guest.idCard}
            onChange={(e) => setGuest({ ...guest, idCard: e.target.value })}
            fullWidth
            required
            error={!guest.idCard}
            helperText={!guest.idCard ? "Bắt buộc nhập CCCD" : undefined}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          {/* Phone */}
          <TextField
            label="Số điện thoại"
            value={guest.phone}
            placeholder="Nhập số điện thoại"
            onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
            fullWidth
            required
            error={!!guest.phone && !isPhoneValid}
            helperText={
              guest.phone && !isPhoneValid
                ? "Số điện thoại Việt Nam không hợp lệ"
                : undefined
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <UploadCCCD
            label="Mặt trước"
            value={guest.idCardFrontImageUrl}
            onChange={(url) => setGuest({ ...guest, idCardFrontImageUrl: url })}
          />

          <UploadCCCD
            label="Mặt sau"
            value={guest.idCardBackImageUrl}
            onChange={(url) => setGuest({ ...guest, idCardBackImageUrl: url })}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!allRequiredFilled || !isPhoneValid}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestDialog;
