import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import UploadCCCD from "./UploadCCCD";

export type GuestFormValue = {
  name: string;
  phone: string;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
};

type Props = {
  open: boolean;
  mode?: "create" | "update";
  initial?: GuestFormValue | null;
  onClose: () => void;
  onSubmit: (guest: GuestFormValue) => void;
};

const GuestForm: React.FC<Props> = ({ open, mode = "create", initial, onClose, onSubmit }) => {
  const [guest, setGuest] = useState<GuestFormValue>({ name: "", phone: "" });

  useEffect(() => {
    if (open) setGuest(initial || { name: "", phone: "" });
  }, [open, initial]);

  const submit = () => {
    if (!guest.name || !guest.phone) return;
    onSubmit(guest);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "create" ? "Thêm Khách Mới" : "Chỉnh sửa Khách"}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <TextField label="Họ và tên" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} size="small" fullWidth />
          <TextField label="Số điện thoại" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} size="small" fullWidth />
          <UploadCCCD label="CCCD mặt trước" value={guest.idCardFrontImageUrl} onChange={(url) => setGuest({ ...guest, idCardFrontImageUrl: url })} />
          <UploadCCCD label="CCCD mặt sau" value={guest.idCardBackImageUrl} onChange={(url) => setGuest({ ...guest, idCardBackImageUrl: url })} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={submit} disabled={!guest.name || !guest.phone}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestForm;