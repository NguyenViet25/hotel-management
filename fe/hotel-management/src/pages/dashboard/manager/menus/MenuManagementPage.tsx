import React, { useEffect, useState } from "react";
import { Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import PageTitle from "../../../../components/common/PageTitle";
import menusApi, { type MenuItemDto, type MenuGroupDto, type CreateMenuItemRequest, type UpdateMenuItemRequest } from "../../../../api/menusApi";
import MenuFilters from "./components/MenuFilters";
import MenuTable from "./components/MenuTable";
import MenuItemFormModal from "./components/MenuItemFormModal";

// Menu Management Page implementing UC-45 to UC-48
// - UC-45: View menu list with filters (group, shift, status, active)
// - UC-46: Add dish
// - UC-47: Edit dish
// - UC-48: Delete dish (server enforces order-history rule)

const MenuManagementPage: React.FC = () => {
  // Data state
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [groups, setGroups] = useState<MenuGroupDto[]>([]);

  // Filters state
  const [groupId, setGroupId] = useState<string>("");
  const [shift, setShift] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isActive, setIsActive] = useState<string>(""); // "" | "true" | "false"

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItemDto | null>(null);

  // Notifications
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" | "warning" }>({ open: false, message: "", severity: "success" });

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
        groupId: groupId || undefined,
        shift: shift || undefined,
        status: status || undefined,
        isActive: isActive ? isActive === "true" : undefined,
      };
      const res = await menusApi.getMenuItems(qp);
      if (res.isSuccess) {
        setItems(res.data);
      } else {
        setSnackbar({ open: true, message: res.message || "Không thể tải danh sách món", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi khi tải danh sách món", severity: "error" });
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
  }, [groupId, shift, status, isActive]);

  // Handlers
  const handleFilterChange = (key: "groupId" | "shift" | "status" | "isActive", value: string) => {
    switch (key) {
      case "groupId":
        setGroupId(value);
        break;
      case "shift":
        setShift(value);
        break;
      case "status":
        setStatus(value);
        break;
      case "isActive":
        setIsActive(value);
        break;
    }
  };

  const openCreate = () => setCreateOpen(true);
  const openEdit = (record: MenuItemDto) => {
    setEditingItem(record);
    setEditOpen(true);
  };
  const openDelete = (record: MenuItemDto) => setDeleteTarget(record);

  const closeCreate = () => setCreateOpen(false);
  const closeEdit = () => {
    setEditOpen(false);
    setEditingItem(null);
  };

  const createSubmit = async (payload: CreateMenuItemRequest) => {
    try {
      const res = await menusApi.createMenuItem(payload);
      if (res.isSuccess) {
        setSnackbar({ open: true, message: "Tạo món thành công", severity: "success" });
        closeCreate();
        fetchMenuItems();
      } else {
        setSnackbar({ open: true, message: res.message || "Không thể tạo món", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi khi tạo món", severity: "error" });
    }
  };

  const editSubmit = async (payload: UpdateMenuItemRequest) => {
    if (!editingItem) return;
    try {
      const res = await menusApi.updateMenuItem(editingItem.id, payload);
      if (res.isSuccess) {
        setSnackbar({ open: true, message: "Cập nhật món thành công", severity: "success" });
        closeEdit();
        fetchMenuItems();
      } else {
        setSnackbar({ open: true, message: res.message || "Không thể cập nhật món", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi khi cập nhật", severity: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await menusApi.deleteMenuItem(deleteTarget.id);
      if (res.isSuccess) {
        setSnackbar({ open: true, message: "Xóa món thành công", severity: "success" });
        setDeleteTarget(null);
        fetchMenuItems();
      } else {
        setSnackbar({ open: true, message: res.message || "Không thể xóa món (có thể có đơn hàng liên quan)", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi khi xóa", severity: "error" });
    }
  };

  return (
    <Box>
      <PageTitle title="Quản lý Thực đơn" subtitle="Xem, thêm, sửa, xóa món" />

      {/* Filters: group, shift, status, active */}
      <Box sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "background.paper", boxShadow: 1 }}>
        <MenuFilters
          menuGroups={groups}
          groupId={groupId}
          shift={shift}
          status={status}
          isActive={isActive}
          onChange={handleFilterChange}
        />
      </Box>

      {/* Table with actions */}
      <MenuTable data={items} loading={loading} onAdd={openCreate} onEdit={openEdit} onDelete={openDelete} />

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
        menuGroups={groups}
        initialValues={editingItem || undefined}
        mode="edit"
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Xóa món</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa món này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">Hủy</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuManagementPage;