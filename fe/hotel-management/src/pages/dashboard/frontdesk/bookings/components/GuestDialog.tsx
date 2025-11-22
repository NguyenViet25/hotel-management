import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import UploadCCCD from "./UploadCCCD";

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

  const submit = () => {
    onSubmit(guest);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Thông tin khách</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <TextField
            label="Họ và tên"
            value={guest.name}
            onChange={(e) => setGuest({ ...guest, name: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="Căn cước công dân"
            value={guest.idCard}
            onChange={(e) => setGuest({ ...guest, idCard: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="Số điện thoại"
            value={guest.phone}
            onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
            size="small"
            fullWidth
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
          disabled={!guest.name || !guest.phone}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestDialog;
