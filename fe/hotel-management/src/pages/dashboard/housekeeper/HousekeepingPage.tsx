import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ConstructionIcon from "@mui/icons-material/Construction";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import KingBedIcon from "@mui/icons-material/KingBed";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import bookingsApi, { type BookingIntervalDto } from "../../../api/bookingsApi";
import housekeepingApi from "../../../api/housekeepingApi";
import housekeepingTasksApi, {
  type HousekeepingTaskDto,
} from "../../../api/housekeepingTasksApi";
import mediaApi, { type MediaDto } from "../../../api/mediaApi";
import minibarApi, { type Minibar } from "../../../api/minibarApi";
import roomsApi, {
  getRoomStatusString,
  RoomStatus,
  type RoomDto,
} from "../../../api/roomsApi";
import PageTitle from "../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../hooks/useStore";

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

export default function HousekeepingPage() {
  const { hotelId, user } = useStore<StoreState>((s) => s);

  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{
    cleanRooms: number;
    dirtyRooms: number;
    maintenanceRooms: number;
    occupiedRooms: number;
    outOfServiceRooms: number;
    totalRooms: number;
  } | null>(null);

  const [floorFilter, setFloorFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<number>(RoomStatus.Clean);

  const [minibarOpen, setMinibarOpen] = useState(false);
  const [minibarRoom, setMinibarRoom] = useState<RoomDto | null>(null);
  const [minibarItems, setMinibarItems] = useState<
    { item: Minibar; qty: number }[]
  >([]);
  const [minibarLoading, setMinibarLoading] = useState(false);
  const [minibarBookingId, setMinibarBookingId] = useState<string>("");

  const [tasks, setTasks] = useState<HousekeepingTaskDto[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");
  const [completeEvidence, setCompleteEvidence] = useState<MediaDto[]>([]);
  const [completeTaskId, setCompleteTaskId] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const statusPriority = (s: number) =>
    s === RoomStatus.Dirty
      ? 0
      : s === RoomStatus.Cleaning
      ? 1
      : s === RoomStatus.Maintenance
      ? 2
      : 3;

  const filteredRooms = useMemo(() => {
    const myTaskRoomIds = new Set(tasks.map((t) => t.roomId));
    let rs = rooms.filter(
      (r) =>
        myTaskRoomIds.has(r.id) &&
        (r.status === RoomStatus.Dirty || r.status === RoomStatus.Cleaning)
    );
    if (floorFilter) rs = rs.filter((r) => String(r.floor) === floorFilter);
    if (statusFilter) rs = rs.filter((r) => String(r.status) === statusFilter);
    if (search)
      rs = rs.filter((r) =>
        (r.number || "").toLowerCase().includes(search.toLowerCase())
      );
    return [...rs].sort(
      (a, b) =>
        statusPriority(a.status) - statusPriority(b.status) ||
        (a.floor ?? 0) - (b.floor ?? 0) ||
        (a.number || "").localeCompare(b.number || "")
    );
  }, [rooms, tasks, floorFilter, statusFilter, search]);

  const floors = useMemo(
    () =>
      Array.from(new Set(rooms.map((r) => r.floor))).sort(
        (a, b) => (a ?? 0) - (b ?? 0)
      ),
    [rooms]
  );

  const refresh = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const res = await roomsApi.getRooms({ hotelId, page: 1, pageSize: 500 });
      if (res.isSuccess) setRooms(res.data);
      const sum = await housekeepingApi.getSummary(hotelId);
      if (sum.isSuccess && sum.data) setSummary(sum.data);
      await refreshTasks();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  const clearSelection = () => setSelected({});

  const applyBulkStatus = async () => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (!ids.length) return;
    for (const id of ids) {
      try {
        await housekeepingApi.updateRoomStatus({
          roomId: id,
          status: bulkStatus,
        });
      } catch {}
    }
    clearSelection();
    await refresh();
  };

  const statusChip = (status: number) => {
    const s = getRoomStatusString(status);
    const map: Record<
      string,
      { bg: string; text: string; icon?: React.ReactNode }
    > = {
      Clean: {
        bg: HK.colors.cleanBg,
        text: HK.colors.cleanText,
        icon: <DoneAllIcon fontSize="small" />,
      },
      Dirty: {
        bg: HK.colors.dirtyBg,
        text: HK.colors.dirtyText,
        icon: <WarningAmberIcon fontSize="small" />,
      },
      Cleaning: {
        bg: HK.colors.cleaningBg,
        text: HK.colors.cleaningText,
        icon: <CleaningServicesIcon fontSize="small" />,
      },
      Maintenance: {
        bg: HK.colors.maintBg,
        text: HK.colors.maintText,
        icon: <ConstructionIcon fontSize="small" />,
      },
    };
    const cfg = map[s] || {
      bg: HK.colors.chipGreyBg,
      text: HK.colors.chipGreyText,
    };
    return (
      <Chip
        size="small"
        label={s}
        sx={{
          bgcolor: cfg.bg,
          color: cfg.text,
          borderRadius: 2,
          fontWeight: 700,
        }}
        icon={cfg.icon as any}
      />
    );
  };

  const getActiveBookingIdForRoom = async (room: RoomDto) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const schedRes = await bookingsApi.roomSchedule(
        room.id,
        todayStart.toISOString(),
        todayEnd.toISOString()
      );
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
      const res = await minibarApi.list({
        roomTypeId: room.roomTypeId,
        page: 1,
        pageSize: 200,
      });
      setMinibarItems((res.data || []).map((it) => ({ item: it, qty: 0 })));
    } catch {
      setMinibarItems([]);
    }
    setMinibarLoading(false);
    setMinibarOpen(true);
  };

  const submitMinibar = async () => {
    if (!minibarRoom || !minibarBookingId) return;
    const items = minibarItems
      .filter((x) => x.qty > 0)
      .map((x) => ({ minibarId: x.item.id, quantity: x.qty }));
    if (!items.length) return;
    const hasDiscrepancy = minibarItems.some((x) => x.qty > x.item.quantity);
    if (hasDiscrepancy) return;
    await bookingsApi.recordMinibarConsumption(minibarBookingId, { items });
    setMinibarOpen(false);
    setMinibarRoom(null);
  };

  const refreshTasks = async () => {
    if (!hotelId || !user?.id) return;
    setTasksLoading(true);
    try {
      const res = await housekeepingTasksApi.list({
        hotelId,
        assignedToUserId: user.id,
        onlyActive: true,
      });
      if (res.isSuccess && Array.isArray(res.data)) setTasks(res.data);
    } finally {
      setTasksLoading(false);
    }
  };

  const startTask = async (taskId: string) => {
    await housekeepingTasksApi.start({ taskId });
    await refresh();
  };

  const openComplete = (taskId: string) => {
    setCompleteTaskId(taskId);
    setCompleteNotes("");
    setCompleteEvidence([]);
    setCompleteOpen(true);
  };

  const uploadEvidence = async (file: File) => {
    setUploading(true);
    try {
      const res = await mediaApi.upload(file);
      const dto = res.data as MediaDto;
      setCompleteEvidence((prev) => [...prev, dto]);
    } finally {
      setUploading(false);
    }
  };

  const completeTask = async () => {
    const urls = completeEvidence.map((m) => m.fileUrl).filter(Boolean);
    await housekeepingTasksApi.complete({
      taskId: completeTaskId,
      notes: completeNotes || undefined,
      evidenceUrls: urls,
    });
    setCompleteOpen(false);
    setCompleteTaskId("");
    setCompleteEvidence([]);
    await refresh();
  };

  return (
    <Box>
      <PageTitle
        title={"Buồng phòng"}
        subtitle={"Xem danh sách nhiệm vụ, cập nhật trạng thái dọn phòng"}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Phòng bẩn</Typography>
                <Typography variant="h5" color="error.main">
                  {summary?.dirtyRooms ?? 0}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Đang dọn</Typography>
                <Typography variant="h5" color="info.main">
                  {rooms.filter((r) => r.status === RoomStatus.Cleaning).length}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Đã sạch</Typography>
                <Typography variant="h5" color="success.main">
                  {summary?.cleanRooms ?? 0}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Bảo trì</Typography>
                <Typography variant="h5" color="warning.main">
                  {summary?.maintenanceRooms ?? 0}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Typography variant="h6" fontWeight={700}>
            Nhiệm vụ hôm nay
          </Typography>
          {tasksLoading && (
            <Typography variant="body2" color="text.secondary">
              Đang tải…
            </Typography>
          )}
        </Stack>
        <Grid container spacing={2}>
          {tasks.map((t) => (
            <Grid item xs={12} md={6} lg={4} key={t.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: HK.colors.panelBorder,
                }}
              >
                <CardContent>
                  <Stack spacing={1.2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={`Phòng ${t.roomNumber}`}
                        icon={<KingBedIcon />}
                        sx={{
                          bgcolor: HK.colors.chipGreyBg,
                          color: HK.colors.chipGreyText,
                          borderRadius: 2,
                        }}
                      />
                      <Chip
                        label={`Tầng ${t.floor}`}
                        sx={{
                          bgcolor: HK.colors.chipGreyBg,
                          color: HK.colors.chipGreyText,
                          borderRadius: 2,
                        }}
                      />
                      {t.assignedToName && <Chip label={t.assignedToName} />}
                    </Stack>
                    {t.notes && (
                      <Box
                        sx={{
                          bgcolor: "#F4F6FA",
                          borderRadius: 2,
                          px: 1.5,
                          py: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Ghi chú: {t.notes}
                        </Typography>
                      </Box>
                    )}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<PlayCircleFilledWhiteIcon />}
                        sx={{
                          bgcolor: HK.colors.primaryDark,
                          color: "#fff",
                          borderRadius: 999,
                          "&:hover": { bgcolor: "#0B1324" },
                        }}
                        onClick={() => startTask(t.id)}
                      >
                        Bắt đầu dọn
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DoneAllIcon />}
                        sx={{
                          borderRadius: 999,
                          bgcolor: "#EEF6F1",
                          color: HK.colors.cleanText,
                        }}
                        onClick={() => openComplete(t.id)}
                      >
                        Hoàn tất
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {tasks.length === 0 && !tasksLoading && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Không có nhiệm vụ
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {loading && <Alert severity="info">Đang tải dữ liệu...</Alert>}
    </Box>
  );
}
