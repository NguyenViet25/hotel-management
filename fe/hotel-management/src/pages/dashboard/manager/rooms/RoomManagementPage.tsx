import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";
import roomsApi, {
  type RoomDto,
  type CreateRoomRequest,
  type UpdateRoomRequest,
} from "../../../../api/roomsApi";
import roomTypesApi, { type RoomType } from "../../../../api/roomTypesApi";
import type { SelectChangeEvent } from "@mui/material/Select";

// Status options aligned with UC-27
const ROOM_STATUS_OPTIONS: { value: RoomDto["status"]; label: string }[] = [
  { value: "Available", label: "Sẵn sàng" },
  { value: "UnderMaintenance", label: "Bảo trì" },
  { value: "OutOfService", label: "Ngừng phục vụ" },
  { value: "TemporarilyUnavailable", label: "Tạm ngưng" },
];

const statusChip = (status: RoomDto["status"]) => {
  const map = {
    Available: { color: "success", label: "Sẵn sàng" },
    UnderMaintenance: { color: "warning", label: "Bảo trì" },
    OutOfService: { color: "error", label: "Ngừng phục vụ" },
    TemporarilyUnavailable: { color: "default", label: "Tạm ngưng" },
  };
  const cfg = map[status] || { color: "default", label: status };
  return <Chip size="small" label={cfg.label} color={cfg.color} />;
};

// Main page component
const RoomManagementPage: React.FC = () => {
  // Table & pagination state
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // Filters
  const [status, setStatus] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [searchNumber, setSearchNumber] = useState<string>(""); // use DataTable search

  // Room types for filter and form
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

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

  // Columns for DataTable
  const columns = useMemo<Column<RoomDto>[]>(
    () => [
      { id: "number", label: "Số phòng", minWidth: 100 },
      { id: "floor", label: "Tầng", minWidth: 80 },
      { id: "typeName", label: "Loại phòng", minWidth: 140 },
      {
        id: "status",
        label: "Trạng thái",
        minWidth: 140,
        format: (value) => statusChip(value as RoomDto["status"]),
      },
      { id: "hotelName", label: "Khách sạn", minWidth: 160 },
    ],
    []
  );

  // Fetch room types for filter and forms
  const fetchRoomTypes = async () => {
    try {
      const res = await roomTypesApi.getRoomTypes({ page: 1, pageSize: 100 });
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
          message: res.message || "Không thể xóa phòng",
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
      <PageTitle
        title="Quản lý phòng"
        subtitle="Xem danh sách phòng, thêm/sửa/xóa và cập nhật trạng thái"
      />

      {/* Filters */}
      <PaperLike>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Trạng thái</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Trạng thái"
                onChange={(e: SelectChangeEvent<string>) =>
                  setStatus(e.target.value as string)
                }
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                {ROOM_STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Tầng"
              type="number"
              fullWidth
              value={floor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFloor(e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="type-label">Loại phòng</InputLabel>
              <Select
                labelId="type-label"
                value={typeId}
                label="Loại phòng"
                onChange={(e: SelectChangeEvent<string>) =>
                  setTypeId(e.target.value as string)
                }
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                {roomTypes.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Số phòng (Tìm kiếm)"
              fullWidth
              value={searchNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchNumber(e.target.value)
              }
            />
          </Grid>
        </Grid>
      </PaperLike>

      {/* Rooms table */}
      <DataTable
        columns={columns}
        data={rooms}
        title="Danh sách phòng"
        loading={loading}
        pagination={{ page, pageSize, total, onPageChange }}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLock={handleChangeStatus}
        getRowId={(row: RoomDto) => row.id}
        onSearch={(txt: string) => setSearchNumber(txt || "")}
      />

      {/* Create Room */}
      <RoomFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        roomTypes={roomTypes}
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
type RoomFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRoomRequest | UpdateRoomRequest) => void;
  initialData?: RoomDto | null;
  roomTypes: RoomType[];
};

const RoomFormModal: React.FC<RoomFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  roomTypes,
}) => {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState<{
    number: string;
    floor: number | string;
    typeId: string;
    features: string[];
    status: RoomDto["status"];
  }>({
    number: initialData?.number || "",
    floor: initialData?.floor ?? 1,
    typeId: initialData?.typeId || "",
    features: initialData?.features || [],
    status: initialData?.status || "Available", // for edit, allow updating active/status
  });

  useEffect(() => {
    setForm({
      number: initialData?.number || "",
      floor: initialData?.floor ?? 1,
      typeId: initialData?.typeId || "",
      features: initialData?.features || [],
      status: initialData?.status || "Available",
    });
  }, [initialData]);

  const handleTextChange =
    (key: "number" | "floor") => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  const handleSelectChange =
    (key: "typeId" | "status") => (e: SelectChangeEvent<string>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as string }));

  const handleSubmit = () => {
    // Key logic: map form to API payloads depending on create vs edit
    const payload = isEdit
      ? {
          number: form.number,
          floor: Number(form.floor),
          typeId: form.typeId,
          status: form.status,
          features: form.features,
        }
      : {
          number: form.number,
          floor: Number(form.floor),
          typeId: form.typeId,
          features: form.features,
        };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle fontWeight={600}>
        {isEdit ? "Chỉnh sửa phòng" : "Thêm phòng"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Số phòng"
            value={form.number}
            onChange={handleTextChange("number")}
            required
          />
          <TextField
            label="Tầng"
            type="number"
            value={form.floor}
            onChange={handleTextChange("floor")}
            required
          />
          <FormControl fullWidth>
            <InputLabel id="type-select-label">Loại phòng</InputLabel>
            <Select
              labelId="type-select-label"
              value={form.typeId}
              label="Loại phòng"
              onChange={handleSelectChange("typeId")}
              required
            >
              {roomTypes.map((rt) => (
                <MenuItem key={rt.id} value={rt.id}>
                  {rt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isEdit && (
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Trạng thái</InputLabel>
              <Select
                labelId="status-select-label"
                value={form.status}
                label="Trạng thái"
                onChange={handleSelectChange("status")}
              >
                {ROOM_STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEdit ? "Lưu" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Change Room Status Modal
const ChangeRoomStatusModal = ({
  open,
  onClose,
  onSubmit,
  initialStatus = "Available",
}) => {
  const [selected, setSelected] = useState(initialStatus);
  useEffect(() => setSelected(initialStatus), [initialStatus]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight={600}>Cập nhật trạng thái phòng</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="change-status-label">Trạng thái</InputLabel>
            <Select
              labelId="change-status-label"
              value={selected}
              label="Trạng thái"
              onChange={(e) => setSelected(e.target.value)}
            >
              {ROOM_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Trạng thái ảnh hưởng đến khả năng bán phòng. "Bảo trì" và "Ngừng
            phục vụ" sẽ không thể nhận đặt phòng.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => onSubmit(selected)}
        >
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomManagementPage;
