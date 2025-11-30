import { Info } from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ConstructionIcon from "@mui/icons-material/Construction";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import HotelIcon from "@mui/icons-material/Hotel";
import LocalBarIcon from "@mui/icons-material/LocalBar";
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
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingIntervalDto,
  type BookingRoomDto,
} from "../../../../../api/bookingsApi";
import housekeepingApi from "../../../../../api/housekeepingApi";
import mediaApi, { type MediaDto } from "../../../../../api/mediaApi";
import minibarApi, { type Minibar } from "../../../../../api/minibarApi";
import roomsApi, {
  getRoomStatusString,
  type CreateRoomRequest,
  type RoomDto,
  type RoomStatus,
  type UpdateRoomRequest,
} from "../../../../../api/roomsApi";
import roomTypesApi, { type RoomType } from "../../../../../api/roomTypesApi";
import ChangeRoomStatusModal from "../components/ChangeRoomStatusModal";
import RoomFormModal from "../components/RoomFormModal";
import { ROOM_STATUS_OPTIONS } from "../components/roomsConstants";
import { useStore, type StoreState } from "../../../../../hooks/useStore";

interface IProps {
  allowAddNew?: boolean;
}

const RoomMap: React.FC<IProps> = ({ allowAddNew = true }) => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
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
  const [occupancyBooking, setOccupancyBooking] =
    useState<BookingDetailsDto | null>(null);
  const [occupancyRoomBooking, setOccupancyRoomBooking] =
    useState<BookingRoomDto | null>(null);
  const [occupancySchedule, setOccupancySchedule] = useState<
    BookingIntervalDto[]
  >([]);

  const [hkOpen, setHkOpen] = useState(false);
  const [hkRoom, setHkRoom] = useState<RoomDto | null>(null);
  const [hkStatus, setHkStatus] = useState<number | null>(null);
  const [hkNotes, setHkNotes] = useState("");
  const [hkEvidence, setHkEvidence] = useState<MediaDto[]>([]);
  const [hkUploading, setHkUploading] = useState(false);

  const [minibarOpen, setMinibarOpen] = useState(false);
  const [minibarRoom, setMinibarRoom] = useState<RoomDto | null>(null);
  const [minibarItems, setMinibarItems] = useState<
    { item: Minibar; qty: number }[]
  >([]);
  const [minibarLoading, setMinibarLoading] = useState(false);
  const [minibarBookingId, setMinibarBookingId] = useState<string>("");

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

  const floors = useMemo(() => {
    const map: Record<number, RoomDto[]> = {};
    for (const r of rooms) {
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
  }, [rooms]);

  const statusChip = (status: RoomStatus) => {
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
      ) : s === "Occupied" ? (
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
    const todayStart = dayjs().startOf("day").toISOString();
    const todayEnd = dayjs().endOf("day").toISOString();
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
    try {
      const todayStart = dayjs().startOf("day").toISOString();
      const todayEnd = dayjs().endOf("day").toISOString();
      const schedRes = await bookingsApi.roomSchedule(
        room.id,
        todayStart,
        todayEnd
      );
      const intervals = (schedRes.data || []) as BookingIntervalDto[];
      const bookingId = intervals[0]?.bookingId;
      if (!bookingId) {
        setOccupancySchedule([]);
        setOccupancyBooking(null);
        setOccupancyRoomBooking(null);
        return;
      }
      const bookingRes = await bookingsApi.getById(bookingId);
      const booking = bookingRes.data as BookingDetailsDto;
      setOccupancyBooking(booking);
      const br =
        (booking.bookingRoomTypes || [])
          .flatMap((rt) => rt.bookingRooms || [])
          .find(
            (b) => b.roomId === room.id || (b.roomName || "") === room.number
          ) || null;
      setOccupancyRoomBooking(br);
      if (br) {
        const fullSched = await bookingsApi.roomSchedule(
          room.id,
          dayjs(br.startDate).toISOString(),
          dayjs(br.endDate).toISOString()
        );
        setOccupancySchedule((fullSched.data || []) as BookingIntervalDto[]);
      } else {
        setOccupancySchedule(intervals);
      }
    } catch {
      setOccupancyBooking(null);
      setOccupancyRoomBooking(null);
    }
  };

  const openCreate = () => {
    setEditingRoom(null);
    setCreateOpen(true);
  };
  const openEdit = (room: RoomDto) => {
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

  const getActiveBookingIdForRoom = async (room: RoomDto) => {
    try {
      const todayStart = dayjs().startOf("day").toISOString();
      const todayEnd = dayjs().endOf("day").toISOString();
      const schedRes = await bookingsApi.roomSchedule(
        room.id,
        todayStart,
        todayEnd
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
    const bid = await getActiveBookingIdForRoom(room);
    setMinibarBookingId(bid);
    try {
      const res = await minibarApi.list({
        roomTypeId: room.roomTypeId,
        page: 1,
        pageSize: 200,
      });
      const items = (res.data || []).map((it) => ({ item: it, qty: 0 }));
      setMinibarItems(items);
    } catch {
      setMinibarItems([]);
    }
    setMinibarLoading(false);
    setMinibarOpen(true);
  };

  const submitMinibar = async () => {
    if (!minibarRoom || !minibarBookingId) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy booking đang ở",
        severity: "warning",
      });
      return;
    }
    const items = minibarItems
      .filter((x) => x.qty > 0)
      .map((x) => ({ minibarId: x.item.id, quantity: x.qty }));
    const hasDiscrepancy = minibarItems.some((x) => x.qty > x.item.quantity);
    if (hasDiscrepancy) {
      setSnackbar({
        open: true,
        message: "Số lượng vượt quá tồn minibar",
        severity: "warning",
      });
      return;
    }
    if (items.length === 0) {
      setSnackbar({
        open: true,
        message: "Chưa chọn hao hụt minibar",
        severity: "info",
      });
      return;
    }
    try {
      const res = await bookingsApi.recordMinibarConsumption(minibarBookingId, {
        items,
      });
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã ghi nhận minibar",
          severity: "success",
        });
        setMinibarOpen(false);
        setMinibarRoom(null);
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể ghi nhận minibar",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi ghi nhận minibar",
        severity: "error",
      });
    }
  };

  const refreshRooms = async () => {
    try {
      const res = await roomsApi.getRooms({ page: 1, pageSize: 200 });
      if (res.isSuccess) setRooms(res.data);
    } catch {}
  };

  return (
    <Box>
      {allowAddNew && (
        <Card
          onClick={openCreate}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "2px dashed",
            borderColor: "primary.main",
            boxShadow: 0,
            cursor: "pointer",
            transition: "all 150ms ease",
            "&:hover": { boxShadow: 3 },
          }}
        >
          <Stack p={2} direction="row" spacing={1.5} alignItems="center">
            <AddCircleOutlineIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Thêm Phòng Mới
            </Typography>
          </Stack>
        </Card>
      )}

      {floors.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Chưa có phòng. Vui lòng thêm phòng mới.
        </Typography>
      )}

      <Stack spacing={3}>
        {floors.map((floor) => (
          <Card
            key={floor.floor}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "background.paper",
              boxShadow: "0px 4px 14px rgba(0,0,0,0.08)",
              transition: "0.25s ease",
              position: "relative",
              borderLeft: "6px solid",
              borderColor: "primary.main",
              "&:hover": {
                boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* FLOOR HEADER */}
            <Box
              sx={{
                px: 2.5,
                pt: 1.8,
                bgcolor: "linear-gradient(90deg, #1976d2, #42a5f5)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography color="black" variant="h6" fontWeight="700">
                Tầng {floor.floor}
              </Typography>

              <Chip
                label={`${floor.rooms.length} phòng`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "black",
                  backdropFilter: "blur(6px)",
                  fontWeight: 500,
                }}
              />
            </Box>

            <CardContent>
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
                        borderLeft: "6px solid",
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
                      <CardContent sx={{ p: 2, pt: 2 }}>
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

                          {statusChip(r.status as RoomStatus)}
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
                              startIcon={<Info />}
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                openOccupancyDialog(r);
                              }}
                            >
                              Chi tiết
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
                              sx={{ bgcolor: "white" }}
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
                              sx={{ bgcolor: "white" }}
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

                          <Tooltip title="Xoá Phòng">
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
                          </Tooltip>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
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
          } catch (error) {
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {occupancyRoom
            ? `Người đang ở phòng ${occupancyRoom.number}`
            : "Thông tin người ở"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {occupancyRoomBooking ? (
              <>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={`Nhận: ${dayjs(
                      occupancyRoomBooking.startDate
                    ).format("DD/MM/YYYY")}`}
                  />
                  <Chip
                    label={`Trả: ${dayjs(occupancyRoomBooking.endDate).format(
                      "DD/MM/YYYY"
                    )}`}
                  />
                </Stack>
                <Typography variant="subtitle2">Danh sách khách</Typography>
                <Stack spacing={1}>
                  {(occupancyRoomBooking.guests || []).map((g) => (
                    <Stack
                      key={g.guestId}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Chip
                        size="small"
                        icon={<GroupsIcon />}
                        label={g.fullname || "Khách"}
                      />
                      {g.phone && <Chip size="small" label={g.phone} />}
                    </Stack>
                  ))}
                </Stack>
                {occupancyBooking && (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">
                      Thông tin booking
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={`Mã: ${occupancyBooking.id}`} />
                      {occupancyBooking.primaryGuestName && (
                        <Chip
                          label={`Khách chính: ${occupancyBooking.primaryGuestName}`}
                        />
                      )}
                    </Stack>
                  </Stack>
                )}

                {(() => {
                  const br = occupancyRoomBooking;
                  if (!br) return null as any;
                  const start = dayjs(br.startDate);
                  const end = dayjs(br.endDate);
                  const daysCount = Math.max(1, end.diff(start, "day") + 1);
                  const days = Array.from({ length: daysCount }).map((_, i) =>
                    start.add(i, "day")
                  );
                  return (
                    <Box sx={{ width: "100%", overflowX: "auto" }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ minWidth: days.length * 100 }}
                      >
                        {days.map((d) => {
                          const intervals = (occupancySchedule || []).filter(
                            (i) => {
                              const s = dayjs(i.start);
                              const e = dayjs(i.end);
                              const ds = s.startOf("day");
                              const de = e.endOf("day");
                              return (
                                d.isSame(ds, "day") ||
                                d.isSame(de, "day") ||
                                (d.isAfter(ds, "day") && d.isBefore(de, "day"))
                              );
                            }
                          );
                          if (!intervals.length)
                            return (
                              <Box
                                key={d.toISOString()}
                                sx={{ width: 100, height: 32 }}
                              />
                            );
                          const i = intervals[0];
                          const bg =
                            i.status === 2
                              ? "success.light"
                              : i.status === 1
                              ? "warning.light"
                              : "info.light";
                          return (
                            <Tooltip
                              key={d.toISOString()}
                              title={`${dayjs(i.start).format(
                                "DD/MM"
                              )} - ${dayjs(i.end).format("DD/MM")}`}
                            >
                              <Paper
                                sx={{
                                  width: 100,
                                  height: 32,
                                  bgcolor: bg,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Typography variant="caption">
                                  {i.guestName || "—"}
                                </Typography>
                              </Paper>
                            </Tooltip>
                          );
                        })}
                      </Stack>
                    </Box>
                  );
                })()}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không có người ở hoặc chưa có dữ liệu
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOccupancyOpen(false)}>Đóng</Button>
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
