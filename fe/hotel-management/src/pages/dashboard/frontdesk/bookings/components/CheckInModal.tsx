import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import bookingsApi, { type BookingDto, type GuestDto } from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  onSubmitted?: () => void;
};

const CheckInModal: React.FC<Props> = ({ open, onClose, booking, onSubmitted }) => {
  const guests = useMemo<GuestDto[]>(() => {
    const list: GuestDto[] = [];
    if (booking?.primaryGuest) list.push(booking.primaryGuest);
    if (booking?.additionalGuests) list.push(...booking.additionalGuests);
    return list;
  }, [booking]);

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!booking) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        guests: guests
          .filter((g) => !!g.id)
          .map((g) => ({ guestId: g.id as string, idCardImageUrl: imageUrls[g.id as string] || g.idCardImageUrl }))
      };
      const res = await bookingsApi.checkIn(booking.id, payload as any);
      if ((res as any)?.isSuccess) {
        onSubmitted?.();
        onClose();
      } else {
        setError((res as any)?.message || "Không thể check-in");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nhận phòng (Check-in)</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Tải ảnh CCCD/ID cho từng khách nếu cần. Bạn có thể dán URL ảnh vào đây.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          {guests.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Booking này chưa có thông tin khách.
            </Typography>
          )}
          {guests.map((g) => (
            <Stack key={g.id || g.fullName} spacing={1}>
              <Typography fontWeight={600}>{g.fullName}</Typography>
              <TextField
                label="URL ảnh CCCD/ID"
                value={imageUrls[g.id as string] ?? g.idCardImageUrl ?? ""}
                onChange={(e) => setImageUrls((prev) => ({ ...prev, [g.id as string]: e.target.value }))}
                placeholder="https://..."
                fullWidth
              />
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !booking}>
          {loading ? "Đang xử lý..." : "Xác nhận Check-in"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckInModal;