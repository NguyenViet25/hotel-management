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
import mediaApi, { type MediaDto, type MediaUpdateRequest } from "../../../../api/mediaApi";
import MediaTable from "./components/MediaTable";
import MediaFormModal from "./components/MediaFormModal";
import ConfirmModal from "../../../../components/common/ConfirmModel";

const MediaManagementPage: React.FC = () => {
  const [items, setItems] = useState<MediaDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<MediaDto | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "info" | "warning" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await mediaApi.list(1, 100);
      if (res.isSuccess) setItems(res.data);
    } catch {
      setSnackbar({ open: true, message: "Không tải được danh sách media", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setFormMode("create");
    setCurrent(undefined);
    setOpenForm(true);
  };

  const handleEdit = (record: MediaDto) => {
    setFormMode("edit");
    setCurrent(record);
    setOpenForm(true);
  };

  const handleDelete = (record: MediaDto) => {
    setCurrent(record);
    setConfirmOpen(true);
  };

  const doUpload = async (file: File) => {
    try {
      const res = await mediaApi.upload(file);
      if (res.isSuccess) {
        setSnackbar({ open: true, message: "Tải lên thành công", severity: "success" });
        fetchData();
      } else {
        setSnackbar({ open: true, message: res.message ?? "Lỗi tải lên", severity: "error" });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message ?? "Lỗi tải lên", severity: "error" });
    }
  };

  const doUpdate = async (payload: MediaUpdateRequest) => {
    if (!current) return;
    try {
      const res = await mediaApi.update(current.id, payload);
      if (res.isSuccess) {
        setSnackbar({ open: true, message: "Cập nhật thành công", severity: "success" });
        fetchData();
      } else {
        setSnackbar({ open: true, message: res.message ?? "Lỗi cập nhật", severity: "error" });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message ?? "Lỗi cập nhật", severity: "error" });
    }
  };

  const doDelete = async () => {
    if (!current) return;
    try {
      const res = await mediaApi.remove(current.id);
      if (res.isSuccess) {
        setSnackbar({ open: true, message: "Xoá thành công", severity: "success" });
        fetchData();
      } else {
        setSnackbar({ open: true, message: res.message ?? "Lỗi xoá", severity: "error" });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message ?? "Lỗi xoá", severity: "error" });
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <Box>
      <PageTitle title="Quản lý Media" subtitle="QL cơ sở" />

      <Box sx={{ mt: 2 }}>
        <MediaTable
          data={items}
          loading={loading}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSearch={() => {}}
        />
      </Box>

      <MediaFormModal
        open={openForm}
        mode={formMode}
        initialValues={current}
        onClose={() => setOpenForm(false)}
        onUpload={doUpload}
        onUpdate={doUpdate}
      />

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Xác nhận xoá"
        message={`Bạn chắc chắn muốn xoá tệp "${current?.fileName}"?`}
        confirmText="Xoá"
        confirmColor="error"
        onConfirm={doDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MediaManagementPage;