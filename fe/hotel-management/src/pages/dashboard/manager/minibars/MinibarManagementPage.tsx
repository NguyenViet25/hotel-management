import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import PageTitle from "../../../../components/common/PageTitle";
import minibarApi, {
  type Minibar,
  type MinibarCreate,
  type MinibarUpdate,
} from "../../../../api/minibarApi";
import roomTypesApi, { type RoomType } from "../../../../api/roomTypesApi";
import MinibarFormModal from "./components/MinibarFormModal";
import { useStore, type StoreState } from "../../../../hooks/useStore";

const MinibarManagementPage: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [items, setItems] = useState<Minibar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState<boolean>(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Minibar | undefined>(
    undefined
  );
  const [deleteTarget, setDeleteTarget] = useState<Minibar | undefined>(
    undefined
  );

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const fetchMinibars = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const res = await minibarApi.list({ hotelId, search: searchTerm });
      if (res.isSuccess) setItems(res.data);
    } catch {
      setSnackbar({
        open: true,
        message: "Không tải được danh sách minibar",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMinibars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  useEffect(() => {
    const f = async () => {
      if (!hotelId) return;
      setRoomTypesLoading(true);
      try {
        const res = await roomTypesApi.getRoomTypes({ hotelId, pageSize: 100 });
        setRoomTypes(res.data || []);
      } catch {}
      setRoomTypesLoading(false);
    };
    f();
  }, [hotelId]);

  useEffect(() => {
    fetchMinibars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const groupedByRoomType = useMemo(() => {
    const map: Record<string, Minibar[]> = {};
    for (const it of items) {
      const key = it.roomTypeId;
      if (!map[key]) map[key] = [];
      map[key].push(it);
    }
    return map;
  }, [items]);

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  const openEdit = (record: Minibar) => {
    setEditingItem(record);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditingItem(undefined);
  };

  const openDelete = (record: Minibar) => setDeleteTarget(record);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await minibarApi.remove(deleteTarget.id);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Xóa minibar thành công",
          severity: "success",
        });
        fetchMinibars();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể xóa",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi xóa minibar",
        severity: "error",
      });
    } finally {
      setDeleteTarget(undefined);
    }
  };

  const createSubmit = async (payload: MinibarCreate) => {
    try {
      const res = await minibarApi.create(payload);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Tạo minibar thành công",
          severity: "success",
        });
        fetchMinibars();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể tạo minibar",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Xảy ra lỗi khi tạo minibar",
        severity: "error",
      });
    }
  };

  const editSubmit = async (payload: MinibarUpdate) => {
    if (!editingItem) return;
    try {
      const res = await minibarApi.update(editingItem.id, payload);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Cập nhật minibar thành công",
          severity: "success",
        });
        fetchMinibars();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể cập nhật",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi cập nhật minibar",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <PageTitle title="Quản lý minibar" subtitle="Thêm, sửa, xóa minibar" />

      <Stack spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={openCreate}>
          Thêm minibar
        </Button>
      </Stack>

      {loading || roomTypesLoading ? (
        <Alert severity="info">Đang tải dữ liệu...</Alert>
      ) : (
        <Grid container spacing={2}>
          {roomTypes.map((rt) => {
            const list = groupedByRoomType[rt.id] || [];
            return (
              <Grid key={rt.id} size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardHeader
                    title={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          {rt.name}
                        </Typography>
                        <Chip label={`${list.length} minibar`} size="small" />
                      </Stack>
                    }
                  />
                  <CardContent>
                    {list.length === 0 ? (
                      <Chip label="Không có minibar" />
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {[...list]
                              .sort((a, b) =>
                                (a.name || "").localeCompare(b.name || "")
                              )
                              .map((mb) => (
                                <TableRow key={mb.id} hover>
                                  <TableCell width={92}>
                                    {mb.imageUrl ? (
                                      <img
                                        src={mb.imageUrl}
                                        alt={mb.name}
                                        style={{
                                          width: 64,
                                          height: 64,
                                          objectFit: "contain",
                                        }}
                                      />
                                    ) : (
                                      <Chip label="Chưa có ảnh" size="small" />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      {mb.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell width={100}>
                                    {mb.quantity}
                                  </TableCell>
                                  <TableCell width={140}>
                                    {mb.price.toLocaleString()}₫
                                  </TableCell>
                                  <TableCell align="right" width={80}>
                                    <Tooltip title="Sửa minibar">
                                      <span>
                                        <IconButton
                                          size="small"
                                          color="primary"
                                          onClick={() => openEdit(mb)}
                                        >
                                          <Edit fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <MinibarFormModal
        open={createOpen}
        onClose={closeCreate}
        onSubmit={createSubmit}
        hotelId={hotelId || ""}
        mode="create"
      />
      <MinibarFormModal
        open={editOpen}
        onClose={closeEdit}
        onSubmit={editSubmit}
        hotelId={hotelId || ""}
        initialValues={editingItem}
        mode="edit"
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(undefined)}>
        <DialogTitle>Xóa minibar</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa minibar này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(undefined)} color="inherit">
            Hủy
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MinibarManagementPage;
