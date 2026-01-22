import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Hotel as HotelIcon,
  Bed,
  Circle,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";
import roomsApi, {
  type CreateRoomRequest,
  type RoomDto,
  type UpdateRoomRequest,
} from "../../../../../api/roomsApi";
import roomTypesApi, { type RoomType } from "../../../../../api/roomTypesApi";
import ChangeRoomStatusModal from "../components/ChangeRoomStatusModal";
import RoomFormModal from "../components/RoomFormModal";
import RoomTable from "../components/RoomTable";
import { ROOM_STATUS_OPTIONS } from "../components/roomsConstants";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import dayjs from "dayjs";

// Status options and chips have been moved into dedicated components

// Main page component
const RoomManagementPage: React.FC = () => {
  // Table & pagination state
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const { hotelId } = useStore<StoreState>((state) => state);

  // Filters
  const [status, setFilterStatus] = useState<number>(-1);
  const [floor, setFilterFloor] = useState<number>(0);
  const [typeId, setTypeId] = useState<number>();
  const [searchNumber, setSearchNumber] = useState<string>(""); // use DataTable search
  const [overviewDate, setOverviewDate] = useState(dayjs());

  // Room types for filter and form
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState<boolean>(false);

  // Dialog state
  const [editingRoom, setEditingRoom] = useState<RoomDto | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoomDto | null>(null);

  // Notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    setFilterFloor(0);
    setFilterStatus(-1);
  }, [overviewDate]);
  // Fetch room types for filter and forms
  const fetchRoomTypes = async () => {
    try {
      const res = await roomTypesApi.getRoomTypes({
        page: 1,
        pageSize: 100,
        hotelId: hotelId ?? "",
      });
      if (res.isSuccess) setRoomTypes(res.data);
    } catch (err) {
      // Silent failure, filters still usable without types
    }
  };

  // Fetch rooms with filters and pagination
  const fetchRooms = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await roomsApi.getRooms({
        page: 1,
        pageSize: 200,
        hotelId: hotelId ?? "",
        date: overviewDate.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      });
      if (res.isSuccess) {
        setRooms(res.data);
        setTotal(res.meta?.total ?? res.data.length);
        setPage(res.meta?.page ?? pageNum);
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể tải danh sách phòng",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi tải danh sách phòng",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
    fetchRooms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchRooms(1);
  }, [status, floor, typeId, searchNumber, overviewDate]);

  // Handlers
  const handleAdd = () => {
    setEditingRoom(null);
    setCreateOpen(true);
  };

  const handleEdit = (room: RoomDto) => {
    setEditingRoom(room);
    setEditOpen(true);
  };

  const handleDelete = async (room: RoomDto) => {
    setDeleteTarget(room);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      // Try pre-validate if supported
      let canDelete = true;
      try {
        const v = await roomsApi.validateDelete(deleteTarget.id);
        canDelete = Boolean(v?.isSuccess);
      } catch (_) {
        // ignore; proceed to delete, backend should protect if bookings exist
      }

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
        fetchRooms(page);
      } else {
        setSnackbar({
          open: true,
          message: "Phòng đã tồn tại dữ liệu liên quan, không thể xóa",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi xóa phòng",
        severity: "error",
      });
    }
  };

  const handleChangeStatus = (room: RoomDto) => {
    setEditingRoom(room);
    setStatusOpen(true);
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
    fetchRooms(newPage);
  };

  const uniqueFloors = React.useMemo(() => {
    const s = new Set<number>();
    for (const r of rooms) {
      const f = r.floor ?? 0;
      if (f > 0) s.add(f);
    }
    return Array.from(s).sort((a, b) => a - b);
  }, [rooms]);

  const displayRooms = React.useMemo(() => {
    return rooms.filter((r) => {
      const byFloor = floor === 0 ? true : Number(r.floor) === Number(floor);
      const byStatus =
        status === -1 ? true : Number(r.status) === Number(status);
      return byFloor && byStatus;
    });
  }, [rooms, floor, status]);

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
            value={floor}
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
            value={status}
            onChange={(e) => setFilterStatus(Number(e.target.value))}
            SelectProps={{ native: false }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value={-1}>Tất cả trạng thái</MenuItem>
            {ROOM_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {overviewDate.isBefore(dayjs(), "day") &&
                opt.label === "Đang sử dụng"
                  ? "Đã sử dụng"
                  : opt.label}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip placement="top" title="Ngày trước">
              <IconButton
                aria-label="Ngày trước"
                onClick={() =>
                  setOverviewDate((prev) => prev.subtract(1, "day"))
                }
                size="small"
              >
                <ChevronLeft />
              </IconButton>
            </Tooltip>
            <DatePicker
              label="Ngày"
              value={overviewDate}
              onChange={(v) => v && setOverviewDate(v)}
              slotProps={{ textField: { size: "small" } }}
            />
            <Tooltip title="Ngày sau" placement="top">
              <IconButton
                aria-label="Ngày sau"
                onClick={() => setOverviewDate((prev) => prev.add(1, "day"))}
                size="small"
              >
                <ChevronRight />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      <Paper
        sx={{
          p: 2,
          mb: 2,
          position: "relative",
          borderRadius: 3,
          border: "2px dashed",
          borderColor: "primary.light",
          background: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)",
          boxShadow: "0 8px 24px rgba(31, 64, 104, 0.08)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 16,
            color: "primary.main",
            opacity: 0.6,
            pointerEvents: "none",
            transform: "rotate(-60deg)",
          }}
        >
          <Circle fontSize="small" sx={{ width: 16, height: 16 }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 16,
            color: "primary.main",
            opacity: 0.6,
            pointerEvents: "none",
            transform: "rotate(60deg)",
          }}
        >
          <Circle fontSize="small" sx={{ width: 16, height: 16 }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            left: 16,
            color: "primary.main",
            opacity: 0.6,
            pointerEvents: "none",
            transform: "rotate(-120deg)",
          }}
        >
          <Circle fontSize="small" sx={{ width: 16, height: 16 }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 16,
            color: "primary.main",
            opacity: 0.6,
            pointerEvents: "none",
            transform: "rotate(120deg)",
          }}
        >
          <Circle fontSize="small" sx={{ width: 16, height: 16 }} />
        </Box>
        <Stack spacing={1.5} alignItems="center">
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <HotelIcon color="primary" />
            <Stack direction={"row"} alignItems={"center"} gap={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                Tổng quan khách sạn
              </Typography>
              <Typography sx={{ fontWeight: "bold", color: "text.primary" }}>
                ({overviewDate?.format("DD-MM-YYYY")})
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="center"
            sx={{ flexWrap: "wrap", rowGap: 1 }}
          >
            <Chip
              icon={<Bed />}
              color="primary"
              variant="outlined"
              label={`Tổng số phòng: ${rooms.length}`}
              sx={{ fontWeight: 700 }}
            />
            {ROOM_STATUS_OPTIONS.map((opt) => {
              const count = rooms.filter(
                (r) => Number(r.status) === Number(opt.value),
              ).length;
              const isPast = overviewDate.isBefore(dayjs(), "day");
              const label =
                isPast && opt.label === "Đang sử dụng"
                  ? "Đã sử dụng"
                  : opt.label;
              return (
                <Chip
                  key={opt.value}
                  variant="outlined"
                  label={`${label}: ${count}`}
                  sx={{ fontWeight: 600 }}
                />
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      {/* Rooms table */}
      <RoomTable
        rooms={displayRooms}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={displayRooms.length}
        onPageChange={onPageChange}
        onEdit={handleEdit}
        onChangeStatus={handleChangeStatus}
      />

      {/* Create Room */}
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
              fetchRooms(1);
            } else {
              setSnackbar({
                open: true,
                message: res.message || "Không thể tạo phòng",
                severity: "error",
              });
            }
          } catch (err) {
            setSnackbar({
              open: true,
              message: "Đã xảy ra lỗi khi tạo phòng",
              severity: "error",
            });
          }
        }}
      />

      {/* Edit Room */}
      <RoomFormModal
        open={editOpen}
        initialData={editingRoom}
        roomTypes={roomTypes}
        roomTypesLoading={roomTypesLoading}
        onClose={() => setEditOpen(false)}
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
              fetchRooms(page);
            } else {
              setSnackbar({
                open: true,
                message: res.message || "Không thể cập nhật phòng",
                severity: "error",
              });
            }
          } catch (err) {
            setSnackbar({
              open: true,
              message: "Đã xảy ra lỗi khi cập nhật phòng",
              severity: "error",
            });
          }
        }}
      />

      {/* Change Status */}
      <ChangeRoomStatusModal
        open={statusOpen}
        initialStatus={editingRoom?.status}
        onClose={() => {
          setStatusOpen(false);
          setEditingRoom(null);
        }}
        onSubmit={async (newStatus: RoomDto["status"]) => {
          try {
            if (!editingRoom) return;
            const res = await roomsApi.updateRoom(editingRoom.id, {
              status: newStatus,
            });
            if (res.isSuccess) {
              setSnackbar({
                open: true,
                message: "Cập nhật trạng thái phòng thành công",
                severity: "success",
              });
              setStatusOpen(false);
              setEditingRoom(null);
              fetchRooms(page);
            } else {
              setSnackbar({
                open: true,
                message: res.message || "Không thể cập nhật trạng thái",
                severity: "error",
              });
            }
          } catch (err) {
            setSnackbar({
              open: true,
              message: "Đã xảy ra lỗi khi cập nhật trạng thái",
              severity: "error",
            });
          }
        }}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Xóa phòng</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa phòng {deleteTarget?.number}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Chỉ có thể xóa khi không có lịch sử đặt phòng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

// Simple paper-like container without importing Paper directly to keep a light look
const PaperLike: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      p: 2,
      mb: 2,
      borderRadius: 2,
      bgcolor: "background.paper",
      boxShadow: 1,
    }}
  >
    {children}
  </Box>
);

// Add/Edit Room Modal (inline, reusable for both create and edit)
// Inline RoomFormModal removed; now imported from components

// Inline ChangeRoomStatusModal removed; now imported from components

export default RoomManagementPage;
