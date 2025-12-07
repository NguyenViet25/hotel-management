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
  BookingRoomTypeDto,
} from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  booking: BookingDetailsDto;
  fromRoomId: string;
  guest: BookingGuestDto;
  roomType: BookingRoomTypeDto;
  onClose: () => void;
  onConfirm: (targetBookingRoomId: string, targetGuestId: string) => Promise<void> | void;
};

export default function MoveGuestDialog({
  open,
  booking,
  fromRoomId,
  guest,
  roomType,
  onClose,
  onConfirm,
}: Props) {
  const roomsInType = useMemo(() => booking.bookingRoomTypes.find((rt) => rt.bookingRoomTypeId === roomType.bookingRoomTypeId)?.bookingRooms ?? [], [booking, roomType.bookingRoomTypeId]);
  const [selection, setSelection] = useState<string>("");

  const candidates = useMemo(
    () => roomsInType.filter((r) => r.bookingRoomId !== fromRoomId),
    [roomsInType, fromRoomId]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Hoán đổi khách giữa phòng cùng loại</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Khách: {guest?.fullname || "—"}
          </Typography>
          <Typography variant="body2">Chọn khách mục tiêu thuộc phòng khác trong cùng loại</Typography>
          <RadioGroup value={selection} onChange={(e) => setSelection(e.target.value)}>
            {candidates.flatMap((r: BookingRoomDto) =>
              (r.guests || []).map((g: BookingGuestDto) => (
                <FormControlLabel
                  key={`${r.bookingRoomId}-${g.guestId}`}
                  value={`${r.bookingRoomId}|${g.guestId}`}
                  control={<Radio />}
                  label={`Phòng ${r.roomName || r.roomId} • ${g.fullname || "Khách"} (${g.phone || ""})`}
                />
              ))
            )}
          </RadioGroup>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" disabled={!selection} onClick={async () => {
          const [targetBookingRoomId, targetGuestId] = selection.split("|");
          await onConfirm(targetBookingRoomId, targetGuestId);
        }}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
