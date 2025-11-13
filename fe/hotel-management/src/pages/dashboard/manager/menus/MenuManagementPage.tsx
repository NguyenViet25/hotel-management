import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import menusApi, {
  type CreateMenuItemRequest,
  type MenuGroupDto,
  type MenuItemDto,
  type UpdateMenuItemRequest,
} from "../../../../api/menusApi";
import PageTitle from "../../../../components/common/PageTitle";
import MenuItemFormModal from "./components/MenuItemFormModal";
import MenuTable from "./components/MenuTable";

// Menu Management Page implementing UC-45 to UC-48
// - UC-45: View menu list with filters (group, shift, status, active)
// - UC-46: Add dish
// - UC-47: Edit dish
// - UC-48: Delete dish (server enforces order-history rule)

const MenuManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [groups, setGroups] = useState<MenuGroupDto[]>([]);
  const [status, setStatus] = useState<string>("");

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDto | undefined>(
    undefined
  );
  const [deleteTarget, setDeleteTarget] = useState<MenuItemDto | undefined>(
    undefined
  );

  // Notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  // Fetch menu groups for filters and forms
  const fetchGroups = async () => {
    try {
      const res = await menusApi.getMenuGroups();
      if (res.isSuccess) setGroups(res.data);
    } catch (err) {
      // Silent fail, filters still usable
    }
  };

  // Fetch menu items with applied filters
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const qp = {
        status: status || undefined,
        searchTerm: searchTerm || undefined,
      };
      const res = await menusApi.getMenuItems(qp);
      if (res.isSuccess) {
        setItems(res.data);
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể tải danh sách món",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi tải danh sách món",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, searchTerm]);

  const openCreate = () => setCreateOpen(true);
  const openEdit = (record: MenuItemDto) => {
    setEditingItem(record);
    setEditOpen(true);
  };
  const openDelete = (record: MenuItemDto) => setDeleteTarget(record);

  const closeCreate = () => setCreateOpen(false);
  const closeEdit = () => {
    setEditOpen(false);
    setEditingItem(undefined);
  };

  const createSubmit = async (payload: CreateMenuItemRequest) => {
    try {
      const res = await menusApi.createMenuItem(payload);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Tạo món thành công",
          severity: "success",
        });
        closeCreate();
        fetchMenuItems();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể tạo món",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi tạo món",
        severity: "error",
      });
    }
  };

  const editSubmit = async (payload: UpdateMenuItemRequest) => {
    if (!editingItem) return;
    try {
      const res = await menusApi.updateMenuItem(editingItem.id, payload);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Cập nhật món thành công",
          severity: "success",
        });
        closeEdit();
        fetchMenuItems();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể cập nhật món",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi cập nhật",
        severity: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await menusApi.deleteMenuItem(deleteTarget.id);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Xóa món thành công",
          severity: "success",
        });
        setDeleteTarget(null);
        fetchMenuItems();
      } else {
        setSnackbar({
          open: true,
          message:
            res.message || "Không thể xóa món (có thể có đơn hàng liên quan)",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi xóa",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <PageTitle title="Quản lý thực đơn" subtitle="Xem, thêm, sửa, xóa món" />

      {/* Table with actions */}
      <MenuTable
        data={items}
        loading={loading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        onSearch={(e) => setSearchTerm(e)}
      />

      {/* Create modal */}
      <MenuItemFormModal
        open={createOpen}
        onClose={closeCreate}
        onSubmit={createSubmit}
        menuGroups={groups}
        mode="create"
      />

      {/* Edit modal */}
      <MenuItemFormModal
        open={editOpen}
        onClose={closeEdit}
        onSubmit={editSubmit}
        initialValues={editingItem}
        mode="edit"
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(undefined)}>
        <DialogTitle>Xóa món</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa món này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(undefined)} color="inherit">
            Hủy
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
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

export default MenuManagementPage;
