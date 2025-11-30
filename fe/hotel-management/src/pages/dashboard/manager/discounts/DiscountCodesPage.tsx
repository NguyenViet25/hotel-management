import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { DiscountCode } from "../../../../api/discountCodesApi";
import discountCodesApi from "../../../../api/discountCodesApi";
import ConfirmModal from "../../../../components/common/ConfirmModel";
import type { DiscountFormValues } from "./components/DiscountForm";
import DiscountForm from "./components/DiscountForm";
import DiscountList from "./components/DiscountList";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import PageTitle from "../../../../components/common/PageTitle";

const getCurrentHotelId = (): string | null => {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson);
    return user?.hotelId ?? null;
  } catch (_) {
    return null;
  }
};

const DiscountCodesPage = () => {
  const [rows, setRows] = useState<DiscountCode[]>([]);
  const [filteredRows, setFilteredRows] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [_, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<DiscountCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { hotelId } = useStore<StoreState>((state) => state);

  const onSearch = async (txt: string) => {
    const q = txt.toLowerCase();
    const filtered = rows.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        (r.name || "").toLowerCase().includes(q)
    );
    setFilteredRows(filtered);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await discountCodesApi.list();
      if (!res.isSuccess)
        throw new Error(res.message || "Tải dữ liệu thất bại");
      const data = res.data || [];
      setRows(data);
      setFilteredRows(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onAdd = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const onEdit = (record: DiscountCode) => {
    setEditing(record);
    setOpenForm(true);
  };

  const onDelete = (record: DiscountCode) => {
    setDeleting(record);
    setOpenDelete(true);
  };

  const submitForm = async (values: DiscountFormValues) => {
    if (!hotelId) {
      toast.error("Không tìm thấy khách sạn hiện tại");
      return;
    }
    const payload: DiscountCode = {
      hotelId,
      code: values.code.trim(),
      description: values.description || null,
      scope: values.scope,
      value: Number(values.value),
      isActive: values.isActive,
      startDate: values.startDate!.toISOString(),
      endDate: values.endDate!.toISOString(),
    };

    try {
      setSubmitting(true);
      let res;
      if (editing?.id) {
        res = await discountCodesApi.update(editing.id, payload);
      } else {
        res = await discountCodesApi.create(payload);
      }
      if (!res.isSuccess) throw new Error(res.message || "Thao tác thất bại");
      toast.success(editing?.id ? "Cập nhật thành công" : "Tạo mới thành công");
      setOpenForm(false);
      await loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    try {
      const res = await discountCodesApi.remove(deleting.id);
      if (!res.isSuccess) throw new Error(res.message || "Xóa thất bại");
      toast.success("Đã xóa");
      setOpenDelete(false);
      await loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={2}>
        <PageTitle
          title="Mã giảm giá"
          subtitle="Quản lý mã giảm giá của khách sạn"
        />

        <DiscountList
          rows={filteredRows}
          loading={loading}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onSearch={onSearch}
        />

        <Dialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editing ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
          </DialogTitle>
          <DialogContent>
            <DiscountForm
              initialValues={
                editing
                  ? {
                      code: editing.code,
                      name: editing.name,
                      description: editing.description || "",
                      scope: (editing as any)?.scope || "booking",
                      conditions: editing.conditions || "",
                      value: editing.value,
                      isActive: editing.isActive,
                      startDate: dayjs(editing.startDate),
                      endDate: dayjs(editing.endDate),
                    }
                  : undefined
              }
              onSubmit={submitForm}
              onCancel={() => setOpenForm(false)}
              submitting={submitting}
            />
          </DialogContent>
        </Dialog>

        <ConfirmModal
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          title="Xóa mã giảm giá"
          message={
            <span>
              Bạn có chắc muốn xóa mã <b>{deleting?.code}</b>?
            </span>
          }
          confirmText="Xóa"
          confirmColor="error"
          onConfirm={confirmDelete}
        />

        <ToastContainer position="top-right" autoClose={2500} />
      </Stack>
    </LocalizationProvider>
  );
};

export default DiscountCodesPage;
