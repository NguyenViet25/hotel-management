import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ConstructionIcon from "@mui/icons-material/Construction";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import KingBedIcon from "@mui/icons-material/KingBed";
import LocalBarIcon from "@mui/icons-material/LocalBar";
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
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import bookingsApi, { type BookingIntervalDto } from "../../../api/bookingsApi";
import housekeepingApi from "../../../api/housekeepingApi";
import minibarApi, { type Minibar } from "../../../api/minibarApi";
import roomsApi, {
  getRoomStatusString,
  RoomStatus,
  type RoomDto,
} from "../../../api/roomsApi";
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
  const { hotelId } = useStore<StoreState>((s) => s);

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

  const [view, setView] = useState<"tasks" | "map" | "minibar">("tasks");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<number>(RoomStatus.Clean);

  const [minibarOpen, setMinibarOpen] = useState(false);
  const [minibarRoom, setMinibarRoom] = useState<RoomDto | null>(null);
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

  const filteredRooms = useMemo(() => {
    let rs = rooms;
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
  }, [rooms, floorFilter, statusFilter, search]);

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

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack>
          <Typography variant="h5" fontWeight={800}>
            Buồng phòng
          </Typography>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
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
        <Grid item xs={6} md={3}>
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
        <Grid item xs={6} md={3}>
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
        <Grid item xs={6} md={3}>
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
        <TextField
          size="small"
          placeholder="Tìm số phòng, tên khách…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InfoOutlined />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
      </Stack>

      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: HK.colors.panelBorder,
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Typography variant="body2" color="text.secondary">
              Đã chọn {Object.values(selected).filter(Boolean).length} phòng
            </Typography>
            <Button
              size="small"
              startIcon={<PlayCircleFilledWhiteIcon />}
              sx={{
                bgcolor: HK.colors.primaryDark,
                color: "#fff",
                "&:hover": { bgcolor: "#0B1324" },
                borderRadius: 999,
              }}
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
              onClick={() => setBulkStatus(RoomStatus.Clean)}
            >
              Đánh dấu sạch
            </Button>

            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Đặt trạng thái hàng loạt
            </Typography>
            <Select
              size="small"
              value={String(bulkStatus)}
              onChange={(e) => setBulkStatus(Number(e.target.value))}
              sx={{ minWidth: 160, borderRadius: 999 }}
            >
              <MenuItem value={RoomStatus.Cleaning}>Đang dọn</MenuItem>
              <MenuItem value={RoomStatus.Clean}>Đã sạch</MenuItem>
              <MenuItem value={RoomStatus.Dirty}>Bẩn</MenuItem>
              <MenuItem value={RoomStatus.Maintenance}>Bảo trì</MenuItem>
            </Select>
            <Button
              size="small"
              sx={{
                borderRadius: 999,
                bgcolor: HK.colors.primaryDark,
                color: "#fff",
                "&:hover": { bgcolor: "#0B1324" },
              }}
              onClick={applyBulkStatus}
            >
              Áp dụng
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading && <Alert severity="info">Đang tải dữ liệu...</Alert>}

      <Grid container spacing={2}>
        {filteredRooms.map((r) => {
          const selectedFlag = !!selected[r.id];
          const s = getRoomStatusString(r.status);
          return (
            <Grid item xs={12} md={6} lg={4} key={r.id}>
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
                        {statusChip(r.status)}
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant={selectedFlag ? "contained" : "outlined"}
                          onClick={() => toggleSelect(r.id)}
                          sx={{ borderRadius: 999 }}
                        >
                          {selectedFlag ? "Đã chọn" : "Chọn"}
                        </Button>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<EditOutlinedIcon />}
                        variant="outlined"
                        sx={{ borderRadius: 999 }}
                        onClick={() =>
                          housekeepingApi
                            .updateRoomStatus({
                              roomId: r.id,
                              status: r.status,
                            })
                            .then(refresh)
                        }
                      >
                        Sửa trạng thái
                      </Button>
                      <Button
                        size="small"
                        startIcon={<WarningAmberIcon />}
                        variant="outlined"
                        sx={{ borderRadius: 999 }}
                      >
                        Báo sự cố
                      </Button>
                      <Button
                        size="small"
                        startIcon={<PhotoCameraIcon />}
                        variant="outlined"
                        sx={{ borderRadius: 999 }}
                      >
                        Ảnh hiện trường
                      </Button>
                    </Stack>

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
                        onClick={() =>
                          housekeepingApi
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
                        sx={{
                          borderRadius: 999,
                          bgcolor: "#EEF6F1",
                          color: HK.colors.cleanText,
                        }}
                        onClick={() =>
                          housekeepingApi
                            .updateRoomStatus({
                              roomId: r.id,
                              status: RoomStatus.Clean,
                            })
                            .then(refresh)
                        }
                      >
                        Đánh dấu sạch
                      </Button>
                      <Button
                        size="small"
                        startIcon={<LocalBarIcon />}
                        variant="outlined"
                        sx={{ borderRadius: 999 }}
                        onClick={() => openMinibar(r)}
                      >
                        Minibar
                      </Button>
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
                        Ghi chú: Trạng thái hiện tại: {s}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={minibarOpen}
        onClose={() => setMinibarOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ghi nhận minibar</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {minibarLoading ? (
              <Typography>Đang tải...</Typography>
            ) : minibarItems.length === 0 ? (
              <Typography>Không có mặt hàng minibar</Typography>
            ) : (
              minibarItems.map((mi, idx) => (
                <Stack
                  key={mi.item.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Chip label={mi.item.name} />
                  <Chip label={`${mi.item.price.toLocaleString()}₫`} />
                  <TextField
                    type="number"
                    size="small"
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
                  {mi.qty > mi.item.quantity && (
                    <Chip color="warning" label="Vượt tồn" />
                  )}
                </Stack>
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMinibarOpen(false)}>Đóng</Button>
          <Button variant="contained" onClick={submitMinibar}>
            Ghi nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
