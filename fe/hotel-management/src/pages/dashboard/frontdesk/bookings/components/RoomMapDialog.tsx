import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import type { RoomType } from "../../../../../api/roomTypesApi";
import RoomMapTimeline from "./RoomMapTimeline";

export interface RoomMapDialogProps {
  open: boolean;
  onClose: () => void;
  from: Dayjs | null;
  to: Dayjs | null;
  onFromChange: (value: Dayjs | null) => void;
  onToChange: (value: Dayjs | null) => void;
  roomTypeId: string;
  onRoomTypeIdChange: (value: string) => void;
  roomTypes: RoomType[];
  onSelectBooking: (bookingId: string) => void;
}

const RoomMapDialog: React.FC<RoomMapDialogProps> = ({
  open,
  onClose,
  from,
  to,
  onFromChange,
  onToChange,
  roomTypeId,
  onRoomTypeIdChange,
  roomTypes,
  onSelectBooking,
}) => {
  const effectiveFrom = from ?? dayjs();
  const effectiveTo = to ?? dayjs().add(3, "day");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Sơ đồ phòng</DialogTitle>
      <DialogContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Từ ngày"
              value={effectiveFrom}
              onChange={onFromChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Đến ngày"
              value={effectiveTo}
              onChange={onToChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
          <TextField
            select
            label="Loại phòng"
            value={roomTypeId}
            onChange={(e) => onRoomTypeIdChange(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {roomTypes.map((rt) => (
              <MenuItem key={rt.id} value={rt.id}>
                {rt.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {effectiveFrom && effectiveTo ? (
          <RoomMapTimeline
            from={effectiveFrom}
            to={effectiveTo}
            roomTypeId={roomTypeId || undefined}
            onSelectBooking={onSelectBooking}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Chọn khoảng ngày để xem timeline.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomMapDialog;