import {
  Add,
  Bed,
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  History,
  Info,
  Person,
  Phone,
  RemoveRedEye,
} from "@mui/icons-material";
import BlockIcon from "@mui/icons-material/Block";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ConstructionIcon from "@mui/icons-material/Construction";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import HotelIcon from "@mui/icons-material/Hotel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  capitalize,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import React, { useEffect, useMemo, useState } from "react";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingIntervalDto,
  type RoomStayHistoryDto,
} from "../../../../../api/bookingsApi";
import housekeepingApi from "../../../../../api/housekeepingApi";
import mediaApi, { type MediaDto } from "../../../../../api/mediaApi";
import roomsApi, {
  getRoomStatusString,
  type CreateRoomRequest,
  type RoomDto,
  type RoomStatus,
  type UpdateRoomRequest,
} from "../../../../../api/roomsApi";
import roomTypesApi, { type RoomType } from "../../../../../api/roomTypesApi";
import EmptyState from "../../../../../components/common/EmptyState";
import Loading from "../../../../../components/common/Loading";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import ChangeRoomStatusModal from "../components/ChangeRoomStatusModal";
import RoomFormModal from "../components/RoomFormModal";
import { ROOM_STATUS_OPTIONS } from "../components/roomsConstants";
interface IProps {
  allowAddNew?: boolean;
}

