import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Typography,
} from "@mui/material";
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
import { useStore, type StoreState } from "../../../../../hooks/useStore";

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
  const [status, setStatus] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [searchNumber, setSearchNumber] = useState<string>(""); // use DataTable search

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

  // Columns are now defined within the RoomTable component

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
      const qp = {
        status: status || undefined,
        floor: floor ? Number(floor) : undefined,
        typeId: typeId || undefined,
        number: searchNumber || undefined,
        page: pageNum,
        pageSize,
        hotelId: hotelId ?? "",
      };
      const res = await roomsApi.getRooms(qp);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, floor, typeId, searchNumber]);

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

  return (
    <Box>
      {/* Rooms table */}
      <RoomTable
        rooms={rooms}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
        onSearch={(txt: string) => setSearchNumber(txt || "")}
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
