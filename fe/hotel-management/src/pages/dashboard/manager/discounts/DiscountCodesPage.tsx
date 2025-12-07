import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import HotelIcon from "@mui/icons-material/Hotel";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Chip,
  Grid,
  Box,
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
import {
  CardGiftcard,
  CardMembership,
  CardTravel,
  TableChart,
  Tag,
} from "@mui/icons-material";

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
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "expired"
  >("active");
  const [searchTxt, setSearchTxt] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

  const applyFilters = (
    list: DiscountCode[],
    txt: string,
    scope: "all" | "booking" | "food",
    status: "all" | "active" | "inactive" | "expired"
  ) => {
    const q = (txt || "").toLowerCase();
    const now = new Date();
    return list.filter((r) => {
      const matchesText =
        r.code.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q);
      const matchesScope = scope === "all" ? true : r.scope === scope;
      const started = new Date(r.startDate) <= now;
      const notEnded = new Date(r.endDate) >= now;
      const expired = new Date(r.endDate) < now;
      const currentlyActive = r.isActive && started && notEnded;
      const matchesStatus =
        status === "all"
          ? true
          : status === "active"
          ? currentlyActive
          : status === "inactive"
          ? !r.isActive
          : expired;
      return matchesText && matchesScope && matchesStatus;
    });
  };

  const onSearch = async (txt: string) => {
    setSearchTxt(txt);
    setFilteredRows(applyFilters(rows, txt, scopeFilter, statusFilter));
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
      setFilteredRows(applyFilters(data, searchTxt, scopeFilter, statusFilter));
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
    setFilteredRows(applyFilters(rows, searchTxt, scopeFilter, statusFilter));
  }, [rows, searchTxt, scopeFilter, statusFilter]);

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
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="left"
          justifyContent={"space-between"}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="left"
          >
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, v) => setViewMode(v ?? viewMode)}
            >
              <ToggleButton value="table">
                <TableChart sx={{ mr: 1 }} fontSize="small" />
                Bảng
              </ToggleButton>
              <ToggleButton value="cards">
                <CardMembership sx={{ mr: 1 }} fontSize="small" />
                Thẻ
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              select
              label="Trạng thái"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Ngưng hoạt động</MenuItem>
              <MenuItem value="expired">Đã hết hạn</MenuItem>
            </TextField>

            <TextField
              placeholder="Tìm kiếm mã/điều kiện"
              size="small"
              value={searchTxt}
              onChange={(e) => onSearch(e.target.value)}
              sx={{ width: { md: 280, xs: "100%" } }}
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
          <Grid container spacing={3}>
            {(["booking", "food"] as const).map((scope) => {
              const items = filteredRows.filter((r) => r.scope === scope);
              const color = scope === "food" ? "success" : "primary";
              const borderColor =
                scope === "food" ? "success.main" : "primary.main";
              const bg =
                scope === "food"
                  ? "linear-gradient(135deg, #E8F5E9 0%, #F1FFF4 100%)"
                  : "linear-gradient(135deg, #E3F2FD 0%, #F5FAFF 100%)";
              return (
                <Grid size={{ xs: 12, md: 6 }} key={scope}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {scope === "food" ? (
                        <LocalDiningIcon color={color as any} />
                      ) : (
                        <HotelIcon color={color as any} />
                      )}
                      <Typography variant="h6">
                        {scope === "food" ? "Ăn uống" : "Đặt phòng"}
                      </Typography>
                      <Chip
                        label={`${items.length}`}
                        color={color as any}
                        size="small"
                      />
                    </Stack>

                    {items.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Không có mã
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                        {items.map((c) => (
                          <Box
                            key={c.id || c.code}
                            sx={{
                              position: "relative",
                              p: 1.5,
                              width: 220,
                              border: "2px dashed",
                              borderColor:
                                new Date(c.endDate) < new Date()
                                  ? "error.main"
                                  : borderColor,
                              borderRadius: "14px",
                              background: bg,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                              transition: "transform 120ms ease",
                              "&:hover": { transform: "translateY(-2px)" },
                              "&:before": {
                                content: '""',
                                position: "absolute",
                                top: "50%",
                                left: -8,
                                transform: "translateY(-50%)",
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                backgroundColor: "background.paper",
                                border: "2px solid",
                                borderColor:
                                  new Date(c.endDate) < new Date()
                                    ? "error.main"
                                    : borderColor,
                              },
                              "&:after": {
                                content: '""',
                                position: "absolute",
                                top: "50%",
                                right: -8,
                                transform: "translateY(-50%)",
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                backgroundColor: "background.paper",
                                border: "2px solid",
                                borderColor:
                                  new Date(c.endDate) < new Date()
                                    ? "error.main"
                                    : borderColor,
                              },
                              opacity: c.isActive ? 1 : 0.55,
                            }}
                          >
                            {new Date(c.endDate) < new Date() && (
                              <Chip
                                label="Hết hạn"
                                color="error"
                                size="small"
                                sx={{
                                  position: "absolute",
                                  bottom: 6,
                                  left: 6,
                                }}
                              />
                            )}
                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Typography
                                  variant="h4"
                                  sx={{
                                    fontWeight: 800,
                                    color:
                                      new Date(c.endDate) < new Date()
                                        ? "error.main"
                                        : borderColor,
                                    letterSpacing: 1,
                                    lineHeight: 1,
                                  }}
                                >
                                  {c.value}%
                                </Typography>
                                <Chip
                                  label={
                                    c.scope === "food" ? "Ăn uống" : "Đặt phòng"
                                  }
                                  color={color as any}
                                  size="small"
                                />
                              </Stack>

                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                {c.code}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(c.startDate).toLocaleDateString()} -{" "}
                                {new Date(c.endDate).toLocaleDateString()}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                noWrap
                              >
                                {c.description || ""}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={0.5}
                                justifyContent="flex-end"
                              >
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => onEdit(c)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                {/* <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => onDelete(c)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton> */}
                              </Stack>
                            </Stack>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
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
