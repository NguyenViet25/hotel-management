import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import bookingsApi, {
  type BookingDetailsDto,
  type RoomMapItemDto,
} from "../../../../../api/bookingsApi";
import RoomCard from "./RoomCard";
import { statusUiFromTimeline } from "../../../../../utils/room-status";

type Props = {
  booking: BookingDetailsDto;
  onAssigned?: () => void;
};

const AssignRoomSection: React.FC<Props> = ({ booking, onAssigned }) => {
  const [rooms, setRooms] = useState<RoomMapItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const startDate = booking?.bookingRoomTypes?.[0]?.startDate;
  const roomTypeId = booking?.bookingRoomTypes?.[0]?.roomTypeId;
  const bookingRoomTypeId = booking?.bookingRoomTypes?.[0]?.bookingRoomTypeId;

  const fetchMap = async () => {
    if (!startDate) return;
    setLoading(true);
    try {
      const res = await bookingsApi.getRoomMap({
        date: startDate,
        hotelId: booking?.hotelId,
      });
      if (res.isSuccess && res.data) setRooms(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchMap();
  }, [booking?.id]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => r.roomTypeId === roomTypeId);
  }, [rooms, roomTypeId]);

  const floorGroups = useMemo(() => {
    const byFloor: Record<string, RoomMapItemDto[]> = {};
    filteredRooms.forEach((r) => {
      const num = r.roomNumber || "";
      const f = /^[0-9]/.test(num) ? num.charAt(0) : "?";
      if (!byFloor[f]) byFloor[f] = [];
      byFloor[f].push(r);
    });
    const entries = Object.entries(byFloor).sort(
      (a, b) => Number(a[0]) - Number(b[0])
    );
    return entries.map(([floor, rooms]) => ({ floor, rooms }));
  }, [filteredRooms]);

  const isAvailable = (room: RoomMapItemDto) => {
    const seg = room.timeline?.[0];
    const s = seg?.status?.toLowerCase();
    return s === "available";
  };

  const assign = async () => {
    if (!selected || !bookingRoomTypeId) return;
    try {
      const res = await bookingsApi.addRoom({
        bookingRoomTypeId,
        roomId: selected,
      });
      if (res.isSuccess) {
        onAssigned?.();
      }
    } catch {}
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader
        title="Chọn Phòng"
        subheader={loading ? "Đang tải danh sách phòng…" : undefined}
      />
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            label={`Loại phòng: ${
              booking?.bookingRoomTypes?.[0]?.roomTypeName || "—"
            }`}
          />
          <Chip label={`Ngày nhận: ${startDate || "—"}`} />
          <Chip
            label={`Số đêm: ${Math.max(
              1,
              booking?.bookingRoomTypes?.[0]?.endDate && startDate
                ? (new Date(booking.bookingRoomTypes[0].endDate).getTime() -
                    new Date(startDate).getTime()) /
                    86400000
                : 1
            )}`}
          />
        </Stack>
        <Stack spacing={2}>
          {floorGroups.map((g) => (
            <Stack key={g.floor} spacing={1}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
              >{`Tầng ${g.floor}`}</Typography>
              <Grid container spacing={2}>
                {g.rooms.map((r) => {
                  const ui = statusUiFromTimeline(r.status);
                  return (
                    <Grid key={r.roomId}>
                      <RoomCard
                        room={r}
                        selected={selected === r.roomId}
                        disabled={!isAvailable(r)}
                        statusLabel={ui.label}
                        statusColor={ui.color}
                        onClick={() => setSelected(r.roomId)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
              <Divider sx={{ my: 1 }} />
            </Stack>
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ mt: 2 }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={!selected}
            onClick={assign}
          >
            Gán Phòng
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AssignRoomSection;
