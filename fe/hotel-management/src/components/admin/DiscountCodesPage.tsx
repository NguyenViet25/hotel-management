import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "../common/ConfirmModel";
import FormActionButtons from "../common/FormActionButtons";
import DataTable, { type Column } from "../common/DataTable";
import discountCodesApi, {
  type DiscountCode,
} from "../../api/discountCodesApi";

type FormValues = {
  code: string;
  name: string;
  description?: string;
  conditions?: string;
  value: number;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isActive: boolean;
};

const schema = yup.object({
  code: yup.string().required("Mã là bắt buộc"),
  name: yup.string().required("Tên là bắt buộc"),
  value: yup
    .number()
    .typeError("Giá trị phải là số")
    .positive("Giá trị phải > 0")
    .required("Giá trị là bắt buộc"),
  startDate: yup.date().required("Ngày bắt đầu là bắt buộc"),
  endDate: yup
    .date()
    .required("Ngày kết thúc là bắt buộc")
    .min(yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu"),
  description: yup.string().nullable(),
  conditions: yup.string().nullable(),
  isActive: yup.boolean().required(),
});

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<DiscountCode | null>(null);

  const hotelId = useMemo(() => getCurrentHotelId(), []);

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      conditions: "",
      value: 0,
      startDate: dayjs(),
      endDate: dayjs().add(7, "day"),
      isActive: true,
    },
  });

  const columns: Column<DiscountCode>[] = [
    { id: "code", label: "Mã", sortable: true },
    { id: "value", label: "Giá trị", sortable: true, format: (v) => `${v}` },
    {
      id: "conditions",
      label: "Điều kiện",
      format: (v) =>
        (v ? String(v).slice(0, 50) : "") +
        (v && String(v).length > 50 ? "…" : ""),
    },
    {
      id: "startDate",
      label: "Ngày bắt đầu",
      format: (v) => new Date(v).toLocaleDateString(),
    },
    {
      id: "endDate",
      label: "Ngày hết hạn",
      format: (v) => new Date(v).toLocaleDateString(),
    },
    {
      id: "isActive",
      label: "Trạng thái",
      format: (v) => (v ? "Đang hoạt động" : "Ngưng"),
    },
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await discountCodesApi.list();
      if (!res.isSuccess)
        throw new Error(res.message || "Tải dữ liệu thất bại");
      setRows(res.data || []);
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
    reset();
    setOpenForm(true);
  };

  const onEdit = (record: DiscountCode) => {
    setEditing(record);
    reset({
      code: record.code,
      name: record.name,
      description: record.description || "",
      conditions: record.conditions || "",
      value: record.value,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      isActive: record.isActive,
    });
    setOpenForm(true);
  };

  const onDelete = (record: DiscountCode) => {
    setDeleting(record);
    setOpenDelete(true);
  };

  const submitForm = handleSubmit(async (values) => {
    if (!hotelId) {
      toast.error("Không tìm thấy khách sạn hiện tại");
      return;
    }
    const payload: DiscountCode = {
      hotelId,
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description || null,
      conditions: values.conditions || null,
      value: Number(values.value),
      isActive: values.isActive,
      startDate: values.startDate!.toISOString(),
      endDate: values.endDate!.toISOString(),
    };

    try {
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
    }
  });

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
        <Typography variant="h5" fontWeight={700}>
          Quản lý mã giảm giá
        </Typography>

        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          getRowId={(r) => r.id as string}
          onSearch={async (txt) => {
            const filtered = rows.filter(
              (r) =>
                r.code.toLowerCase().includes(txt.toLowerCase()) ||
                r.name.toLowerCase().includes(txt.toLowerCase())
            );
            setRows(filtered);
          }}
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
            <Card variant="outlined" sx={{ mt: 1 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Mã"
                      fullWidth
                      size="small"
                      {...register("code")}
                      error={!!formErrors.code}
                      helperText={formErrors.code?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Tên"
                      fullWidth
                      size="small"
                      {...register("name")}
                      error={!!formErrors.name}
                      helperText={formErrors.name?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Giá trị"
                      type="number"
                      fullWidth
                      size="small"
                      {...register("value")}
                      error={!!formErrors.value}
                      helperText={formErrors.value?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mt: 1 }}
                    >
                      <Typography>Hoạt động</Typography>
                      <Switch {...register("isActive")} defaultChecked />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Ngày bắt đầu"
                      value={watch("startDate")}
                      onChange={(v) => setValue("startDate", v)}
                    />
                    {formErrors.startDate && (
                      <Typography color="error" variant="caption">
                        {String(formErrors.startDate.message)}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Ngày hết hạn"
                      value={watch("endDate")}
                      onChange={(v) => setValue("endDate", v)}
                    />
                    {formErrors.endDate && (
                      <Typography color="error" variant="caption">
                        {String(formErrors.endDate.message)}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Điều kiện"
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      {...register("conditions")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Mô tả"
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      {...register("description")}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <FormActionButtons
                    submitLabel={editing ? "Cập nhật" : "Tạo mới"}
                    onCancel={() => setOpenForm(false)}
                    onSubmit={submitForm}
                    isSubmitting={isSubmitting}
                  />
                </Box>
              </CardContent>
            </Card>
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
