import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import housekeepingApi from "../../../../../api/housekeepingApi";
import {
  getRoomStatusString,
  RoomStatus,
  type RoomDto,
} from "../../../../../api/roomsApi";

type Props = {
  rooms: RoomDto[];
  onStatusUpdated?: () => Promise<void> | void;
};

const statusColorMap: Record<string, string> = {
  Clean: "#4CAF50",
  Dirty: "#F44336",
  Maintenance: "#FF9800",
  Available: "#4CAF50",
  Occupied: "#607D8B",
  Cleaning: "#2196F3",
  OutOfService: "#9E9E9E",
};

export default function RoomHygieneList({ rooms, onStatusUpdated }: Props) {
  const [updatingId, setUpdatingId] = useState<string>("");

  const dirtyRooms = useMemo(() => {
    const pri = (s: number) =>
      s === RoomStatus.Dirty
        ? 0
        : s === RoomStatus.Cleaning
        ? 1
        : s === RoomStatus.Maintenance
        ? 2
        : 3;
    return [...rooms].sort(
      (a, b) =>
        pri(a.status as number) - pri(b.status as number) ||
        (a.floor ?? 0) - (b.floor ?? 0) ||
        (a.number || "").localeCompare(b.number || "")
    );
  }, [rooms]);

  const quickUpdate = async (room: RoomDto, status: number) => {
    setUpdatingId(room.id);
    try {
      const res = await housekeepingApi.updateRoomStatus({
        roomId: room.id,
        status,
      });
      if (res.isSuccess) {
        if (onStatusUpdated) await onStatusUpdated();
      }
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6" fontWeight={700}>
          Phòng cần dọn dẹp
        </Typography>
        <Chip
          color="error"
          label={`${
            dirtyRooms.filter((r) => r.status === RoomStatus.Dirty).length
          } phòng bẩn`}
        />
      </Stack>
      <Grid container spacing={1.5}>
        {dirtyRooms.map((r) => {
          const s = getRoomStatusString(r.status);
          const color = statusColorMap[s] || "#9E9E9E";
          const highlight = r.status === RoomStatus.Dirty;
          return (
            <Grid item xs={12} md={6} lg={4} key={r.id}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: highlight ? "error.main" : "divider",
                  bgcolor: highlight ? "error.light" : "background.default",
                }}
              >
                <Chip
                  label={`#${r.number}`}
                  sx={{ bgcolor: "primary.light", color: "white" }}
                />
                <Chip label={s} sx={{ bgcolor: color, color: "white" }} />
                <Select
                  size="small"
                  value={String(r.status)}
                  onChange={(e) => quickUpdate(r, Number(e.target.value))}
                  disabled={updatingId === r.id}
                >
                  <MenuItem value={RoomStatus.Dirty}>Bẩn</MenuItem>
                  <MenuItem value={RoomStatus.Clean}>Đã dọn sạch</MenuItem>
                  <MenuItem value={RoomStatus.Cleaning}>Đang dọn dẹp</MenuItem>
                  <MenuItem value={RoomStatus.Maintenance}>Bảo trì</MenuItem>
                </Select>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => quickUpdate(r, RoomStatus.Clean)}
                  disabled={updatingId === r.id}
                >
                  Đánh dấu sạch
                </Button>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
