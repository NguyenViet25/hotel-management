import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { ROOM_STATUS_OPTIONS } from "./roomsConstants";

type ChangeRoomStatusModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (newStatus: string) => Promise<void>;
  initialStatus?: string;
};

const ChangeRoomStatusModal: React.FC<ChangeRoomStatusModalProps> = ({ open, onClose, onSubmit, initialStatus }) => {
  const [status, setStatus] = useState<string>(initialStatus ?? "Available");

  useEffect(() => {
    setStatus(initialStatus ?? "Available");
  }, [initialStatus]);

  const handleStatusChange = (e: SelectChangeEvent<string>) => setStatus(e.target.value);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Thay đổi trạng thái phòng</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="status-change-label">Trạng thái</InputLabel>
          <Select labelId="status-change-label" value={status} label="Trạng thái" onChange={handleStatusChange}>
            {ROOM_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSubmit(status)}>Cập nhật</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRoomStatusModal;