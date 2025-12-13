import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import UploadCCCD from "../../../frontdesk/bookings/components/UploadCCCD";
import {
  type CreateGuestRequest,
  type GuestDto,
  type UpdateGuestRequest,
} from "../../../../../api/guestsApi";

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

const GuestFormModal: React.FC<Props> = ({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idCard, setIdCard] = useState("");
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");

  useEffect(() => {
    if (mode === "edit" && initial) {
      setFullName(initial.fullName || "");
      setPhone(initial.phone || "");
      setEmail(initial.email || "");
      setIdCard(initial.idCard || "");
      setFrontUrl(initial.idCardFrontImageUrl || "");
      setBackUrl(initial.idCardBackImageUrl || "");
    } else {
      setFullName("");
      setPhone("");
      setEmail("");
      setIdCard("");
      setFrontUrl("");
      setBackUrl("");
    }
  }, [mode, initial, open]);

  const handleSubmit = async () => {
    if (mode === "create") {
      await onSubmit({
        fullName,
        phone,
        email: email || undefined,
        idCard,
        idCardFrontImageUrl: frontUrl || undefined,
        idCardBackImageUrl: backUrl || undefined,
      } as CreateGuestRequest);
    } else {
      await onSubmit({
        fullName: fullName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        idCard: idCard || undefined,
        idCardFrontImageUrl: frontUrl || undefined,
        idCardBackImageUrl: backUrl || undefined,
      } as UpdateGuestRequest);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Thêm khách" : "Cập nhật thông tin khách"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="CMND/CCCD"
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            required
            fullWidth
          />
          <UploadCCCD
            label="CCCD mặt trước"
            value={frontUrl}
            onChange={(url) => setFrontUrl(url || "")}
          />
          <UploadCCCD
            label="CCCD mặt sau"
            value={backUrl}
            onChange={(url) => setBackUrl(url || "")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === "create" ? "Thêm" : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestFormModal;
