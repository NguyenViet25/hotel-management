import React, { useEffect, useMemo, useState } from "react";
import "dayjs/locale/vi"; // make sure Vietnamese locale is imported
import {
  Alert,
  Box,
  Button,
  capitalize,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Snackbar,
} from "@mui/material";
import {
  Add,
  ChevronLeft,
  ChevronRight,
  Edit,
  RemoveRedEye,
} from "@mui/icons-material";
import PageTitle from "../../../../components/common/PageTitle";
import kitchenApi, {
  type GetFoodsByWeekResponse,
  type FoodsByDayItem,
} from "../../../../api/kitchenApi";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import dayjs from "dayjs";
import ShoppingFormModal from "./components/ShoppingFormModal";
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
  const [shoppingOpen, setShoppingOpen] = useState<boolean>(false);
  const [selectedOrderDate, setSelectedOrderDate] = useState<
    dayjs.Dayjs | undefined
  >(undefined);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [initialShopping, setInitialShopping] = useState<
    import("../../../../api/kitchenApi").ShoppingDto | undefined
  >(undefined);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

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

  const openCreateShopping = (date: dayjs.Dayjs) => {
    setSelectedOrderDate(date);
    setInitialShopping(undefined);
    setModalMode("create");
    setShoppingOpen(true);
  };

  const openEditShopping = async (shoppingId?: string) => {
    if (!shoppingId) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy yêu cầu để sửa",
        severity: "error",
      });
      return;
    }
    try {
      const res = await kitchenApi.getShoppingOrderDetails(shoppingId);
      if (res.isSuccess) {
        setInitialShopping(res.data);
        setSelectedOrderDate(dayjs(getExactVNDate(res.data.orderDate)));
        setModalMode("edit");
        setShoppingOpen(true);
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Không tải được yêu cầu",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Đã xảy ra lỗi khi tải yêu cầu",
        severity: "error",
      });
    }
  };

  const handleShoppingSubmit = async (payload: {
    orderDate: string;
    hotelId: string;
    notes?: string | null;
    shoppingItems?: { name: string; quantity: string; unit: string }[] | null;
  }) => {
    try {
      let res;
      if (modalMode === "create") {
        res = await kitchenApi.generateShoppingList(payload);
      } else {
        res = await kitchenApi.updateShoppingList(payload);
      }
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message:
            modalMode === "create"
              ? "Tạo yêu cầu mua nguyên liệu thành công"
              : "Cập nhật yêu cầu mua nguyên liệu thành công",
          severity: "success",
        });

        fetchWeekFoods();
      } else {
        setSnackbar({
          open: true,
          message:
            modalMode === "create"
              ? res.message || "Không thể tạo yêu cầu"
              : res.message || "Không thể cập nhật yêu cầu",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message:
          modalMode === "create"
            ? "Đã xảy ra lỗi khi tạo yêu cầu"
            : "Đã xảy ra lỗi khi cập nhật yêu cầu",
        severity: "error",
      });
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
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && (
        <Grid container spacing={2}>
          {weekDays.map((d) => {
            const key = getExactVNDate(d.toDate().toDateString());
            const foods = foodsMap.get(key) || [];
            const dayEntry = data?.foodsByDays.find(
              (item) => getExactVNDate(item.date) === key
            );
            const hasShoppingOrder = !!dayEntry?.shoppingOrderId;
            const isToday = d.isSame(dayjs(), "day");
            return (
              <Grid size={{ xs: 12 }} key={`${key}-foods`}>
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
                      {!hasShoppingOrder ? (
                        <Button
                          startIcon={<Add />}
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => openCreateShopping(d)}
                        >
                          Tạo yêu cầu mua nguyên liệu
                        </Button>
                      ) : (
                        <Stack gap={1}>
                          <Button
                            startIcon={<Edit />}
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() =>
                              openEditShopping(dayEntry?.shoppingOrderId)
                            }
                          >
                            Sửa yêu cầu mua nguyên liệu
                          </Button>
                          <Button
                            startIcon={<RemoveRedEye />}
                            size="small"
                            variant="contained"
                            color="inherit"
                            onClick={() =>
                              openEditShopping(dayEntry?.shoppingOrderId)
                            }
                          >
                            Xem và đánh giá nguyên liệu
                          </Button>
                        </Stack>
                      )}
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
      <ShoppingFormModal
        open={shoppingOpen}
        onClose={() => {
          setInitialShopping(undefined);
          setShoppingOpen(false);
          setSelectedOrderDate(undefined);
        }}
        mode={modalMode}
        initialValues={initialShopping}
        defaultOrderDate={selectedOrderDate}
        onSubmit={handleShoppingSubmit}
        hotelId={hotelId || ""}
      />
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

export default function KitchenTimelinePage() {
  return (
    <Box>
      <PageTitle
        title="Lịch trình món ăn"
        subtitle="Xem và quản lý lịch trình món ăn"
      />
      <FoodTimeline />
    </Box>
  );
}
