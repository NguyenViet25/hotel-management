import { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import type {
  BookingDetailsDto,
  BookingGuestDto,
  BookingRoomDto,
} from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  booking: BookingDetailsDto;
  fromRoomId: string;
  guest: BookingGuestDto;
  onClose: () => void;
  onConfirm: (targetBookingRoomId: string) => Promise<void> | void;
};

export default function MoveGuestDialog({
  open,
  booking,
  fromRoomId,
  guest,
  onClose,
  onConfirm,
}: Props) {
  const rooms = useMemo(
    () => booking.bookingRoomTypes.flatMap((rt) => rt.bookingRooms),
    [booking]
  );
  const [targetId, setTargetId] = useState<string>("");

  const candidates = useMemo(
    () => rooms.filter((r) => r.bookingRoomId !== fromRoomId),
    [rooms, fromRoomId]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chuyển khách sang phòng khác</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Khách: {guest?.fullname || "—"}
          </Typography>
          <Typography variant="body2">
            Chọn phòng mục tiêu trong cùng booking
          </Typography>
          <RadioGroup
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            {candidates.map((r: BookingRoomDto) => (
              <FormControlLabel
                key={r.bookingRoomId}
                value={r.bookingRoomId}
                control={<Radio />}
                label={`Phòng ${r.roomName || r.roomId} • Nhận: ${
                  r.startDate
                } • Trả: ${r.endDate}`}
              />
            ))}
          </RadioGroup>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          disabled={!targetId}
          onClick={async () => {
            await onConfirm(targetId);
          }}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