const RoomMap: React.FC<IProps> = ({ allowAddNew = true }) => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterFloor, setFilterFloor] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<number>(-1);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);

  const [editingRoom, setEditingRoom] = useState<RoomDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const { hotelId } = useStore<StoreState>((state) => state);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({ open: false, message: "", severity: "success" });

  const [occupancyCounts, setOccupancyCounts] = useState<
    Record<string, number>
  >({});
  const [occupancyLoading, setOccupancyLoading] = useState<
    Record<string, boolean>
  >({});
  const [occupancyOpen, setOccupancyOpen] = useState(false);
  const [occupancyRoom, setOccupancyRoom] = useState<RoomDto | null>(null);

  const [occupancyHistory, setOccupancyHistory] = useState<
    RoomStayHistoryDto[]
  >([]);
  const [occCurrentDate, setOccCurrentDate] = useState(dayjs());
  const [occupancyScheduleLoading, setOccupancyScheduleLoading] =
    useState(false);
  const [idCardPreviewOpen, setIdCardPreviewOpen] = useState(false);
  const [idCardPreviewFront, setIdCardPreviewFront] = useState<string | null>(
    null
  );
  const [idCardPreviewBack, setIdCardPreviewBack] = useState<string | null>(
    null
  );
  const [idCardPreviewName, setIdCardPreviewName] = useState<string | null>(
    null
  );

  const [hkOpen, setHkOpen] = useState(false);
  const [hkRoom, setHkRoom] = useState<RoomDto | null>(null);
  const [hkStatus, setHkStatus] = useState<number | null>(null);
  const [hkNotes, setHkNotes] = useState("");
  const [hkEvidence, setHkEvidence] = useState<MediaDto[]>([]);
  const [hkUploading, setHkUploading] = useState(false);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      setRoomTypesLoading(true);
      try {
        const res = await roomTypesApi.getRoomTypes({
          page: 1,
          pageSize: 100,
          hotelId: hotelId ?? "",
        });
        if (res.isSuccess) setRoomTypes(res.data);
      } catch {}
      setRoomTypesLoading(false);
    };
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await roomsApi.getRooms({
          page: 1,
          pageSize: 200,
          hotelId: hotelId ?? "",
        });
        if (res.isSuccess) setRooms(res.data);
      } catch {
        setSnackbar({
          open: true,
          message: "Không thể tải danh sách phòng",
          severity: "error",
        });
      }
      setLoading(false);
    };
    fetchRoomTypes();
    fetchRooms();
  }, []);

  useEffect(() => {
    const occupied = rooms.filter((r) => r.status === 1);
    if (occupied.length) {
      loadOccupancyCounts(occupied);
    }
  }, [rooms]);

  const uniqueFloors = useMemo(() => {
    const s = new Set<number>();
    for (const r of rooms) {
      const f = r.floor ?? 0;
      if (f > 0) s.add(f);
    }
    return Array.from(s).sort((a, b) => a - b);
  }, [rooms]);

  const floors = useMemo(() => {
    const map: Record<number, RoomDto[]> = {};
    const list = rooms.filter((r) => {
      const f = r.floor ?? 0;
      const s = (r.status as number) ?? -1;
      const floorOk = filterFloor === 0 || f === filterFloor;
      const statusOk = filterStatus === -1 || s === filterStatus;
      return floorOk && statusOk;
    });
    for (const r of list) {
      const f = r.floor ?? 0;
      if (!map[f]) map[f] = [];
      map[f].push(r);
    }
    const statusPriority = (s: number) =>
      s === 4 /* Dirty */
        ? 0
        : s === 2 /* Cleaning */
        ? 1
        : s === 6 /* Maintenance */
        ? 2
        : 3;
    return Object.entries(map)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([floor, rs]) => ({
        floor: Number(floor),
        rooms: rs.sort((a, b) => {
          const pa = statusPriority(a.status as number);
          const pb = statusPriority(b.status as number);
          if (pa !== pb) return pa - pb;
          if ((a.number || "") < (b.number || "")) return -1;
          if ((a.number || "") > (b.number || "")) return 1;
          return 0;
        }),
      }));
  }, [rooms, filterFloor, filterStatus]);

  const roomTypeImgMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const rt of roomTypes) {
      map[rt.id] = rt.imageUrl;
    }
    return map;
  }, [roomTypes]);

  const statusChip = (status: number) => {
    const s = getRoomStatusString(status);
    const map: Record<string, { bg: string; text: string; label: string }> = {
      "Sẵn sàng": { bg: "#F2F4F7", text: "#344054", label: "Trống" },
      "Đang sử dụng": { bg: "#E8ECF7", text: "#1F2A44", label: "Đang sử dụng" },
      "Đang dọn dẹp": { bg: "#FEF3C7", text: "#92400E", label: "Đang Dọn Dẹp" },
      "Ngừng phục vụ": { bg: "#EDEDED", text: "#555", label: "Ngừng phục vụ" },
      Bẩn: { bg: "#FDECEC", text: "#C62828", label: "Bẩn" },
      "Đã dọn sạch": { bg: "#DDF7E5", text: "#1B5E20", label: "Đã dọn sạch" },
      "Bảo trì": { bg: "#ccc", text: "#344054", label: "Bảo Trì" },
    };
    const cfg = map[s] || {
      bg: "#F2F4F7",
      text: "#344054",
      label: String(status),
    };
    const icon =
      s === "Sẵn sàng" ? (
        <CheckCircleIcon />
      ) : s === "Đang sử dụng" ? (
        <HotelIcon />
      ) : s === "Đang dọn dẹp" ? (
        <CleaningServicesIcon />
      ) : s === "Bảo trì" ? (
        <ConstructionIcon />
      ) : s === "Ngừng phục vụ" ? (
        <BlockIcon />
      ) : s === "Bẩn" ? (
        <WarningAmberIcon />
      ) : s === "Đã dọn sạch" ? (
        <DoneAllIcon />
      ) : undefined;
    return (
      <Chip
        size="small"
        label={cfg.label}
        sx={{ bgcolor: cfg.bg, color: cfg.text, fontWeight: 700 }}
        icon={icon}
      />
    );
  };

  const loadOccupancyCounts = async (targetRooms: RoomDto[]) => {
    const todayStart = dayjs().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
    const todayEnd = dayjs().endOf("day").format("YYYY-MM-DDTHH:mm:ss");
    const updates: Record<string, number> = {};
    const loadingMap: Record<string, boolean> = {};
    for (const r of targetRooms) {
      loadingMap[r.id] = true;
    }
    setOccupancyLoading((prev) => ({ ...prev, ...loadingMap }));
    for (const r of targetRooms) {
      try {
        const schedRes = await bookingsApi.roomSchedule(
          r.id,
          todayStart,
          todayEnd
        );
        const intervals = (schedRes.data || []) as BookingIntervalDto[];
        if (!intervals.length) {
          updates[r.id] = 0;
          continue;
        }
        const bookingId = intervals[0].bookingId;
        if (!bookingId) {
          updates[r.id] = 0;
          continue;
        }
        const bookingRes = await bookingsApi.getById(bookingId);
        const booking = bookingRes.data as BookingDetailsDto;
        let count = 0;
        const br = (booking.bookingRoomTypes || [])
          .flatMap((rt) => rt.bookingRooms || [])
          .find((b) => b.roomId === r.id || (b.roomName || "") === r.number);
        if (br) count = (br.guests || []).length;
        updates[r.id] = count;
      } catch {
        updates[r.id] = 0;
      }
    }
    setOccupancyCounts((prev) => ({ ...prev, ...updates }));
    const doneMap: Record<string, boolean> = {};
    for (const r of targetRooms) doneMap[r.id] = false;
    setOccupancyLoading((prev) => ({ ...prev, ...doneMap }));
  };

  const openOccupancyDialog = async (room: RoomDto) => {
    setOccupancyOpen(true);
    setOccupancyRoom(room);

    const defaultFrom = dayjs().subtract(1, "month").startOf("day");
    const defaultTo = dayjs().endOf("day");
    setOccCurrentDate(dayjs());
    setOccupancyScheduleLoading(true);
    try {
      const histRes = await bookingsApi.roomHistory(
        room.id,
        defaultFrom.format("YYYY-MM-DDTHH:mm:ss"),
        defaultTo.format("YYYY-MM-DDTHH:mm:ss")
      );
      const hist = (histRes.data || []) as RoomStayHistoryDto[];
      setOccupancyHistory(hist);
    } finally {
      setOccupancyScheduleLoading(false);
    }
  };

  const getWeekRange = (date: dayjs.Dayjs) => {
    const start = date.startOf("week").add(1, "day");
    const end = start.add(6, "day");
    return { start, end };
  };
  const { start: weekStart, end: weekEnd } = useMemo(
    () => getWeekRange(occCurrentDate),
    [occCurrentDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")),
    [weekStart, occCurrentDate]
  );

  const loadHistoryForWeek = async (date: dayjs.Dayjs) => {
    if (!occupancyRoom) return;
    setOccupancyScheduleLoading(true);
    try {
      const { start, end } = getWeekRange(date);
      const res = await bookingsApi.roomHistory(
        occupancyRoom.id,
        start.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        end.endOf("day").format("YYYY-MM-DDTHH:mm:ss")
      );
      const hist = (res.data || []) as RoomStayHistoryDto[];
      setOccupancyHistory(hist);
      setOccCurrentDate(date);
    } finally {
      setOccupancyScheduleLoading(false);
    }
  };

  const openIdCardPreview = (
    front?: string | null,
    back?: string | null,
    name?: string
  ) => {
    if (!front && !back) return;
    setIdCardPreviewFront(front ?? null);
    setIdCardPreviewBack(back ?? null);
    setIdCardPreviewName(name ?? null);
    setIdCardPreviewOpen(true);
  };

  const openCreate = () => {
    setEditingRoom(null);
    setCreateOpen(true);
  };
  const openEdit = (room: RoomDto) => {
    if (!allowAddNew) return;
    setEditingRoom(room);
    setEditOpen(true);
  };
  const openStatus = (room: RoomDto) => {
    setEditingRoom(room);
    setStatusOpen(true);
  };
  const askDelete = (room: RoomDto) => setDeleteTarget(room);

  const uploadEvidenceFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setHkUploading(true);
    const added: MediaDto[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const res = await mediaApi.upload(f);
        if (res.isSuccess && res.data) added.push(res.data);
      } catch {}
    }
    setHkEvidence((prev) => [...prev, ...added]);
    setHkUploading(false);
  };

  const submitHousekeeping = async () => {
    if (!hkRoom || hkStatus === null) return;
    const urls = hkEvidence.map((m) => m.fileUrl).filter(Boolean);
    const notes = urls.length
      ? `${hkNotes} | Evidence: ${urls.join(", ")}`
      : hkNotes;
    try {
      const res = await housekeepingApi.updateRoomStatus({
        roomId: hkRoom.id,
        status: hkStatus,
        notes,
      });
      if (res?.isSuccess) {
        setSnackbar({
          open: true,
          message: "Cập nhật buồng phòng thành công",
          severity: "success",
        });
        setHkOpen(false);
        setHkRoom(null);
        setHkEvidence([]);
        await refreshRooms();
      } else {
        setSnackbar({
          open: true,
          message: res?.message || "Không thể cập nhật buồng phòng",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi cập nhật buồng phòng",
        severity: "error",
      });
    }
  };

  const refreshRooms = async () => {
    try {
      const res = await roomsApi.getRooms({
        page: 1,
        pageSize: 200,
        hotelId: hotelId || "",
      });
      if (res.isSuccess) setRooms(res.data);
    } catch {}
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent={"space-between"}
        sx={{ mb: 2 }}
        spacing={2}
      >
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <TextField
            select
            label="Lọc theo tầng"
            size="small"
            value={filterFloor}
            onChange={(e) => setFilterFloor(Number(e.target.value))}
            SelectProps={{ native: false }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value={0}>Tất cả tầng</MenuItem>
            {uniqueFloors.map((f) => (
              <MenuItem key={f} value={f}>{`Tầng ${f}`}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Lọc theo trạng thái"
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(Number(e.target.value))}
            SelectProps={{ native: false }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value={-1}>Tất cả trạng thái</MenuItem>
            {ROOM_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        {allowAddNew && (
          <Button
            sx={{ mb: 2 }}
            variant="contained"
            startIcon={<Add />}
            onClick={openCreate}
          >
            Thêm Mới
          </Button>
        )}
      </Stack>

      {loading && <Loading label="Đang tải danh sách phòng" />}

      {floors.length === 0 && !loading && (
        <EmptyState
          icon={<Bed />}
          title="Không tìm thấy phòng"
          description="Vui lòng thay đổi bộ lọc hoặc thêm phòng mới."
        />
      )}

      <Stack spacing={3}>
        {floors.map((floor) => (
          <Card
            key={floor.floor}
            sx={{
              p: 2,
              position: "relative",
              border: "2px dashed",
              borderColor: "warning.main",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #FFF8E1 0%, #FFFDF5 100%)",
              "&:before": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: -8,
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "background.paper",
                border: "2px solid",
                borderColor: "warning.main",
              },
              "&:after": {
                content: '""',
                position: "absolute",
                top: "50%",
                right: -8,
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "background.paper",
                border: "2px solid",
                borderColor: "warning.main",
              },
            }}
          >
            {/* FLOOR HEADER */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                mb: 2,
                borderRadius: 2,
                bgcolor: "info.light",
                border: "2px dashed",
                borderColor: "info.main",
              }}
            >
              <HotelIcon color="info" sx={{ color: "white" }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  flexGrow: 1,
                  color: "white",
                }}
              >
                {`Tầng ${floor.floor}`}
              </Typography>
              <Chip
                label={`${floor.rooms.length} phòng`}
                sx={{ color: "white" }}
                variant="outlined"
              />
            </Box>

            <Grid container spacing={2}>
              {floor.rooms.map((r) => (
                <Grid size={{ xs: 12, md: 3 }} key={r.id}>
                  {/* ROOM CARD */}
                  <Card
                    onClick={() => openEdit(r)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.75)",
                      backdropFilter: "blur(6px)",
                      boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                      position: "relative",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderLeft:
                        (r.status as number) === 4 ? "6px solid" : "0px solid",
                      borderLeftColor:
                        (r.status as number) === 4
                          ? "error.main"
                          : "transparent",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0px 6px 20px rgba(0,0,0,0.18)",
                        transform: "translateY(-3px)",
                      },
                      "&:hover .room-actions": {
                        opacity: 1,
                        pointerEvents: "auto",
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Box
                        sx={{
                          overflow: "hidden",
                          height: 180,
                          width: "100%",
                          bgcolor: "grey.100",
                          borderTopLeftRadius: 3,
                          borderTopRightRadius: 3,
                        }}
                      >
                        <img
                          src={
                            roomTypeImgMap[r.roomTypeId] ||
                            "https://via.placeholder.com/640x360?text=Room"
                          }
                          alt={r.roomTypeName}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 4,
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                      <Box sx={{ position: "absolute", top: 8, left: 8 }}>
                        {statusChip(r.status as RoomStatus)}
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2, pt: 1.5 }}>
                      <Stack spacing={1.3}>
                        <Stack spacing={0.5}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              fontSize: "1.25rem",
                              color: "primary.main",
                            }}
                          >
                            #{r.number}
                          </Typography>
                          <Chip
                            label={r.roomTypeName}
                            size="small"
                            sx={{
                              bgcolor: "primary.light",
                              color: "white",
                              fontWeight: 600,
                              borderRadius: 1,
                            }}
                          />
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Chip
                            size="small"
                            icon={<GroupsIcon />}
                            label={
                              occupancyLoading[r.id]
                                ? "Đang tải…"
                                : `${
                                    occupancyCounts[r.id] ??
                                    (r.status === 1 ? 0 : 0)
                                  } người`
                            }
                            sx={{ bgcolor: "grey.200" }}
                          />
                          <Button
                            size="small"
                            startIcon={<History />}
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              openOccupancyDialog(r);
                            }}
                          >
                            Lịch sử
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>

                    {/* ROOM CARD ACTIONS */}
                    {allowAddNew && (
                      <Box
                        className="room-actions"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          display: "flex",
                          gap: 0.7,
                          opacity: 0,
                          transition: "opacity 150ms ease",
                          pointerEvents: "none",
                        }}
                      >
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(r);
                            }}
                            sx={{
                              bgcolor: "white",
                              "&:hover": { bgcolor: "grey.100" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Đổi trạng thái">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openStatus(r);
                            }}
                            sx={{
                              bgcolor: "white",
                              "&:hover": { bgcolor: "grey.100" },
                            }}
                          >
                            <ChangeCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* <Tooltip title="Minibar">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMinibar(r);
                            }}
                            sx={{ bgcolor: "white" }}
                          >
                            <LocalBarIcon fontSize="small" />
                          </IconButton>
                        </Tooltip> */}

                        {/* <Tooltip title="Xoá Phòng">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              askDelete(r);
                            }}
                            sx={{ bgcolor: "white" }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip> */}
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        ))}
      </Stack>

      <RoomFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        roomTypes={roomTypes}
        roomTypesLoading={roomTypesLoading}
        onSubmit={async (payload: CreateRoomRequest) => {
          try {
            const res = await roomsApi.createRoom(payload);
            if (res.isSuccess) {
              setSnackbar({
                open: true,
                message: "Thêm phòng thành công",
                severity: "success",
              });
              setCreateOpen(false);
              refreshRooms();
            } else {
              setSnackbar({
                open: true,
                message: res.message || "Không thể tạo phòng",
                severity: "error",
              });
            }
          } catch (error: any) {
            console.log(error);
            setSnackbar({
              open: true,
              message:
                error.response.data.message || "Đã xảy ra lỗi khi tạo phòng",
              severity: "error",
            });
          }
        }}
      />

      <RoomFormModal
        open={editOpen}
        initialData={editingRoom}
        onClose={() => setEditOpen(false)}
        roomTypes={roomTypes}
        roomTypesLoading={roomTypesLoading}
        onSubmit={async (payload: UpdateRoomRequest) => {
          try {
            if (!editingRoom) return;
            const res = await roomsApi.updateRoom(editingRoom.id, payload);
            if (res.isSuccess) {
              setSnackbar({
                open: true,
                message: "Cập nhật phòng thành công",
                severity: "success",
              });
              setEditOpen(false);
              setEditingRoom(null);
              refreshRooms();
            } else {
              setSnackbar({
                open: true,
                message: res.message || "Không thể cập nhật phòng",
                severity: "error",
              });
            }
          } catch {
            setSnackbar({
              open: true,
              message: "Đã xảy ra lỗi khi cập nhật phòng",
              severity: "error",
            });
          }
        }}
      />

      <ChangeRoomStatusModal
        open={statusOpen}
        initialStatus={editingRoom?.status as any}
        onClose={() => {
          setStatusOpen(false);
          setEditingRoom(null);
        }}
        onSubmit={async (newStatus: any) => {
          try {
            if (!editingRoom) return;
            const res = await roomsApi.updateRoom(editingRoom.id, {
              status: newStatus,
            } as any);
            if (res.isSuccess) {
              setSnackbar({
                open: true,
                message: "Cập nhật trạng thái phòng thành công",
                severity: "success",
              });
              setStatusOpen(false);
              setEditingRoom(null);
              refreshRooms();
            } else {
              setSnackbar({
                open: true,
                message: res.message || "Không thể cập nhật trạng thái",
                severity: "error",
              });
            }
          } catch {
            setSnackbar({
              open: true,
              message: "Đã xảy ra lỗi khi cập nhật trạng thái",
              severity: "error",
            });
          }
        }}
      />

      <Dialog
        open={hkOpen}
        onClose={() => setHkOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cập nhật buồng phòng</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Trạng thái"
              size="small"
              value={hkStatus ?? ROOM_STATUS_OPTIONS[0].value}
              onChange={(e) => setHkStatus(Number(e.target.value))}
              SelectProps={{ native: false }}
            >
              {ROOM_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ghi chú"
              size="small"
              value={hkNotes}
              onChange={(e) => setHkNotes(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Info />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  disabled={hkUploading}
                >
                  Tải lên bằng chứng
                  <input
                    hidden
                    type="file"
                    multiple
                    onChange={(e) => uploadEvidenceFiles(e.target.files)}
                  />
                </Button>
                <Chip label={`${hkEvidence.length} tệp`} />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {hkEvidence.map((m) => (
                  <Chip key={m.id} size="small" label={m.fileName} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHkOpen(false)}>Đóng</Button>
          <Button
            variant="contained"
            onClick={submitHousekeeping}
            disabled={hkUploading}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Xóa phòng</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa phòng {deleteTarget?.number}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!deleteTarget) return;
              try {
                let canDelete = true;
                try {
                  const v = await roomsApi.validateDelete(deleteTarget.id);
                  canDelete = Boolean(v?.isSuccess);
                } catch {}
                if (!canDelete) {
                  setSnackbar({
                    open: true,
                    message: "Phòng có lịch sử đặt, không thể xóa",
                    severity: "warning",
                  });
                  setDeleteTarget(null);
                  return;
                }
                const res = await roomsApi.deleteRoom(deleteTarget.id);
                if (res.isSuccess) {
                  setSnackbar({
                    open: true,
                    message: "Xóa phòng thành công",
                    severity: "success",
                  });
                  setDeleteTarget(null);
                  refreshRooms();
                } else {
                  setSnackbar({
                    open: true,
                    message:
                      "Phòng đã tồn tại dữ liệu liên quan, không thể xóa",
                    severity: "error",
                  });
                }
              } catch {
                setSnackbar({
                  open: true,
                  message: "Đã xảy ra lỗi khi xóa phòng",
                  severity: "error",
                });
              }
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={occupancyOpen}
        onClose={() => setOccupancyOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ minHeight: 500 }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <History color="primary" />
            <Typography variant="h6" fontWeight={700}>
              {`Lịch sử người ở phòng ${occupancyRoom?.number}`}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{
            minHeight: 500,
            maxHeight: 500,
            overflowY: "auto",

            /* Hide scrollbar for Webkit browsers (Chrome, Safari) */
            "&::-webkit-scrollbar": {
              display: "none",
            },

            /* Hide scrollbar for Firefox */
            scrollbarWidth: "none",

            /* Hide scrollbar for IE/Edge */
            msOverflowStyle: "none",
          }}
        >
          <Stack spacing={2}>
            <Stack spacing={1}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <IconButton
                  aria-label="Tuần trước"
                  onClick={() =>
                    loadHistoryForWeek(occCurrentDate.subtract(7, "day"))
                  }
                >
                  <ChevronLeft />
                </IconButton>
                <Chip
                  sx={{ width: "100%" }}
                  label={`${weekStart.format("DD/MM/YYYY")} - ${weekEnd.format(
                    "DD/MM/YYYY"
                  )}`}
                />
                <IconButton
                  aria-label="Tuần sau"
                  onClick={() =>
                    loadHistoryForWeek(occCurrentDate.add(7, "day"))
                  }
                >
                  <ChevronRight />
                </IconButton>
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <DatePicker
                  label="Tuần"
                  value={occCurrentDate}
                  onChange={(v) => v && loadHistoryForWeek(v)}
                  slotProps={{ textField: { size: "small" } }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CalendarMonth />}
                  onClick={() => loadHistoryForWeek(dayjs())}
                >
                  Tuần hiện tại
                </Button>
              </Stack>
              {occupancyScheduleLoading ? (
                <Loading />
              ) : (
                <Grid container spacing={1.5} sx={{ mt: 1 }}>
                  {weekDays.map((d, idx) => {
                    const dayStart = d.startOf("day");
                    const dayEnd = d.endOf("day");
                    const isToday = d.isSame(dayjs(), "day");
                    const items = (occupancyHistory || [])
                      .filter((h) => {
                        const s = dayjs(h.start);
                        const e = dayjs(h.end);
                        return dayStart.isBefore(e) && dayEnd.isAfter(s);
                      })
                      .sort(
                        (a, b) =>
                          dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
                      );
                    return (
                      <Grid size={{ xs: 12 }} key={`${idx}-day`}>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: isToday
                              ? "action.selected"
                              : "background.paper",
                            border: "1px dashed blue",
                          }}
                        >
                          <Stack spacing={0.75}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Chip
                                size="small"
                                color="primary"
                                icon={<CalendarMonth />}
                                label={`${capitalize(
                                  d.locale("vi").format("dddd")
                                )} • ${d.format("DD/MM/YYYY")}`}
                              />
                            </Stack>
                            <Stack spacing={0.75}>
                              {items.length === 0 ? (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Không có người ở trong ngày này
                                </Typography>
                              ) : (
                                items.map((h) => {
                                  const guests = h.guests || [];
                                  return (
                                    <Stack spacing={0.75}>
                                      <TableContainer
                                        component={Paper}
                                        variant="outlined"
                                      >
                                        <Table
                                          size="small"
                                          sx={{ tableLayout: "fixed" }}
                                        >
                                          <TableHead>
                                            <TableRow>
                                              <TableCell sx={{ width: "8%" }}>
                                                STT
                                              </TableCell>
                                              <TableCell sx={{ width: "28%" }}>
                                                Họ và tên
                                              </TableCell>
                                              <TableCell sx={{ width: "28%" }}>
                                                Điện thoại
                                              </TableCell>
                                              <TableCell sx={{ width: "28%" }}>
                                                CMND/CCCD
                                              </TableCell>
                                              <TableCell
                                                sx={{ width: "8%" }}
                                                align="center"
                                              >
                                                Xem
                                              </TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {guests.length > 0 ? (
                                              guests.map((g, idx) => (
                                                <TableRow key={g.guestId}>
                                                  <TableCell>
                                                    {idx + 1}
                                                  </TableCell>
                                                  <TableCell>
                                                    <Chip
                                                      size="small"
                                                      icon={<Person />}
                                                      label={
                                                        g.fullname
                                                          ? `${g.fullname}`
                                                          : "—"
                                                      }
                                                    />
                                                  </TableCell>
                                                  <TableCell>
                                                    <Chip
                                                      size="small"
                                                      icon={<Phone />}
                                                      label={g.phone || "—"}
                                                    />
                                                  </TableCell>
                                                  <TableCell>
                                                    <Chip
                                                      size="small"
                                                      icon={<CreditCard />}
                                                      label={g.idCard || "—"}
                                                    />
                                                  </TableCell>
                                                  <TableCell align="center">
                                                    <IconButton
                                                      size="small"
                                                      color="primary"
                                                      onClick={() =>
                                                        openIdCardPreview(
                                                          g.idCardFrontImageUrl,
                                                          g.idCardBackImageUrl,
                                                          g.fullname ||
                                                            undefined
                                                        )
                                                      }
                                                      disabled={
                                                        !g.idCardFrontImageUrl &&
                                                        !g.idCardBackImageUrl
                                                      }
                                                    >
                                                      <RemoveRedEye />
                                                    </IconButton>
                                                  </TableCell>
                                                </TableRow>
                                              ))
                                            ) : (
                                              <TableRow>
                                                <TableCell colSpan={5}>
                                                  <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                  >
                                                    Không có khách
                                                  </Typography>
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                      >
                                        <Chip
                                          size="small"
                                          icon={<Person />}
                                          color="default"
                                          label={
                                            h.primaryGuestName
                                              ? `Người đặt: ${h.primaryGuestName} - ${h.primaryGuestPhone}`
                                              : "Người đặt: —"
                                          }
                                        />
                                      </Stack>
                                    </Stack>
                                  );
                                })
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOccupancyOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={idCardPreviewOpen}
        onClose={() => {
          setIdCardPreviewOpen(false);
          setIdCardPreviewFront(null);
          setIdCardPreviewBack(null);
          setIdCardPreviewName(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {`CMND/CCCD${idCardPreviewName ? ` - ${idCardPreviewName}` : ""}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} alignItems="center">
            {idCardPreviewFront ? (
              <img
                src={idCardPreviewFront}
                alt={`${idCardPreviewName || ""} - Mặt trước`}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 10,
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />
            ) : null}
            {idCardPreviewBack ? (
              <img
                src={idCardPreviewBack}
                alt={`${idCardPreviewName || ""} - Mặt sau`}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 10,
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIdCardPreviewOpen(false);
              setIdCardPreviewFront(null);
              setIdCardPreviewBack(null);
              setIdCardPreviewName(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoomMap;
