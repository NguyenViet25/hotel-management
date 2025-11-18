import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Button,
} from "@mui/material";
import PageTitle from "../../../../components/common/PageTitle";
import minibarApi, {
  type Minibar,
  type MinibarCreate,
  type MinibarUpdate,
} from "../../../../api/minibarApi";
import MinibarTable from "./components/MinibarTable";
import MinibarFormModal from "./components/MinibarFormModal";
import { useStore, type StoreState } from "../../../../hooks/useStore";

const MinibarManagementPage: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [items, setItems] = useState<Minibar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
    fetchMinibars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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

      <MinibarTable
        data={items}
        loading={loading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        onSearch={(e) => setSearchTerm(e)}
      />

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
