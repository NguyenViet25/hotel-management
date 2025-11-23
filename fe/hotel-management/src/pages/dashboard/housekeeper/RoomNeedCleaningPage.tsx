import DoneAllIcon from "@mui/icons-material/DoneAll";
import KingBedIcon from "@mui/icons-material/KingBed";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
  MenuItem,
  Select,
  Stack,
  TextField,
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

export default function RoomNeedCleaningPage() {
  const { hotelId, user } = useStore<StoreState>((s) => s);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<HousekeepingTaskDto[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [floorFilter, setFloorFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeRoom, setCompleteRoom] = useState<RoomDto | null>(null);
  const [completeNotes, setCompleteNotes] = useState("");
  const [completeEvidence, setCompleteEvidence] = useState<MediaDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [completeTaskId, setCompleteTaskId] = useState<string>("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrls, setViewerUrls] = useState<string[]>([]);

  const [minibarItems, setMinibarItems] = useState<
    { item: Minibar; qty: number }[]
  >([]);
  const [minibarLoading, setMinibarLoading] = useState(false);
  const [minibarBookingId, setMinibarBookingId] = useState<string>("");

  const statusPriority = (s: number) =>
    s === RoomStatus.Dirty
      ? 0
      : s === RoomStatus.Cleaning
      ? 1
      : s === RoomStatus.Maintenance
      ? 2
      : 3;

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

  const filteredRooms = useMemo(() => {
    const myTaskRoomIds = new Set(tasks.map((t) => t.roomId));
    let rs = rooms.filter(
      (r) =>
        myTaskRoomIds.has(r.id) &&
        (r.status === RoomStatus.Dirty || r.status === RoomStatus.Cleaning)
    );
    if (floorFilter) rs = rs.filter((r) => String(r.floor) === floorFilter);
    if (statusFilter) rs = rs.filter((r) => String(r.status) === statusFilter);
    rs = rs.sort(
      (a, b) =>
        statusPriority(a.status) - statusPriority(b.status) ||
        (a.floor ?? 0) - (b.floor ?? 0) ||
        (a.number || "").localeCompare(b.number || "")
    );
    return rs;
  }, [rooms, tasks, floorFilter, statusFilter]);

  const floors = useMemo(
    () =>
      Array.from(new Set(rooms.map((r) => r.floor))).sort(
        (a, b) => (a ?? 0) - (b ?? 0)
      ),
    [rooms]
  );

  const taskByRoomId = useMemo(() => {
    const map: Record<string, HousekeepingTaskDto | undefined> = {};
    for (const t of tasks) map[t.roomId] = t;
    return map;
  }, [tasks]);

  const statusChip = (status: number) => {
    const s = getRoomStatusString(status);
    const map: Record<
      string,
      { bg: string; text: string; icon?: React.ReactNode }
    > = {
      "Đã dọn": {
        bg: HK.colors.cleanBg,
        text: HK.colors.cleanText,
        icon: <DoneAllIcon fontSize="small" />,
      },
      Bẩn: {
        bg: HK.colors.dirtyBg,
        text: HK.colors.dirtyText,
        icon: <WarningAmberIcon fontSize="small" />,
      },
      "Đang dọn dẹp": {
        bg: HK.colors.cleaningBg,
        text: HK.colors.cleaningText,
        icon: <PlayCircleFilledWhiteIcon fontSize="small" />,
      },
      "Bảo trì": {
        bg: HK.colors.maintBg,
        text: HK.colors.maintText,
        icon: <WarningAmberIcon fontSize="small" />,
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
        icon={cfg.icon}
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

  const openComplete = async (room: RoomDto) => {
    setCompleteRoom(room);
    setCompleteNotes("");
    setCompleteEvidence([]);
    setCompleteTaskId(taskByRoomId[room.id]?.id || "");
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
    setCompleteOpen(true);
  };

  const uploadEvidenceFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (f) => {
          const res = await mediaApi.upload(f);
          return res.data;
        })
      );
      setCompleteEvidence((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const submitComplete = async () => {
    if (!completeRoom) return;
    const urls = completeEvidence.map((m) => m.fileUrl).filter(Boolean);
    if (completeTaskId) {
      await housekeepingTasksApi.complete({
        taskId: completeTaskId,
        notes: completeNotes || undefined,
        evidenceUrls: urls,
      });
    }
    if (minibarBookingId) {
      const items = minibarItems
        .filter((x) => x.qty > 0)
        .map((x) => ({ minibarId: x.item.id, quantity: x.qty }));
      if (items.length) {
        const hasDiscrepancy = minibarItems.some(
          (x) => x.qty > x.item.quantity
        );
        if (hasDiscrepancy) return;
        await bookingsApi.recordMinibarConsumption(minibarBookingId, { items });
      }
    }
    await housekeepingApi.updateRoomStatus({
      roomId: completeRoom.id,
      status: RoomStatus.Clean,
    });
    setCompleteOpen(false);
    setCompleteRoom(null);
    setCompleteEvidence([]);
    setCompleteNotes("");
    setCompleteTaskId("");
    setMinibarItems([]);
    setMinibarBookingId("");
    await refresh();
  };

  return (
    <Box>
      <PageTitle
        title="Phòng cần dọn"
        subtitle="Danh sách phòng thuộc nhiệm vụ của bạn"
      />

      {loading && <Alert severity="info">Đang tải dữ liệu...</Alert>}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Select
          size="small"
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Tất cả tầng</MenuItem>
          {floors.map((f) => (
            <MenuItem key={String(f)} value={String(f)}>
              Tầng {f}
            </MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value={String(RoomStatus.Dirty)}>Bẩn</MenuItem>
          <MenuItem value={String(RoomStatus.Cleaning)}>Đang dọn dẹp</MenuItem>
          <MenuItem value={String(RoomStatus.Clean)}>Đã dọn sạch</MenuItem>
          <MenuItem value={String(RoomStatus.Maintenance)}>Bảo trì</MenuItem>
        </Select>
      </Stack>

      <Grid container spacing={2}>
        {filteredRooms.map((r) => {
          return (
            <Grid size={{ xs: 12, md: 4 }} key={r.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: HK.colors.panelBorder,
                  background: HK.colors.panelBg,
                }}
              >
                <CardContent>
                  <Stack spacing={1.2}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`Phòng ${r.number}`}
                          icon={<KingBedIcon />}
                          sx={{
                            bgcolor: HK.colors.chipGreyBg,
                            color: HK.colors.chipGreyText,
                            borderRadius: 2,
                          }}
                        />
                        <Chip
                          label={`Tầng ${r.floor}`}
                          sx={{
                            bgcolor: HK.colors.chipGreyBg,
                            color: HK.colors.chipGreyText,
                            borderRadius: 2,
                          }}
                        />
                      </Stack>
                      {statusChip(r.status)}
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      {/* <Button
                        size="small"
                        startIcon={<WarningAmberIcon />}
                        variant="outlined"
                        sx={{ borderRadius: 999 }}
                      >
                        Báo sự cố
                      </Button> */}
                    </Stack>
                    <Box
                      sx={{
                        bgcolor: "#F4F6FA",
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Ghi chú: {taskByRoomId[r.id]?.notes || "—"}
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayCircleFilledWhiteIcon />}
                        color="primary"
                        disabled={r.status !== RoomStatus.Dirty}
                        onClick={async () =>
                          await housekeepingApi
                            .updateRoomStatus({
                              roomId: r.id,
                              status: RoomStatus.Cleaning,
                            })
                            .then(refresh)
                        }
                      >
                        Bắt đầu dọn
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DoneAllIcon />}
                        variant="contained"
                        color="success"
                        onClick={() => openComplete(r)}
                        disabled={r.status === RoomStatus.Clean}
                      >
                        Hoàn tất
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {filteredRooms.length === 0 && !loading && (
          <Grid>
            <Typography variant="body2" color="text.secondary">
              Không có phòng cần dọn
            </Typography>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            bgcolor: "primary.main",
            color: "white",
            py: 1.5,
            px: 2,
          }}
        >
          Hoàn tất dọn phòng
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2.5}>
            {/* NOTES */}
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                📝 Ghi chú
              </Typography>
              <TextField
                size="small"
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                multiline
                minRows={3}
                placeholder="Nhập ghi chú về tình trạng phòng..."
                sx={{
                  "& textarea": { fontSize: 14 },
                }}
              />
            </Stack>

            {/* EVIDENCE UPLOAD */}
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                📸 Ảnh minh chứng
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  color="secondary"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  disabled={uploading}
                >
                  Tải ảnh minh chứng
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => uploadEvidenceFiles(e.target.files)}
                  />
                </Button>
                {completeEvidence.length > 0 && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => {
                      setViewerUrls(
                        completeEvidence
                          .map((m) => m.fileUrl || m.filePath)
                          .filter((u): u is string => !!u)
                      );
                      setViewerOpen(true);
                    }}
                  >
                    Xem tất cả ảnh
                  </Button>
                )}
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {completeEvidence.map((m) => (
                  <Chip
                    key={m.id}
                    label={m.fileName || "Ảnh"}
                    icon={<PhotoCameraIcon />}
                    sx={{
                      borderRadius: 1,
                      bgcolor: "grey.100",
                      px: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const urls = completeEvidence
                        .map((x) => x.fileUrl || x.filePath)
                        .filter((u): u is string => !!u);
                      setViewerUrls(urls);
                      setViewerOpen(true);
                    }}
                  />
                ))}
              </Stack>
            </Stack>

            {/* MINIBAR AUDIT */}
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                🛒 Kiểm tra minibar
              </Typography>

              {minibarLoading ? (
                <Typography color="text.secondary">
                  Đang tải minibar...
                </Typography>
              ) : minibarItems.length === 0 ? (
                <Typography color="text.secondary">
                  Không có mặt hàng minibar
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {/* Header Row */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      px: 1,
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "text.secondary",
                    }}
                  >
                    <Typography sx={{ width: "40%" }}>Mặt hàng</Typography>
                    <Typography sx={{ width: "10%", textAlign: "center" }}>
                      SL
                    </Typography>
                    <Typography sx={{ width: "20%", textAlign: "right" }}>
                      Giá
                    </Typography>
                    <Typography sx={{ width: "30%", textAlign: "right" }}>
                      SL dùng
                    </Typography>
                  </Stack>

                  {/* Items */}
                  {minibarItems.map((mi, idx) => (
                    <Stack
                      key={mi.item.id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "grey.50",
                      }}
                    >
                      {/* Name */}
                      <Typography sx={{ width: "40%" }} fontWeight={500}>
                        {mi.item.name}
                      </Typography>

                      <Typography
                        sx={{ width: "10%" }}
                        textAlign={"center"}
                        fontWeight={500}
                      >
                        {mi.item.quantity}
                      </Typography>

                      {/* Price */}
                      <Typography
                        sx={{ width: "20%", textAlign: "right" }}
                        variant="body2"
                      >
                        {mi.item.price.toLocaleString()}₫
                      </Typography>

                      {/* Quantity Input */}
                      <Stack
                        sx={{ width: "30%" }}
                        justifyContent={"end"}
                        justifyItems={"end"}
                      >
                        <TextField
                          type="number"
                          size="small"
                          sx={{ width: "70%", alignSelf: "end" }}
                          inputProps={{ min: 0 }}
                          value={mi.qty}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setMinibarItems((prev) => {
                              const arr = [...prev];
                              arr[idx] = { ...arr[idx], qty: isNaN(v) ? 0 : v };
                              return arr;
                            });
                          }}
                        />
                      </Stack>

                      {/* Status */}
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompleteOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={submitComplete}
            disabled={uploading}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ảnh minh chứng</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 1.5,
            }}
          >
            {viewerUrls.map((url) => (
              <Box key={url} sx={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={url}
                  alt="Evidence"
                  style={{ width: "100%", borderRadius: 8 }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewerOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
