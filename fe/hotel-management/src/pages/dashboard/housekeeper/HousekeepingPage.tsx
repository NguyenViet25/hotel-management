import React, { useEffect, useMemo, useState } from "react";
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
  Tooltip,
  Typography,
} from "@mui/material";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ConstructionIcon from "@mui/icons-material/Construction";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import housekeepingApi from "../../../api/housekeepingApi";
import roomsApi, { getRoomStatusString, RoomStatus, type RoomDto } from "../../../api/roomsApi";
import minibarApi, { type Minibar } from "../../../api/minibarApi";
import bookingsApi, { type BookingDetailsDto, type BookingIntervalDto } from "../../../api/bookingsApi";
import { useStore, type StoreState } from "../../../hooks/useStore";

const statusColorMap: Record<string, string> = {
  Clean: "#4CAF50",
  Dirty: "#F44336",
  Maintenance: "#FF9800",
  Available: "#4CAF50",
  Occupied: "#607D8B",
  Cleaning: "#2196F3",
  OutOfService: "#9E9E9E",
};

export default function HousekeepingPage() {
  const { hotelId } = useStore<StoreState>((s) => s);

  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ cleanRooms: number; dirtyRooms: number; maintenanceRooms: number; occupiedRooms: number; outOfServiceRooms: number; totalRooms: number } | null>(null);

  const [floorFilter, setFloorFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [view, setView] = useState<"tasks" | "map" | "minibar">("tasks");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<number>(RoomStatus.Clean);

  const [minibarOpen, setMinibarOpen] = useState(false);
  const [minibarRoom, setMinibarRoom] = useState<RoomDto | null>(null);
  const [minibarItems, setMinibarItems] = useState<{ item: Minibar; qty: number }[]>([]);
  const [minibarLoading, setMinibarLoading] = useState(false);
  const [minibarBookingId, setMinibarBookingId] = useState<string>("");

  const statusPriority = (s: number) => (s === RoomStatus.Dirty ? 0 : s === RoomStatus.Cleaning ? 1 : s === RoomStatus.Maintenance ? 2 : 3);

  const filteredRooms = useMemo(() => {
    let rs = rooms;
    if (floorFilter) rs = rs.filter((r) => String(r.floor) === floorFilter);
    if (statusFilter) rs = rs.filter((r) => String(r.status) === statusFilter);
    if (search) rs = rs.filter((r) => (r.number || "").toLowerCase().includes(search.toLowerCase()));
    return [...rs].sort((a, b) => statusPriority(a.status) - statusPriority(b.status) || (a.floor ?? 0) - (b.floor ?? 0) || (a.number || "").localeCompare(b.number || ""));
  }, [rooms, floorFilter, statusFilter, search]);

  const floors = useMemo(() => Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => (a ?? 0) - (b ?? 0)), [rooms]);

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

  const toggleSelect = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  const clearSelection = () => setSelected({});

  const applyBulkStatus = async () => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return;
    for (const id of ids) {
      try {
        await housekeepingApi.updateRoomStatus({ roomId: id, status: bulkStatus });
      } catch {}
    }
    clearSelection();
    await refresh();
  };

  const statusChip = (status: number) => {
    const s = getRoomStatusString(status);
    const color = statusColorMap[s] || "#9E9E9E";
    const icon = s === "Dirty" ? <WarningAmberIcon /> : s === "Clean" ? <DoneAllIcon /> : s === "Cleaning" ? <CleaningServicesIcon /> : s === "Maintenance" ? <ConstructionIcon /> : undefined;
    return <Chip size="small" label={s} sx={{ bgcolor: color, color: "white" }} icon={icon} />;
  };

  const getActiveBookingIdForRoom = async (room: RoomDto) => {
    try {
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
      const schedRes = await bookingsApi.roomSchedule(room.id, todayStart.toISOString(), todayEnd.toISOString());
      const intervals = (schedRes.data || []) as BookingIntervalDto[];
      return intervals[0]?.bookingId || "";
    } catch { return ""; }
  };

  const openMinibar = async (room: RoomDto) => {
    setMinibarRoom(room);
    setMinibarLoading(true);
    try {
      const bid = await getActiveBookingIdForRoom(room);
      setMinibarBookingId(bid);
      const res = await minibarApi.list({ roomTypeId: room.roomTypeId, page: 1, pageSize: 200 });
      setMinibarItems((res.data || []).map((it) => ({ item: it, qty: 0 })));
    } catch { setMinibarItems([]); }
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
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Buồng phòng</Typography>
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small" color="primary">
          <ToggleButton value="tasks">Nhiệm vụ hôm nay</ToggleButton>
          <ToggleButton value="map">Sơ đồ phòng</ToggleButton>
          <ToggleButton value="minibar">Minibar</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}><Card><CardContent><Stack spacing={0.5}><Typography variant="subtitle2">Phòng bẩn</Typography><Typography variant="h5" color="error.main">{summary?.dirtyRooms ?? 0}</Typography></Stack></CardContent></Card></Grid>
        <Grid item xs={6} md={3}><Card><CardContent><Stack spacing={0.5}><Typography variant="subtitle2">Đang dọn</Typography><Typography variant="h5" color="info.main">{rooms.filter(r => r.status === RoomStatus.Cleaning).length}</Typography></Stack></CardContent></Card></Grid>
        <Grid item xs={6} md={3}><Card><CardContent><Stack spacing={0.5}><Typography variant="subtitle2">Đã sạch</Typography><Typography variant="h5" color="success.main">{summary?.cleanRooms ?? 0}</Typography></Stack></CardContent></Card></Grid>
        <Grid item xs={6} md={3}><Card><CardContent><Stack spacing={0.5}><Typography variant="subtitle2">Bảo trì</Typography><Typography variant="h5" color="warning.main">{summary?.maintenanceRooms ?? 0}</Typography></Stack></CardContent></Card></Grid>
      </Grid>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <Select size="small" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
          <MenuItem value="">Tất cả tầng</MenuItem>
          {floors.map((f) => (<MenuItem key={String(f)} value={String(f)}>Tầng {f}</MenuItem>))}
        </Select>
        <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ minWidth: 180 }}>
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value={String(RoomStatus.Dirty)}>Bẩn</MenuItem>
          <MenuItem value={String(RoomStatus.Cleaning)}>Đang dọn dẹp</MenuItem>
          <MenuItem value={String(RoomStatus.Clean)}>Đã dọn sạch</MenuItem>
          <MenuItem value={String(RoomStatus.Maintenance)}>Bảo trì</MenuItem>
        </Select>
        <TextField size="small" placeholder="Tìm số phòng, tên khách…" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><InfoOutlined /></InputAdornment> }} sx={{ flex: 1 }} />
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
            <Typography variant="subtitle2">Đặt trạng thái hàng loạt</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant={bulkStatus === RoomStatus.Cleaning ? "contained" : "outlined"} onClick={() => setBulkStatus(RoomStatus.Cleaning)}>Đang dọn</Button>
              <Button size="small" variant={bulkStatus === RoomStatus.Clean ? "contained" : "outlined"} onClick={() => setBulkStatus(RoomStatus.Clean)}>Đã sạch</Button>
              <Button size="small" color="error" variant={bulkStatus === RoomStatus.Dirty ? "contained" : "outlined"} onClick={() => setBulkStatus(RoomStatus.Dirty)}>Bẩn</Button>
              <Button size="small" color="warning" variant={bulkStatus === RoomStatus.Maintenance ? "contained" : "outlined"} onClick={() => setBulkStatus(RoomStatus.Maintenance)}>Bảo trì</Button>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
              <Button size="small" variant="outlined" onClick={clearSelection}>Bỏ chọn</Button>
              <Button size="small" variant="contained" onClick={applyBulkStatus}>Áp dụng</Button>
            </Stack>
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
              <Card sx={{ borderRadius: 3, borderLeft: "6px solid", borderLeftColor: r.status === RoomStatus.Dirty ? "error.main" : "divider" }}>
                <CardContent>
                  <Stack spacing={1.2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`Phòng ${r.number}`} sx={{ bgcolor: "primary.light", color: "white" }} />
                        <Chip label={`Tầng ${r.floor}`} />
                        {statusChip(r.status)}
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant={selectedFlag ? "contained" : "outlined"} onClick={() => toggleSelect(r.id)}>{selectedFlag ? "Đã chọn" : "Chọn"}</Button>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => housekeepingApi.updateRoomStatus({ roomId: r.id, status: RoomStatus.Dirty }).then(refresh)}>Đánh dấu bẩn</Button>
                      <Button size="small" variant="outlined" onClick={() => housekeepingApi.updateRoomStatus({ roomId: r.id, status: RoomStatus.Cleaning }).then(refresh)}>Đang dọn</Button>
                      <Button size="small" variant="outlined" onClick={() => housekeepingApi.updateRoomStatus({ roomId: r.id, status: RoomStatus.Clean }).then(refresh)}>Đánh dấu sạch</Button>
                      <Button size="small" color="warning" variant="outlined" onClick={() => housekeepingApi.updateRoomStatus({ roomId: r.id, status: RoomStatus.Maintenance }).then(refresh)}>Bảo trì</Button>
                      <Tooltip title="Minibar">
                        <Button size="small" variant="outlined" startIcon={<LocalBarIcon />} onClick={() => openMinibar(r)}>Minibar</Button>
                      </Tooltip>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">Trạng thái hiện tại: {s}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
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
                  {mi.qty > mi.item.quantity && (<Chip color="warning" label="Vượt tồn" />)}
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