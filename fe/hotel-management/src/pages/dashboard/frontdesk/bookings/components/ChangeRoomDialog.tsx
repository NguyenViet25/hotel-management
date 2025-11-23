import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingRoomTypeDto,
  type RoomMapItemDto,
  type BookingRoomDto,
} from "../../../../../api/bookingsApi";
import { formatDateTime } from "../../../../../utils/date-helper";
import HotelIcon from "@mui/icons-material/Hotel";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { House } from "@mui/icons-material";

type Props = {
  open: boolean;
  booking: BookingDetailsDto;
  roomType: BookingRoomTypeDto;
  bookingRoom: BookingRoomDto;
  onClose: () => void;
  onConfirm: (roomId: string) => Promise<void> | void;
};

export default function ChangeRoomDialog({
  open,
  booking,
  roomType,
  bookingRoom,
  onClose,
  onConfirm,
}: Props) {
  const [rooms, setRooms] = useState<RoomMapItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const startDate = bookingRoom?.startDate || roomType.startDate;

  useEffect(() => {
    const fetchMap = async () => {
      if (!startDate || !open) return;
      setLoading(true);
      try {
        const res = await bookingsApi.getRoomMap({
          date: startDate,
          hotelId: booking?.hotelId,
        });
        const list = (res as any).data || [];
        setRooms(list);
      } catch {}
      setLoading(false);
    };
    fetchMap();
    if (!open) setSelected(null);
  }, [open, startDate, booking?.hotelId]);

  const filteredRooms = useMemo(
    () =>
      rooms.filter(
        (r) =>
          r.roomTypeId === roomType.roomTypeId &&
          r?.roomId !== bookingRoom?.roomId
      ),
    [rooms, roomType.roomTypeId, bookingRoom?.roomId]
  );

  const isAvailable = (room: RoomMapItemDto) => {
    const seg = room.timeline?.[0];
    const s = (seg?.status || "").toLowerCase();
    return s === "available";
  };

  const floorGroups = useMemo(() => {
    const byFloor: Record<string, RoomMapItemDto[]> = {};
    filteredRooms.forEach((r) => {
      const num = r.floor.toString() || "";
      const f = /^[0-9]/.test(num) ? num.charAt(0) : "?";
      if (!byFloor[f]) byFloor[f] = [];
      byFloor[f].push(r);
    });
    return Object.entries(byFloor).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [filteredRooms]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 2,
          fontWeight: 700,
          textAlign: "center",
          fontSize: 20,
        }}
      >
        Đổi phòng
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={3}>
          {/* Current Room Info */}
          <Stack
            spacing={1.5}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "grey.100",
              border: "1px solid",
              borderColor: "grey.300",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <HotelIcon fontSize="small" /> Phòng hiện tại
            </Typography>

            <Typography variant="body2">
              <strong>Phòng:</strong>{" "}
              {bookingRoom?.roomName || bookingRoom?.roomId}
            </Typography>

            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <strong>Thời gian:</strong>
              {formatDateTime(bookingRoom?.startDate)}
              <ArrowRightAltIcon fontSize="small" />
              {formatDateTime(bookingRoom?.endDate)}
            </Typography>
          </Stack>

          {/* Highlight Section Header */}
          <Stack
            sx={{
              borderRadius: 2,

              color: "primary.dark",

              display: "flex",
              gap: 1,
            }}
          >
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ApartmentIcon /> Danh sách phòng trống cùng loại
            </Typography>
          </Stack>

          {/* Rooms List */}
          <Stack
            spacing={3}
            sx={{
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid #ddd",
              p: 2,
            }}
          >
            {loading ? (
              <Typography textAlign="center" sx={{ py: 3 }}>
                Đang tải danh sách phòng...
              </Typography>
            ) : (
              floorGroups.map(([floor, list]) => (
                <Stack key={floor} spacing={1.5}>
                  {/* Floor Header */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 15,
                      color: "primary.main",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <House fontSize="small" /> Tầng {floor}
                  </Typography>

                  <Grid container spacing={2}>
                    {list.map((room) => {
                      const available = isAvailable(room);
                      const isSelected = selected === room.roomId;

                      return (
                        <Grid size={{ xs: 12, md: 3 }} key={room.roomId}>
                          <Stack
                            spacing={1.2}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: "2px solid",
                              borderColor: isSelected
                                ? "primary.main"
                                : available
                                ? "success.light"
                                : "grey.300",
                              boxShadow: isSelected
                                ? "0 0 0 3px rgba(25,118,210,0.25)"
                                : "0 1px 4px rgba(0,0,0,0.08)",
                              bgcolor: available ? "white" : "grey.100",
                              cursor: available ? "pointer" : "not-allowed",
                              transition: "0.25s",
                              "&:hover": available
                                ? { boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }
                                : {},
                            }}
                            onClick={() =>
                              available && setSelected(room.roomId)
                            }
                          >
                            {/* Top row */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Typography
                                fontWeight={700}
                                sx={{
                                  fontSize: 18,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <MeetingRoomIcon sx={{ fontSize: 18 }} />
                                {room.roomNumber}
                              </Typography>

                              {available ? (
                                <Chip
                                  size="small"
                                  color="success"
                                  label="Trống"
                                  icon={<CheckCircleIcon />}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  color="error"
                                  label="Bận"
                                  icon={<BlockIcon />}
                                />
                              )}
                            </Stack>

                            {/* Select button */}
                            <Button
                              fullWidth
                              size="small"
                              variant={isSelected ? "contained" : "outlined"}
                              disabled={!available}
                            >
                              {isSelected ? "Đã chọn" : "Chọn"}
                            </Button>
                          </Stack>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Divider sx={{ my: 1 }} />
                </Stack>
              ))
            )}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          disabled={!selected}
          onClick={() => onConfirm(selected!)}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
