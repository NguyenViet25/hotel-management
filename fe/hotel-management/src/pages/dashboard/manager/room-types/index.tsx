import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import GridViewIcon from "@mui/icons-material/GridView";
import SearchIcon from "@mui/icons-material/Search";
import React, { useEffect, useState } from "react";
import roomTypesApi, {
  type CreateRoomTypeRequest,
  type RoomType,
  type UpdateRoomTypeRequest,
} from "../../../../api/roomTypesApi";
import PageTitle from "../../../../components/common/PageTitle";
import RoomTypeForm from "./components/RoomTypeForm";
import RoomTypeTable from "./components/RoomTypeTable";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import { Add, Delete, Edit } from "@mui/icons-material";

const RoomTypePage: React.FC = () => {
  const [items, setItems] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>();
  const [view, setView] = useState<"table" | "card">("card");
  const { hotelId } = useStore<StoreState>((state) => state);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<RoomType | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const fetchList = async (newPage?: number, search?: string) => {
    setLoading(true);
    try {
      const res = await roomTypesApi.getRoomTypes({
        page: newPage ?? page,
        pageSize,
        searchTerm: search,
        hotelId: hotelId ?? "",
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
    fetchList(1, search);
  }, [search]);

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
      <Stack
        direction={{ xs: "column", lg: "row" }}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
        spacing={1}
      >
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
          size="small"
          color="primary"
        >
          <ToggleButton value="table">
            <TableChartIcon sx={{ mr: 1 }} /> Bảng
          </ToggleButton>
          <ToggleButton value="card">
            <GridViewIcon sx={{ mr: 1 }} /> Thẻ
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack
          direction="row"
          spacing={1}
          justifyContent={{ xs: "flex-start", lg: "flex-end" }}
        >
          <TextField
            size="small"
            placeholder="Tìm kiếm..."
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button startIcon={<Add />} variant="contained" onClick={handleAdd}>
            Thêm mới
          </Button>
        </Stack>
      </Stack>

      {view === "table" ? (
        <RoomTypeTable
          data={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <Grid container spacing={2}>
          {items.map((rt) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={rt.id}>
              <Card
                variant="outlined"
                sx={{
                  position: "relative",
                  p: 1.5,

                  border: "2px dashed",
                  borderColor: "primary.main",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #E3F2FD 0%, #F5FAFF 100%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "transform 120ms ease",
                  "&:hover": { transform: "translateY(-2px)" },
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={
                      rt.imageUrl ||
                      "https://via.placeholder.com/640x360?text=Room+Type"
                    }
                    alt={rt.name}
                    sx={{ objectFit: "contain" }}
                  />

                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {rt.name}
                    </Typography>
                    <Stack spacing={1}>
                      <Typography
                        variant="body2"
                        sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                      >
                        Sức chứa: {rt.roomCount || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                      >
                        Giá:{" "}
                        {`${(rt.priceFrom ?? 0).toLocaleString()}đ - ${(
                          rt.priceTo ?? 0
                        ).toLocaleString()}đ`}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 40,
                        }}
                      >
                        {rt.description || "Chưa có mô tả"}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => handleEdit(rt)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="contained"
                          startIcon={<Delete />}
                          onClick={() => handleDelete(rt)}
                        >
                          Xóa
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
          {items.length === 0 && !loading && (
            <Grid>
              <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                Không có dữ liệu
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create */}
      <RoomTypeForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(e) => submitCreate(e)}
        hotelId={items[0]?.hotelId}
      />

      {/* Edit */}
      <RoomTypeForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(e) => submitUpdate(e)}
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
