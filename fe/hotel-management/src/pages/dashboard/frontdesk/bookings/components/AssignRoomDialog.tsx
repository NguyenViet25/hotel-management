import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Stack,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingRoomTypeDto,
  type RoomMapItemDto,
} from "../../../../../api/bookingsApi";
import RoomCard from "./RoomCard";
import { statusUiFromTimeline } from "../../../../../utils/room-status";
import { Check, Info, Warning } from "@mui/icons-material";
import { RoomStatus } from "../../../../../api/roomsApi";

type Props = {
  open: boolean;
  booking: BookingDetailsDto;
  roomType: BookingRoomTypeDto;
  onClose: () => void;
  onAssigned?: () => void;
};

const AssignRoomDialog: React.FC<Props> = ({
  open,
  booking,
  roomType,
  onClose,
  onAssigned,
}) => {
  const [rooms, setRooms] = useState<RoomMapItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [reload, setReload] = useState(0);
  const assignedRooms = roomType.bookingRooms || [];
  const remaining = Math.max(
    0,
    (roomType.totalRoom || 0) - assignedRooms.length
  );

  const fetchMap = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.getRoomMap({
        date: roomType.startDate,
        hotelId: booking.hotelId,
      });
      console.log("roomType", roomType);
      if (res.isSuccess && res.data)
        setRooms(res.data.filter((r) => r.roomTypeId === roomType.roomTypeId));
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      setSelected([]);
      fetchMap();
      setReload((prev) => prev + 1);
    }
  }, [open]);

  const isAvailable = (room: RoomMapItemDto) => {
    const seg = room.timeline?.[0];
    const s = (seg?.status || "").toLowerCase();
    return s === "available";
  };

  const statusUi = (room: RoomMapItemDto) => statusUiFromTimeline(room.status);

  const toggleSelect = (roomId: string) => {
    setSelected((prev) => {
      const exists = prev.includes(roomId);
      if (exists) return prev.filter((id) => id !== roomId);
      const next = [...prev, roomId];
      const allowed = next.slice(0, remaining);
      return allowed;
    });
  };

  const floorGroups = useMemo(() => {
    const byFloor: Record<string, RoomMapItemDto[]> = {};
    rooms.forEach((r) => {
      const num = r.roomNumber || "";
      const f = /^[0-9]/.test(num) ? num.charAt(0) : "?";
      if (!byFloor[f]) byFloor[f] = [];
      byFloor[f].push(r);
    });
    return Object.entries(byFloor).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [rooms, reload]);

  console.log("rooms", rooms);

  const confirmAssign = async () => {
    try {
      for (const roomId of selected) {
        await bookingsApi.addRoom({
          bookingRoomTypeId: roomType.bookingRoomTypeId,
          roomId,
        });
      }
      onAssigned?.();
      onClose();
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Chọn Phòng</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip
            color="info"
            icon={<Info />}
            size="small"
            label={`Loại: ${roomType.roomTypeName || "—"}`}
          />
          <Chip
            color="warning"
            icon={<Warning />}
            size="small"
            label={`Cần gán: ${roomType.totalRoom || 0}`}
          />
          <Chip
            icon={<Check />}
            size="small"
            color="success"
            label={`Đã gán: ${assignedRooms.length}`}
          />
        </Stack>
        <Stack spacing={2}>
          {floorGroups.map(([floor, group]) => (
            <Stack key={floor} spacing={1}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
              >{`Tầng ${floor}`}</Typography>
              <Grid container spacing={2}>
                {group.map((r) => {
                  const ui = statusUi(r);
                  const alreadyAssigned = assignedRooms.some(
                    (br) => br.roomId === r.roomId
                  );
                  const disabled =
                    !isAvailable(r) || alreadyAssigned || remaining === 0;

                  const newUi = isAvailable(r)
                    ? { label: "Trống", color: "#2e7d32" }
                    : ui;

                  return (
                    <Grid key={r.roomId}>
                      <RoomCard
                        room={r}
                        selected={selected.includes(r.roomId)}
                        disabled={disabled}
                        statusLabel={newUi.label}
                        statusColor={newUi.color}
                        onClick={() => toggleSelect(r.roomId)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
              <Divider sx={{ my: 1 }} />
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={confirmAssign}
          disabled={!selected.length}
        >
          Gán Phòng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignRoomDialog;
