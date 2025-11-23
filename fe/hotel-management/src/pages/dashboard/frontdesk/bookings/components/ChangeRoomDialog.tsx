import { useEffect, useMemo, useState } from "react";
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack, Typography } from "@mui/material";
import bookingsApi, { type BookingDetailsDto, type BookingRoomTypeDto, type RoomMapItemDto } from "../../../../../api/bookingsApi";

type Props = {
  open: boolean;
  booking: BookingDetailsDto;
  roomType: BookingRoomTypeDto;
  onClose: () => void;
  onConfirm: (roomId: string) => Promise<void> | void;
};

export default function ChangeRoomDialog({ open, booking, roomType, onClose, onConfirm }: Props) {
  const [rooms, setRooms] = useState<RoomMapItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const startDate = roomType.startDate;

  useEffect(() => {
    const fetchMap = async () => {
      if (!startDate || !open) return;
      setLoading(true);
      try {
        const res = await bookingsApi.getRoomMap({ date: startDate, hotelId: booking?.hotelId });
        const list = (res as any).data || [];
        setRooms(list);
      } catch {}
      setLoading(false);
    };
    fetchMap();
    if (!open) setSelected(null);
  }, [open, startDate, booking?.hotelId]);

  const filteredRooms = useMemo(() => rooms.filter((r) => r.roomTypeId === roomType.roomTypeId), [rooms, roomType.roomTypeId]);

  const isAvailable = (room: RoomMapItemDto) => {
    const seg = room.timeline?.[0];
    const s = (seg?.status || "").toLowerCase();
    return s === "available";
  };

  const floorGroups = useMemo(() => {
    const byFloor: Record<string, RoomMapItemDto[]> = {};
    filteredRooms.forEach((r) => {
      const num = r.roomNumber || "";
      const f = /^[0-9]/.test(num) ? num.charAt(0) : "?";
      if (!byFloor[f]) byFloor[f] = [];
      byFloor[f].push(r);
    });
    return Object.entries(byFloor).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [filteredRooms]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Đổi phòng</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">Chọn một phòng cùng loại còn trống</Typography>
          {loading ? <Typography>Đang tải...</Typography> : (
            <Stack spacing={2}>
              {floorGroups.map(([floor, list]) => (
                <Stack key={floor} spacing={1}>
                  <Typography variant="subtitle2">Tầng {floor}</Typography>
                  <Grid container spacing={1}>
                    {list.map((room) => (
                      <Grid key={room.roomId} size={{ xs: 6, md: 3 }}>
                        <Stack spacing={1} sx={{ p: 1, border: "1px solid #eee", borderRadius: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" fontWeight={600}>{room.roomNumber}</Typography>
                            <Chip size="small" label={isAvailable(room) ? "Trống" : "Bận"} color={isAvailable(room) ? "success" : "error"} />
                          </Stack>
                          <Button
                            size="small"
                            variant={selected === room.roomId ? "contained" : "outlined"}
                            disabled={!isAvailable(room)}
                            onClick={() => setSelected(room.roomId)}
                          >
                            Chọn
                          </Button>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                  <Divider sx={{ my: 1 }} />
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" disabled={!selected} onClick={async () => { await onConfirm(selected!); }}>Xác nhận</Button>
      </DialogActions>
    </Dialog>
  );
}