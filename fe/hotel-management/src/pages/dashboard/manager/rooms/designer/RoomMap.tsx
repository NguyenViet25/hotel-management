import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
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

const RoomMap: React.FC = () => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);

  const [editingRoom, setEditingRoom] = useState<RoomDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchRoomTypes = async () => {
      setRoomTypesLoading(true);
      try {
        const res = await roomTypesApi.getRoomTypes({ page: 1, pageSize: 100 });
        if (res.isSuccess) setRoomTypes(res.data);
      } catch {}
      setRoomTypesLoading(false);
    };
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await roomsApi.getRooms({ page: 1, pageSize: 200 });
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

  const floors = useMemo(() => {
    const map: Record<number, RoomDto[]> = {};
    for (const r of rooms) {
      const f = r.floor ?? 0;
      if (!map[f]) map[f] = [];
      map[f].push(r);
    }
    return Object.entries(map)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([floor, rs]) => ({ floor: Number(floor), rooms: rs }));
  }, [rooms]);

  const statusChip = (status: RoomStatus) => {
    const s = getRoomStatusString(status);
    const map: Record<string, { color: string; label: string }> = {
      Available: { color: "#4CAF50", label: "Trống" },
      Occupied: { color: "#F44336", label: "Đã Có Khách" },
      Cleaning: { color: "#2196F3", label: "Đang Dọn Dẹp" },
      Maintenance: { color: "#9C27B0", label: "Bảo Trì" },
      OutOfService: { color: "#FF9800", label: "Ngừng phục vụ" },
      Dirty: { color: "#795548", label: "Bẩn" },
      Clean: { color: "#00BCD4", label: "Đã dọn sạch" },
    };
    const cfg = map[s] || { color: "default", label: String(status) };
    return (
      <Chip
        size="small"
        label={cfg.label}
        sx={{ bgcolor: cfg.color, color: "white" }}
      />
    );
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

  const refreshRooms = async () => {
    try {
      const res = await roomsApi.getRooms({ page: 1, pageSize: 200 });
      if (res.isSuccess) setRooms(res.data);
    } catch {}
  };

  return (
    <Box>
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
        <Stack p={3} direction="row" spacing={1.5} alignItems="center">
          <AddCircleOutlineIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Thêm Phòng Mới
          </Typography>
        </Stack>
      </Card>

      <Stack spacing={2}>
        {floors.map((floor) => (
          <Card
            key={floor.floor}
            sx={{ borderRadius: 2, boxShadow: 2, "&:hover": { boxShadow: 4 } }}
          >
            <CardHeader
              title={`Tầng ${floor.floor}`}
              subheader={
                <Typography variant="caption">
                  {floor.rooms.length} phòng
                </Typography>
              }
              sx={{ pb: 0.5 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                {floor.rooms.map((r) => (
                  <Grid item key={r.id}>
                    <Card
                      onClick={() => openEdit(r)}
                      sx={{
                        width: 200,
                        borderRadius: 2,
                        boxShadow: 1,
                        position: "relative",
                        "&:hover": { boxShadow: 4 },
                        "&:hover .room-actions": {
                          opacity: 1,
                          pointerEvents: "auto",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 1.5, pt: 3 }}>
                        <Stack spacing={1}>
                          <Stack>
                            <Typography variant="subtitle2" fontWeight={700}>
                              #{r.number}
                            </Typography>
                            <Chip
                              label={r.roomTypeName}
                              size="small"
                              sx={{ bgcolor: "primary.main", color: "white" }}
                            />
                          </Stack>
                          {statusChip(r.status as RoomStatus)}
                        </Stack>
                      </CardContent>
                      <Box
                        className="room-actions"
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          display: "flex",
                          gap: 0.5,
                          opacity: 0,
                          transition: "opacity 150ms ease",
                          pointerEvents: "none",
                        }}
                      >
                        <Tooltip title="Chỉnh Sửa">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(r);
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
                          >
                            <ChangeCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xoá Phòng">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              askDelete(r);
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
          } catch {
            setSnackbar({
              open: true,
              message: "Đã xảy ra lỗi khi tạo phòng",
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
            });
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
                    message: res.message || "Không thể xóa phòng",
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
