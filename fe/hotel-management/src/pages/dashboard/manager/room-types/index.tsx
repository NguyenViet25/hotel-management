import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import RoomTypeTable from "./components/RoomTypeTable";
import RoomTypeForm from "./components/RoomTypeForm";
import roomTypesApi, {
  type RoomType,
  type CreateRoomTypeRequest,
  type UpdateRoomTypeRequest,
} from "../../../../api/roomTypesApi";
import PageTitle from "../../../../components/common/PageTitle";

const RoomTypePage: React.FC = () => {
  const [items, setItems] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<RoomType | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const fetchList = async (newPage?: number) => {
    setLoading(true);
    try {
      const res = await roomTypesApi.getRoomTypes({
        page: newPage ?? page,
        pageSize,
      });
      if (res.isSuccess) {
        setItems(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      } else {
        setSnackbar({
          open: true,
          message: res.message ?? "Không thể tải danh sách",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi tải dữ liệu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  const handleAdd = () => {
    setSelected(null);
    setCreateOpen(true);
  };

  const handleEdit = (rt: RoomType) => {
    setSelected(rt);
    setEditOpen(true);
  };

  const handleDelete = (rt: RoomType) => {
    setSelected(rt);
    setDeleteOpen(true);
  };

  const submitCreate = async (payload: CreateRoomTypeRequest) => {
    try {
      const res = await roomTypesApi.createRoomType(payload);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Thêm loại phòng thành công",
          severity: "success",
        });
        setCreateOpen(false);
        fetchList(1);
      } else {
        setSnackbar({
          open: true,
          message: res.message ?? "Không thể tạo loại phòng",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi tạo",
        severity: "error",
      });
    }
  };

  const submitUpdate = async (payload: UpdateRoomTypeRequest) => {
    if (!selected) return;
    try {
      const res = await roomTypesApi.updateRoomType(selected.id, payload);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Cập nhật loại phòng thành công",
          severity: "success",
        });
        setEditOpen(false);
        fetchList(page);
      } else {
        setSnackbar({
          open: true,
          message: res.message ?? "Không thể cập nhật",
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
    if (!selected) return;
    try {
      // Optional: validate deletability
      const can = await roomTypesApi.validateDelete(selected.id);
      if (!can.isSuccess) {
        setSnackbar({
          open: true,
          message: can.message ?? "Không thể xóa do có đặt phòng",
          severity: "warning",
        });
        setDeleteOpen(false);
        return;
      }

      const res = await roomTypesApi.deleteRoomType(selected.id);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Xóa loại phòng thành công",
          severity: "success",
        });
        setDeleteOpen(false);
        fetchList(page);
      } else {
        setSnackbar({
          open: true,
          message: res.message ?? "Không thể xóa loại phòng",
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchList(newPage);
  };

  return (
    <Box>
      <PageTitle
        title="Loại phòng & Giá"
        subtitle="Quản lý loại phòng, sức chứa, giá base/giá theo thứ/giá theo ngày"
      />
      <RoomTypeTable
        data={items}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={() => {}}
      />

      {/* Create */}
      <RoomTypeForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreate}
        hotelId={items[0]?.hotelId}
      />

      {/* Edit */}
      <RoomTypeForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={submitUpdate}
        initialData={selected}
      />

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Xóa loại phòng</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa loại phòng "{selected?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RoomTypePage;
