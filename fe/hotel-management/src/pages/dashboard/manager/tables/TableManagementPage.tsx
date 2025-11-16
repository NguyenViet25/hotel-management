import React, { useEffect, useState } from "react";
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
import PageTitle from "../../../../components/common/PageTitle";
import tablesApi, {
  type TableDto,
  type CreateTableRequest,
  type UpdateTableRequest,
} from "../../../../api/tablesApi";
import TablesTable from "./components/TablesTable";
import TableFormModal from "./components/TableFormModal";
import { useStore, type StoreState } from "../../../../hooks/useStore";

const TableManagementPage: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [items, setItems] = useState<TableDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TableDto | undefined>(
    undefined
  );
  const [deleteTarget, setDeleteTarget] = useState<TableDto | undefined>(
    undefined
  );

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const fetchTables = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const res = await tablesApi.listTables({ hotelId, search: searchTerm });
      if (res.isSuccess) setItems(res.data);
    } catch {
      setSnackbar({
        open: true,
        message: "Không tải được danh sách bàn",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  useEffect(() => {
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  const openEdit = (record: TableDto) => {
    setEditingItem(record);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditingItem(undefined);
  };

  const openDelete = (record: TableDto) => setDeleteTarget(record);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await tablesApi.deleteTable(deleteTarget.id);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Xóa bàn thành công",
          severity: "success",
        });
        fetchTables();
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
        message: "Đã xảy ra lỗi khi xóa bàn",
        severity: "error",
      });
    } finally {
      setDeleteTarget(undefined);
    }
  };

  const createSubmit = async (payload: CreateTableRequest) => {
    try {
      const res = await tablesApi.createTable(payload);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Tạo bàn thành công",
          severity: "success",
        });
        fetchTables();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể tạo bàn",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi tạo bàn",
        severity: "error",
      });
    }
  };

  const editSubmit = async (payload: UpdateTableRequest) => {
    if (!editingItem) return;
    try {
      const res = await tablesApi.updateTable(editingItem.id, payload);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Cập nhật bàn thành công",
          severity: "success",
        });
        fetchTables();
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
        message: "Đã xảy ra lỗi khi cập nhật bàn",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <PageTitle title="Quản lý bàn ăn" subtitle="Thêm, sửa, xóa bàn ăn" />

      <TablesTable
        data={items}
        loading={loading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        onSearch={(e) => setSearchTerm(e)}
      />

      <TableFormModal
        open={createOpen}
        onClose={closeCreate}
        onSubmit={createSubmit}
        hotelId={hotelId || ""}
        mode="create"
      />
      <TableFormModal
        open={editOpen}
        onClose={closeEdit}
        onSubmit={editSubmit}
        hotelId={hotelId || ""}
        initialValues={editingItem}
        mode="edit"
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(undefined)}>
        <DialogTitle>Xóa bàn</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa bàn này?</DialogContent>
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

export default TableManagementPage;
