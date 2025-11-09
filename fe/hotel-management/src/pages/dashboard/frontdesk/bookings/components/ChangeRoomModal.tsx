import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import bookingsApi, { type BookingDto } from "../../../../../api/bookingsApi";
import roomsApi, { type RoomDto } from "../../../../../api/roomsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  onSubmitted?: () => void;
};

const ChangeRoomModal: React.FC<Props> = ({ open, onClose, booking, onSubmitted }) => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [newRoomId, setNewRoomId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await roomsApi.getRooms({ page: 1, pageSize: 200 });
        const items = (res as any).data || (res as any).items || [];
        setRooms(items);
      } catch (e) {
        setError("Không thể tải danh sách phòng");
      }
    };
    if (open) loadRooms();
  }, [open]);

  const handleSubmit = async () => {
    if (!booking || !newRoomId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsApi.changeRoom(booking.id, { newRoomId });
      if ((res as any)?.isSuccess) {
        onSubmitted?.();
        onClose();
      } else {
        setError((res as any)?.message || "Không thể đổi phòng");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Đổi phòng</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Phòng mới"
            value={newRoomId}
            onChange={(e) => setNewRoomId(e.target.value)}
            fullWidth
          >
            {rooms.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.number} - {r.typeName}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !newRoomId || !booking}>
          {loading ? "Đang xử lý..." : "Xác nhận đổi phòng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRoomModal;