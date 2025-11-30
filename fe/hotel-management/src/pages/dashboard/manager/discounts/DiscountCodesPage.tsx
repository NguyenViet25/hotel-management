import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { DiscountCode } from "../../../../api/discountCodesApi";
import discountCodesApi from "../../../../api/discountCodesApi";
import ConfirmModal from "../../../../components/common/ConfirmModel";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import type { DiscountFormValues } from "./components/DiscountForm";
import DiscountForm from "./components/DiscountForm";
import DiscountList from "./components/DiscountList";

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
  const [scopeFilter, setScopeFilter] = useState<"all" | "booking" | "food">(
    "all"
  );
  const [searchTxt, setSearchTxt] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const applyFilters = (
    list: DiscountCode[],
    txt: string,
    scope: "all" | "booking" | "food"
  ) => {
    const q = (txt || "").toLowerCase();
    return list.filter((r) => {
      const matchesText =
        r.code.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q);
      const matchesScope = scope === "all" ? true : r.scope === scope;
      return matchesText && matchesScope;
    });
  };

  const onSearch = async (txt: string) => {
    setSearchTxt(txt);
    setFilteredRows(applyFilters(rows, txt, scopeFilter));
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
      setFilteredRows(applyFilters(data, searchTxt, scopeFilter));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setFilteredRows(applyFilters(rows, searchTxt, scopeFilter));
  }, [rows, searchTxt, scopeFilter]);

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

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select
              label="Loại"
              size="small"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as any)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="booking">Đặt phòng</MenuItem>
              <MenuItem value="food">Ăn uống</MenuItem>
            </TextField>

            <TextField
              placeholder="Tìm kiếm mã/điều kiện"
              size="small"
              value={searchTxt}
              onChange={(e) => onSearch(e.target.value)}
              sx={{ width: 280 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, v) => setViewMode(v ?? viewMode)}
            >
              <ToggleButton value="table">Bảng</ToggleButton>
              <ToggleButton value="cards">Thẻ</ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAdd}
            >
              Thêm mới
            </Button>
          </Stack>
        </Stack>

        {viewMode === "table" ? (
          <DiscountList
            rows={filteredRows}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <Stack spacing={3}>
            {["booking", "food"].map((scope) => {
              const items = filteredRows.filter((r) => r.scope === scope);
              return (
                <Stack key={scope} spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6">
                      {scope === "food" ? "Ăn uống" : "Đặt phòng"}
                    </Typography>
                    <Chip
                      label={`${items.length}`}
                      color={scope === "food" ? "success" : "primary"}
                      size="small"
                    />
                  </Stack>
                  <Grid container spacing={2}>
                    {items.map((c) => (
                      <Grid
                        item
                        key={c.id || c.code}
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                      >
                        <Card variant="outlined">
                          <CardHeader
                            title={c.code}
                            subheader={
                              c.isActive ? "Đang hoạt động" : "Ngưng hoạt động"
                            }
                            action={
                              <Stack direction="row" spacing={1}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onEdit(c)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => onDelete(c)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            }
                          />
                          <CardContent>
                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Chip
                                  label={`${c.value}%`}
                                  color="success"
                                  size="small"
                                />
                                <Chip
                                  label={
                                    c.scope === "food" ? "Ăn uống" : "Đặt phòng"
                                  }
                                  color={
                                    c.scope === "food" ? "success" : "primary"
                                  }
                                  size="small"
                                />
                              </Stack>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {new Date(c.startDate).toLocaleDateString()} -{" "}
                                {new Date(c.endDate).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2">
                                {c.description || ""}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              );
            })}
          </Stack>
        )}

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
