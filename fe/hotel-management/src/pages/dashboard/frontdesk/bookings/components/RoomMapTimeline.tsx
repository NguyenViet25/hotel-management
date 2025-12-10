import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  Tooltip,
  Paper,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import bookingsApi, {
  type BookingIntervalDto,
} from "../../../../../api/bookingsApi";
import roomsApi, { type RoomDto } from "../../../../../api/roomsApi";

type Props = {
  from: Dayjs;
  to: Dayjs;
  roomTypeId?: string;
  onSelectBooking?: (bookingId: string) => void;
};

// Simple horizontal timeline per room for the selected range.
const RoomMapTimeline: React.FC<Props> = ({
  from,
  to,
  roomTypeId,
  onSelectBooking,
}) => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [schedules, setSchedules] = useState<
    Record<string, BookingIntervalDto[]>
  >({});
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => {
    const diff = to.diff(from, "day") + 1;
    return Array.from({ length: diff }).map((_, i) => from.add(i, "day"));
  }, [from, to]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const roomsRes = await roomsApi.getRooms({
          page: 1,
          pageSize: 200,
          typeId: roomTypeId,
        });
        const roomList = roomsRes.data || [];
        setRooms(roomList);
        const sched: Record<string, BookingIntervalDto[]> = {};
        for (const r of roomList) {
          const res = await bookingsApi.roomSchedule(
            r.id,
            from.format("YYYY-MM-DDTHH:mm:ss"),
            to.format("YYYY-MM-DDTHH:mm:ss")
          );
          sched[r.id] = (res as any).data || [];
        }
        setSchedules(sched);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [from, to, roomTypeId]);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ minWidth: days.length * 120, pb: 1 }}
      >
        <Box sx={{ width: 180 }} />
        {days.map((d) => (
          <Box
            key={d.format("YYYY-MM-DD")}
            sx={{ width: 120, textAlign: "center" }}
          >
            <Typography variant="caption">{d.format("DD/MM")}</Typography>
          </Box>
        ))}
      </Stack>
      <Divider />
      <Stack spacing={1} sx={{ mt: 1 }}>
        {rooms.map((room) => (
          <Stack key={room.id} direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 180 }}>
              <Typography variant="body2" fontWeight={600}>
                {room.number}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {room.roomTypeName}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", gap: 0.5, minWidth: days.length * 120 }}
            >
              {days.map((d) => {
                const intervals = (schedules[room.id] || []).filter((i) => {
                  const start = dayjs(i.start);
                  const end = dayjs(i.end);
                  const dayStart = start.startOf("day");
                  const dayEnd = end.endOf("day");
                  return (
                    d.isSame(dayStart, "day") ||
                    d.isSame(dayEnd, "day") ||
                    (d.isAfter(dayStart, "day") && d.isBefore(dayEnd, "day"))
                  );
                });
                if (intervals.length === 0) {
                  return (
                    <Box
                      key={`${room.id}-${d.format("YYYY-MM-DDTHH:mm:ss")}`}
                      sx={{ width: 120, height: 36 }}
                    />
                  );
                }
                return (
                  <Box
                    key={`${room.id}-${d.format("YYYY-MM-DDTHH:mm:ss")}`}
                    sx={{ width: 120, height: 36, position: "relative" }}
                  >
                    {intervals.map((i) => (
                      <Tooltip
                        key={i.bookingId}
                        title={`${dayjs(i.start).format("DD/MM")} - ${dayjs(
                          i.end
                        ).format("DD/MM")}`}
                      >
                        <Paper
                          elevation={1}
                          onClick={() => onSelectBooking?.(i.bookingId)}
                          sx={{
                            position: "absolute",
                            left: 2,
                            right: 2,
                            top: 4,
                            bottom: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor:
                              i.status === 2
                                ? "success.light"
                                : i.status === 1
                                ? "warning.light"
                                : "info.light",
                            cursor: "pointer",
                          }}
                        >
                          <Typography variant="caption">
                            {i.guestName}
                          </Typography>
                        </Paper>
                      </Tooltip>
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Stack>
        ))}
        {rooms.length === 0 && !loading && (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <Chip label="Không có phòng trong bộ lọc" />
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default RoomMapTimeline;
