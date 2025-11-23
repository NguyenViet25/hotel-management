import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import KingBedIcon from "@mui/icons-material/KingBed";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import bookingsApi, { type BookingIntervalDto } from "../../../api/bookingsApi";
import housekeepingApi from "../../../api/housekeepingApi";
import housekeepingTasksApi, { type HousekeepingTaskDto } from "../../../api/housekeepingTasksApi";
import minibarApi, { type Minibar } from "../../../api/minibarApi";
import roomsApi, { getRoomStatusString, RoomStatus, type RoomDto } from "../../../api/roomsApi";
import { useStore, type StoreState } from "../../../hooks/useStore";
import PageTitle from "../../../components/common/PageTitle";

const HK = {
  colors: {
    panelBorder: "#E6E8EF",
    panelBg: "#FFFFFF",
    primaryDark: "#0F172A",
    chipGreyBg: "#F2F4F7",
    chipGreyText: "#344054",
    cleanBg: "#DDF7E5",
    cleanText: "#1B5E20",
    cleaningBg: "#FEF3C7",
    cleaningText: "#92400E",
    dirtyBg: "#FDECEC",
    dirtyText: "#C62828",
    maintBg: "#E8ECF7",
    maintText: "#1F2A44",
  },
};

export default function RoomNeedCleaningPage() {
  const { hotelId, user } = useStore<StoreState>((s) => s);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<HousekeepingTaskDto[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [minibarOpen, setMinibarOpen] = useState(false);
  const [minibarRoom, setMinibarRoom] = useState<RoomDto | null>(null);
  const [minibarItems, setMinibarItems] = useState<{ item: Minibar; qty: number }[]>([]);
  const [minibarLoading, setMinibarLoading] = useState(false);
  const [minibarBookingId, setMinibarBookingId] = useState<string>("");

  const statusPriority = (s: number) =>
    s === RoomStatus.Dirty ? 0 : s === RoomStatus.Cleaning ? 1 : s === RoomStatus.Maintenance ? 2 : 3;

  const refresh = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const res = await roomsApi.getRooms({ hotelId, page: 1, pageSize: 500 });
      if (res.isSuccess) setRooms(res.data);
      await refreshTasks();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const refreshTasks = async () => {
    if (!hotelId || !user?.id) return;
    setTasksLoading(true);
    try {
      const res = await housekeepingTasksApi.list({ hotelId, assignedToUserId: user.id, onlyActive: true });
      if (res.isSuccess && Array.isArray(res.data)) setTasks(res.data);
    } finally {
      setTasksLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    const myTaskRoomIds = new Set(tasks.map((t) => t.roomId));
    const rs = rooms
      .filter((r) => myTaskRoomIds.has(r.id) && (r.status === RoomStatus.Dirty || r.status === RoomStatus.Cleaning))
      .sort(
        (a, b) =>
          statusPriority(a.status) - statusPriority(b.status) ||
          (a.floor ?? 0) - (b.floor ?? 0) ||
          (a.number || "").localeCompare(b.number || "")
      );
    return rs;
  }, [rooms, tasks]);

  const statusChip = (status: number) => {
    const s = getRoomStatusString(status);
    const map: Record<string, { bg: string; text: string; icon?: React.ReactNode }> = {
      Clean: { bg: HK.colors.cleanBg, text: HK.colors.cleanText, icon: <DoneAllIcon fontSize="small" /> },
      Dirty: { bg: HK.colors.dirtyBg, text: HK.colors.dirtyText, icon: <WarningAmberIcon fontSize="small" /> },
      Cleaning: { bg: HK.colors.cleaningBg, text: HK.colors.cleaningText, icon: <PlayCircleFilledWhiteIcon fontSize="small" /> },
      Maintenance: { bg: HK.colors.maintBg, text: HK.colors.maintText, icon: <WarningAmberIcon fontSize="small" /> },
    };
    const cfg = map[s] || { bg: HK.colors.chipGreyBg, text: HK.colors.chipGreyText };
    return <Chip size="small" label={s} sx={{ bgcolor: cfg.bg, color: cfg.text, borderRadius: 2, fontWeight: 700 }} icon={cfg.icon} />;
  };

  const getActiveBookingIdForRoom = async (room: RoomDto) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const schedRes = await bookingsApi.roomSchedule(room.id, todayStart.toISOString(), todayEnd.toISOString());
      const intervals = (schedRes.data || []) as BookingIntervalDto[];
      return intervals[0]?.bookingId || "";
    } catch {
      return "";
    }
  };

  const openMinibar = async (room: RoomDto) => {
    setMinibarRoom(room);
    setMinibarLoading(true);
    try {
      const bid = await getActiveBookingIdForRoom(room);
      setMinibarBookingId(bid);
      const res = await minibarApi.list({ roomTypeId: room.roomTypeId, page: 1, pageSize: 200 });
      setMinibarItems((res.data || []).map((it) => ({ item: it, qty: 0 })));
    } catch {
      setMinibarItems([]);
    }
    setMinibarLoading(false);
    setMinibarOpen(true);
  };

  const submitMinibar = async () => {
    if (!minibarRoom || !minibarBookingId) return;
    const items = minibarItems.filter((x) => x.qty > 0).map((x) => ({ minibarId: x.item.id, quantity: x.qty }));
    if (!items.length) return;
    const hasDiscrepancy = minibarItems.some((x) => x.qty > x.item.quantity);
    if (hasDiscrepancy) return;
    await bookingsApi.recordMinibarConsumption(minibarBookingId, { items });
    setMinibarOpen(false);
    setMinibarRoom(null);
    await refresh();
  };

  return (
    <Box>
      <PageTitle title="Phòng cần dọn" subtitle="Danh sách phòng thuộc nhiệm vụ của bạn" />

      {loading && <Alert severity="info">Đang tải dữ liệu...</Alert>}

      <Grid container spacing={2}>
        {filteredRooms.map((r) => {
          const s = getRoomStatusString(r.status);
          return (
            <Grid item xs={12} md={6} lg={4} key={r.id}>
              <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: HK.colors.panelBorder, background: HK.colors.panelBg }}>
                <CardContent>
                  <Stack spacing={1.2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`Phòng ${r.number}`} icon={<KingBedIcon />} sx={{ bgcolor: HK.colors.chipGreyBg, color: HK.colors.chipGreyText, borderRadius: 2 }} />
                        <Chip label={`Tầng ${r.floor}`} sx={{ bgcolor: HK.colors.chipGreyBg, color: HK.colors.chipGreyText, borderRadius: 2 }} />
                        {statusChip(r.status)}
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<EditOutlinedIcon />} variant="outlined" sx={{ borderRadius: 999 }} onClick={() => housekeepingApi.updateRoomStatus({ roomId: r.id, status: r.status }).then(refresh)}>
                        Sửa trạng thái
                      </Button>
                      <Button size="small" startIcon={<WarningAmberIcon />} variant="outlined" sx={{ borderRadius: 999 }}>
                        Báo sự cố
                      </Button>
                      <Button size="small" startIcon={<PhotoCameraIcon />} variant="outlined" sx={{ borderRadius: 999 }}>
                        Ảnh hiện trường
                      </Button>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<PlayCircleFilledWhiteIcon />} sx={{ bgcolor: HK.colors.primaryDark, color: "#fff", borderRadius: 999, "&:hover": { bgcolor: "#0B1324" } }} onClick={() => housekeepingApi.updateRoomStatus({ roomId: r.id, status: RoomStatus.Cleaning }).then(refresh)}>
                        Bắt đầu dọn
                      </Button>
                      <Button size="small" startIcon={<DoneAllIcon />} sx={{ borderRadius: 999, bgcolor: "#EEF6F1", color: HK.colors.cleanText }} onClick={() => housekeepingApi.updateRoomStatus({ roomId: r.id, status: RoomStatus.Clean }).then(refresh)}>
                        Đánh dấu sạch
                      </Button>
                      <Button size="small" startIcon={<LocalBarIcon />} variant="outlined" sx={{ borderRadius: 999 }} onClick={() => openMinibar(r)}>
                        Minibar
                      </Button>
                    </Stack>

                    <Box sx={{ bgcolor: "#F4F6FA", borderRadius: 2, px: 1.5, py: 1 }}>
                      <Typography variant="caption" color="text.secondary">Trạng thái hiện tại: {s}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {filteredRooms.length === 0 && !loading && (
          <Grid item xs={12}><Typography variant="body2" color="text.secondary">Không có phòng cần dọn</Typography></Grid>
        )}
      </Grid>

      <Dialog open={minibarOpen} onClose={() => setMinibarOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ghi nhận minibar</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {minibarLoading ? (
              <Typography>Đang tải...</Typography>
            ) : minibarItems.length === 0 ? (
              <Typography>Không có mặt hàng minibar</Typography>
            ) : (
              minibarItems.map((mi, idx) => (
                <Stack key={mi.item.id} direction="row" spacing={1} alignItems="center">
                  <Chip label={mi.item.name} />
                  <Chip label={`${mi.item.price.toLocaleString()}₫`} />
                  <TextField type="number" size="small" inputProps={{ min: 0 }} value={mi.qty} onChange={(e) => {
                    const v = Number(e.target.value);
                    setMinibarItems((prev) => {
                      const arr = [...prev];
                      arr[idx] = { ...arr[idx], qty: isNaN(v) ? 0 : v };
                      return arr;
                    });
                  }} />
                  {mi.qty > mi.item.quantity && <Chip color="warning" label="Vượt tồn" />}
                </Stack>
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMinibarOpen(false)}>Đóng</Button>
          <Button variant="contained" onClick={submitMinibar}>Ghi nhận</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}