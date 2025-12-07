import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, Grid, Stack, TextField, Button, Typography, Snackbar, Alert } from "@mui/material";
import bookingsApi, { type BookingDetailsDto } from "../../../../../api/bookingsApi";
import UploadCCCD from "./UploadCCCD";

type GuestForm = {
  name: string;
  phone: string;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
};

type Props = {
  booking: BookingDetailsDto;
  onCheckedIn?: () => void;
};

const CheckInForm: React.FC<Props> = ({ booking, onCheckedIn }) => {
  const roomBookingId = useMemo(() => booking?.bookingRoomTypes?.[0]?.bookingRooms?.[0]?.bookingRoomId, [booking]);
  const [guests, setGuests] = useState<GuestForm[]>([{ name: "", phone: "" }]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" }>({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  const updateGuest = (idx: number, patch: Partial<GuestForm>) => {
    setGuests((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const addGuest = () => setGuests((prev) => [...prev, { name: "", phone: "" }]);
  const removeGuest = (idx: number) => setGuests((prev) => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!booking?.id || !roomBookingId) return;
    setLoading(true);
    try {
      const payload = {
        roomBookingId,
        persons: guests.map((g) => ({
          name: g.name,
          phone: g.phone,
          idCardFrontImageUrl: g.idCardFrontImageUrl || "",
          idCardBackImageUrl: g.idCardBackImageUrl || "",
        })),
      };
      const res = await bookingsApi.checkIn(booking.id, payload as any);
      if (res.isSuccess) {
        setSnackbar({ open: true, message: "Check-in thành công", severity: "success" });
        onCheckedIn?.();
      } else {
        setSnackbar({ open: true, message: res.message || "Không thể check-in", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi khi check-in", severity: "error" });
    }
    setLoading(false);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader title="Check-in Khách" />
      <CardContent>
        <Grid container spacing={2}>
          {guests.map((g, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={700}>{`Khách ${idx + 1}`}</Typography>
                    <TextField label="Họ và tên" value={g.name} onChange={(e) => updateGuest(idx, { name: e.target.value })} size="small" />
                    <TextField label="Số điện thoại" value={g.phone} onChange={(e) => updateGuest(idx, { phone: e.target.value })} size="small" />
                    <UploadCCCD label="Mặt trước" value={g.idCardFrontImageUrl} onChange={(url) => updateGuest(idx, { idCardFrontImageUrl: url })} />
                    <UploadCCCD label="Mặt sau" value={g.idCardBackImageUrl} onChange={(url) => updateGuest(idx, { idCardBackImageUrl: url })} />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {guests.length > 1 && (
                        <Button color="error" onClick={() => removeGuest(idx)}>Xóa</Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={addGuest}>Thêm khách</Button>
          <Button variant="contained" color="primary" onClick={submit} disabled={loading || !roomBookingId}>Check-in Khách</Button>
        </Stack>
      </CardContent>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Card>
  );
};

export default CheckInForm;