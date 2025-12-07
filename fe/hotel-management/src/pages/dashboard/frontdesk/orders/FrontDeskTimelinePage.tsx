import {
  Cancel,
  Check,
  ChevronLeft,
  ChevronRight,
  RemoveRedEye,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  capitalize,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Loading from "../../../../components/common/Loading";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // make sure Vietnamese locale is imported
import React, { useEffect, useMemo, useState } from "react";
import kitchenApi, {
  type FoodsByDayItem,
  type GetFoodsByWeekResponse,
  type ShoppingItemDto,
  ShoppingOrderStatus,
} from "../../../../api/kitchenApi";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import { getExactVNDate } from "../../../../utils/date-helper";

// Compute Monday → Sunday for the given date
const getWeekRange = (date: Date) => {
  const d = dayjs(date);
  const start = d.startOf("week").add(1, "day");
  const end = start.add(6, "day");
  return { start, end };
};
// Format currency for unit price (VND style)
const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

// Timeline component rendering one week with 7 day boxes
const FoodTimeline: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [data, setData] = useState<GetFoodsByWeekResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [initialShopping, setInitialShopping] = useState<
    import("../../../../api/kitchenApi").ShoppingDto | undefined
  >(undefined);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [reviewOpen, setReviewOpen] = useState<boolean>(false);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewItems, setReviewItems] = useState<ShoppingItemDto[]>([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [statusAction, setStatusAction] = useState<"confirm" | "cancel" | null>(
    null
  );
  const [statusTargetId, setStatusTargetId] = useState<string | undefined>(
    undefined
  );

  const { start, end } = useMemo(
    () => getWeekRange(currentDate),
    [currentDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => start.add(i, "day")),
    [start]
  );
  const fetchWeekFoods = async () => {
    if (!hotelId) {
      setError("Không tìm thấy khách sạn để tải dữ liệu");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await kitchenApi.getFoodsByWeek({
        startDate: getExactVNDate(start.toDate().toDateString()),
        hotelId,
      });
      if (res.isSuccess) {
        setData(res.data);
      } else {
        setError(res.message || "Không thể tải dữ liệu món ăn");
      }
    } catch {
      setError("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch foods for the current week and hotel
  useEffect(() => {
    fetchWeekFoods();
  }, [currentDate, hotelId]);

  // Quick lookup map: YYYY-MM-DD → FoodsByDayItem[]
  const foodsMap = useMemo(() => {
    const map = new Map<string, FoodsByDayItem[]>();
    if (data?.foodsByDays) {
      for (const day of data.foodsByDays) {
        const key = getExactVNDate(day.date);
        map.set(key, day.foodsByDayItems || []);
      }
    }
    return map;
  }, [data]);

  const handlePrevWeek = () =>
    setCurrentDate(dayjs(currentDate).subtract(7, "day").toDate());
  const handleNextWeek = () =>
    setCurrentDate(dayjs(currentDate).add(7, "day").toDate());
  const today = dayjs();

  const openReviewIngredients = async (shoppingId?: string) => {
    if (!shoppingId) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy yêu cầu để xem",
        severity: "error",
      });
      return;
    }
    try {
      setReviewLoading(true);
      const res = await kitchenApi.getShoppingOrderDetails(shoppingId);
      if (res.isSuccess) {
        const items: ShoppingItemDto[] = (res.data.shoppingItems ?? []).map(
          (it) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            unit: it.unit,
            qualityStatus: it.qualityStatus,
          })
        );
        setInitialShopping(res.data);
        setReviewItems(items);
        setReviewOpen(true);
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không tải được danh sách nguyên liệu",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi tải danh sách nguyên liệu",
        severity: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const openStatusDialog = (
    shoppingId?: string,
    action?: "confirm" | "cancel"
  ) => {
    if (!shoppingId || !action) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy yêu cầu",
        severity: "error",
      });
      return;
    }
    setStatusTargetId(shoppingId);
    setStatusAction(action);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!statusTargetId || !statusAction) return;
    try {
      const next =
        statusAction === "confirm"
          ? ShoppingOrderStatus.Confirmed
          : ShoppingOrderStatus.Cancelled;
      const res = await kitchenApi.updateShoppingOrderStatus(
        statusTargetId,
        next
      );
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Cập nhật trạng thái thành công",
          severity: "success",
        });
        await fetchWeekFoods();
        setReviewOpen(false);
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không thể cập nhật trạng thái",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi cập nhật trạng thái",
        severity: "error",
      });
    } finally {
      setStatusDialogOpen(false);
      setStatusAction(null);
      setStatusTargetId(undefined);
    }
  };

  useEffect(() => {
    const todayKey = getExactVNDate(today.toDate().toDateString());
    const el = document.getElementById(`${todayKey}-foods`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentDate]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <IconButton aria-label="Tuần trước" onClick={handlePrevWeek}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          {start.format("DD/MM/YYYY")} - {end.format("DD/MM/YYYY")}
        </Typography>
        <IconButton aria-label="Tuần sau" onClick={handleNextWeek}>
          <ChevronRight />
        </IconButton>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <Loading label="Đang tải..." />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && (
        <Grid container spacing={2}>
          {weekDays.map((d, index) => {
            const key = getExactVNDate(d.toDate().toDateString());
            const foods = foodsMap.get(key) || [];
            const dayEntry = data?.foodsByDays.find(
              (item) => getExactVNDate(item.date) === key
            );
            const isToday = d.isSame(dayjs(), "day");
            return (
              <Grid size={{ xs: 12 }} key={`${index}-foods`}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    bgcolor: isToday ? "action.selected" : "background.paper",
                    height: "100%",
                  }}
                >
                  <Stack alignItems="center" spacing={0.5} mb={1}>
                    <Chip
                      label={capitalize(d.locale("vi").format("dddd"))} // full weekday
                      color={d.isSame(today, "day") ? "primary" : "default"} // highlight today
                      size="small"
                    />

                    <Typography
                      variant="subtitle1"
                      fontWeight={d.isSame(today, "day") ? 700 : 400} // bold today’s date
                    >
                      {d.format("DD/MM/YYYY")}
                    </Typography>
                    <Stack gap={1}>
                      <Button
                        startIcon={<RemoveRedEye />}
                        size="small"
                        variant="contained"
                        color="inherit"
                        onClick={() =>
                          openReviewIngredients(dayEntry?.shoppingOrderId)
                        }
                      >
                        Xem và xác nhận yêu cầu mua nguyên liệu
                      </Button>
                    </Stack>
                  </Stack>
                  <List dense>
                    {foods.length > 0 ? (
                      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Tên món</TableCell>
                              <TableCell align="center">Số lượng</TableCell>
                              <TableCell align="right">Giá</TableCell>
                              <TableCell align="right">Tổng</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {foods.map((food, index) => (
                              <TableRow key={food.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{food.name}</TableCell>
                                <TableCell align="center">
                                  {food.quantity}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(food.unitPrice)}đ
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(
                                    food.quantity * food.unitPrice
                                  )}
                                  đ
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography
                        variant="body2"
                        textAlign="center"
                        color="text.secondary"
                      >
                        Không có món ăn nào.
                      </Typography>
                    )}
                  </List>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Yêu cầu mua nguyên liệu
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              {initialShopping?.shoppingOrderStatus ===
                ShoppingOrderStatus.Confirmed && (
                <Chip label="Đã xác nhận" color="success" size="small" />
              )}
              {initialShopping?.shoppingOrderStatus ===
                ShoppingOrderStatus.Cancelled && (
                <Chip label="Đã hủy" color="error" size="small" />
              )}
              {(initialShopping?.shoppingOrderStatus === undefined ||
                initialShopping?.shoppingOrderStatus ===
                  ShoppingOrderStatus.Draft) && (
                <Chip label="Chờ xác nhận" color="default" size="small" />
              )}
              <Chip
                label={dayjs(initialShopping?.orderDate).format("DD/MM/YYYY")}
                size="small"
              />
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Tên nguyên liệu</TableCell>
                    <TableCell align="center">Số lượng</TableCell>
                    <TableCell align="center">Đơn vị</TableCell>
                    <TableCell align="center">Chất lượng</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(reviewItems || []).map((it, idx) => (
                    <TableRow key={it.id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{it.name}</TableCell>
                      <TableCell align="center">{it.quantity}</TableCell>
                      <TableCell align="center">{it.unit}</TableCell>
                      <TableCell align="center">
                        {it.qualityStatus ?? ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Check />}
            onClick={() => openStatusDialog(initialShopping?.id, "confirm")}
          >
            Xác nhận
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            onClick={() => openStatusDialog(initialShopping?.id, "cancel")}
          >
            Hủy
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

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {statusAction === "confirm"
            ? "Xác nhận yêu cầu mua nguyên liệu"
            : "Hủy yêu cầu mua nguyên liệu"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            {statusAction === "confirm"
              ? "Bạn có muốn xác nhận yêu cầu mua nguyên liệu này?"
              : "Bạn có chắc chắn muốn hủy yêu cầu mua nguyên liệu này?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setStatusDialogOpen(false)}
          >
            Đóng
          </Button>
          <Button
            variant="contained"
            onClick={confirmStatusChange}
            startIcon={statusAction === "confirm" ? undefined : undefined}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function FrontDeskTimelinePage() {
  return (
    <Box>
      <PageTitle
        title="Lịch trình món ăn"
        subtitle="Xem lịch trình món ăn và xác nhận yêu cầu mua nguyên liệu"
      />
      <FoodTimeline />
    </Box>
  );
}
