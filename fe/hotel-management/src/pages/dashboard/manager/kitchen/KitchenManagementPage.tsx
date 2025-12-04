import { Check, Close, Save, Search, Warning } from "@mui/icons-material";
import DoneIcon from "@mui/icons-material/Done";
import EventIcon from "@mui/icons-material/Event";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import bookingsApi, {
  type BookingDetailsDto,
} from "../../../../api/bookingsApi";
import menusApi, { type MenuItemDto } from "../../../../api/menusApi";
import ordersApi, {
  type OrderDetailsDto,
  type OrderItemDto,
  type OrderItemStatus,
  type OrderSummaryDto,
} from "../../../../api/ordersApi";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";

type ColumnKey = "Mới" | "Đang nấu" | "Sẵn sàng" | "Đã phục vụ";

const getOrderPhase = (items: OrderItemDto[]): ColumnKey => {
  const total = items.length;
  const served = items.filter((i) => i?.status === "Served").length;
  const prepared = items.filter((i) => i?.status === "Prepared").length;
  const pending = items.filter((i) => i?.status === "Pending").length;
  if (served === total && total > 0) return "Đã phục vụ";
  if (prepared === total && total > 0) return "Sẵn sàng";
  if (prepared > 0 && pending > 0) return "Đang nấu";
  return "Mới";
};

export default function KitchenManagementPage() {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [summaries, setSummaries] = useState<OrderSummaryDto[]>([]);
  const [detailsMap, setDetailsMap] = useState<Record<string, OrderDetailsDto>>(
    {}
  );
  const [bookingMap, setBookingMap] = useState<
    Record<string, BookingDetailsDto | undefined>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [needConfirm, setNeedConfirm] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTarget, setMenuTarget] = useState<{
    orderId: string;
    itemId: string;
    qty: number;
  } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const fetchOrders = async () => {
    if (!hotelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.listOrders({
        hotelId,
        page: 1,
        pageSize: 100,
      });
      const list = res.data || [];
      setSummaries(list);
      const full = await Promise.all(list.map((s) => ordersApi.getById(s.id)));
      const map: Record<string, OrderDetailsDto> = {};
      for (const r of full) map[r.data.id] = r.data;
      setDetailsMap(map);
      const bookingsToFetch = list.filter((s) => !!s.bookingId);
      const bookingDetails = await Promise.all(
        bookingsToFetch.map((s) => bookingsApi.getById(s.bookingId!))
      );
      const bMap: Record<string, BookingDetailsDto | undefined> = {};
      for (const b of bookingDetails) bMap[b.data!.id] = b.data;
      setBookingMap(bMap);
    } catch {
      setError("Không thể tải danh sách đơn đồ ăn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [hotelId]);

  const grouped = useMemo(() => {
    const g: Record<ColumnKey, OrderDetailsDto[]> = {
      Mới: [],
      "Đang nấu": [],
      "Sẵn sàng": [],
      "Đã phục vụ": [],
    };
    for (const s of summaries) {
      const d = detailsMap[s.id];
      if (!d) continue;
      const created = dayjs(d.createdAt);
      const inRange =
        created.isAfter(startDate.startOf("day").subtract(1, "millisecond")) &&
        created.isBefore(endDate.endOf("day").add(1, "millisecond"));
      if (!inRange) continue;
      const key = getOrderPhase(d.items || []);
      g[key].push(d);
    }
    return g;
  }, [summaries, detailsMap, startDate, endDate]);

  const updateItemStatus = async (
    orderId: string,
    itemId: string,
    status: OrderItemStatus
  ) => {
    await ordersApi.updateItem(orderId, itemId, { status });
    const res = await ordersApi.getById(orderId);
    setDetailsMap((m) => ({ ...m, [orderId]: res.data }));
  };

  const startCookingOrder = async (orderId: string) => {
    const d = detailsMap[orderId];
    if (!d) return;
    const pending = d.items.filter((i) => i?.status === "Pending");
    await Promise.all(
      pending.map((i) =>
        ordersApi.updateItem(orderId, i.id, { status: "Prepared" })
      )
    );
    const summary = summaries.find((s) => s.id === orderId);
    if (summary) {
      const payload = { id: orderId, status: 3 as any };
      if (summary.isWalkIn) {
        await ordersApi.updateWalkIn(orderId, payload);
      } else {
        await ordersApi.updateForBooking(orderId, payload);
      }
    }
    const res = await ordersApi.getById(orderId);
    setDetailsMap((m) => ({ ...m, [orderId]: res.data }));
  };

  const saveNotes = async (orderId: string) => {
    const summary = summaries.find((s) => s.id === orderId);
    if (!summary) return;
    const text = notesDraft[orderId] || "";
    const tag = needConfirm[orderId] ? "[CẦN KH XÁC NHẬN] " : "";
    const payload: any = { id: orderId, notes: tag + text };
    if (needConfirm[orderId]) payload.status = 1 as any;
    if (summary.isWalkIn) {
      await ordersApi.updateWalkIn(orderId, payload);
    } else {
      await ordersApi.updateForBooking(orderId, payload);
    }
    const res = await ordersApi.getById(orderId);
    setDetailsMap((m) => ({ ...m, [orderId]: res.data }));
  };

  const openReplaceMenu = async (orderId: string, item: OrderItemDto) => {
    setMenuTarget({ orderId, itemId: item.id, qty: item.quantity });
    setMenuLoading(true);
    try {
      const res = await menusApi.getMenuItems({
        isActive: true,
        page: 1,
        pageSize: 100,
      });
      setMenuItems(res.data || []);
      setMenuOpen(true);
    } finally {
      setMenuLoading(false);
    }
  };

  const applyReplaceMenu = async (menuItem: MenuItemDto) => {
    if (!menuTarget) return;
    await ordersApi.replaceItem(menuTarget.orderId, menuTarget.itemId, {
      newMenuItemId: menuItem.id,
      quantity: menuTarget.qty,
      reason: notesDraft[menuTarget.orderId] || undefined,
    });
    const summary = summaries.find((s) => s.id === menuTarget.orderId);
    if (summary) {
      const payload = { id: menuTarget.orderId, status: 1 as any };
      if (summary.isWalkIn) {
        await ordersApi.updateWalkIn(menuTarget.orderId, payload);
      } else {
        await ordersApi.updateForBooking(menuTarget.orderId, payload);
      }
      setNeedConfirm((m) => ({ ...m, [menuTarget.orderId]: true }));
    }
    const res = await ordersApi.getById(menuTarget.orderId);
    setDetailsMap((m) => ({ ...m, [menuTarget.orderId]: res.data }));
    setMenuOpen(false);
    setMenuTarget(null);
  };

  const IngredientNote =
    "VD: Hôm nay nguyên liệu A không đạt, xin phép bếp thay bằng món B. Anh/chị xác nhận giúp bếp ạ.";

  const Column = ({
    title,
    items,
  }: {
    title: string;
    items: OrderDetailsDto[];
  }) => (
    <Grid size={{ xs: 12 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          <Chip label={items.length} size="small" />
        </Stack>
        {items.map((order) => {
          const booking = order.bookingId
            ? bookingMap[order.bookingId]
            : undefined;
          const room =
            booking?.bookingRoomTypes?.[0]?.bookingRooms?.[0]?.roomName;
          return (
            <Card key={order.id} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack spacing={0.5}>
                      <Typography fontWeight={700}>Order {order.id}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={new Date(order.createdAt).toLocaleDateString()}
                          icon={<EventIcon />}
                          size="small"
                        />
                        {order.bookingId && (
                          <Chip
                            label={`Booking ${order.bookingId}`}
                            size="small"
                          />
                        )}
                      </Stack>
                      {booking && (
                        <Typography variant="body2" color="text.secondary">
                          {booking.primaryGuestName} (
                          {(booking.phoneNumber || "").slice(0, 4)}...
                          {(booking.phoneNumber || "").slice(-3)})
                        </Typography>
                      )}
                      {room && (
                        <Typography variant="body2" color="text.secondary">
                          Phòng {room}
                        </Typography>
                      )}
                    </Stack>
                    <Chip label={getOrderPhase(order.items)} color="default" />
                  </Stack>

                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent={"space-between"}
                      spacing={1}
                      alignItems={"center"}
                    >
                      <Typography fontWeight={600}>
                        Ghi chú gửi khách
                      </Typography>
                      <Button
                        startIcon={<Warning />}
                        color="error"
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setNotesDraft((m) => ({
                            ...m,
                            [order.id]: IngredientNote,
                          }));
                          setNeedConfirm((m) => ({ ...m, [order.id]: true }));
                        }}
                      >
                        Không đạt nguyên liệu
                      </Button>
                    </Stack>
                    <TextField
                      size="small"
                      value={notesDraft[order.id] ?? order.notes ?? ""}
                      onChange={(e) =>
                        setNotesDraft((m) => ({
                          ...m,
                          [order.id]: e.target.value,
                        }))
                      }
                      multiline
                      minRows={3}
                    />
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {needConfirm[order.id] && (
                        <Chip label="Chờ xác nhận" color="warning" />
                      )}
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Save />}
                        onClick={() => saveNotes(order.id)}
                      >
                        Lưu ghi chú
                      </Button>
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    {(order.items || []).map((it) => (
                      <Stack
                        key={it.id}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Typography
                          sx={{
                            flex: 1,
                            textDecoration:
                              it.status === "Voided" ? "line-through" : "none",
                          }}
                        >
                          {it.menuItemName} x {it.quantity}
                        </Typography>
                        {it.status === "Voided" &&
                          order.itemHistories &&
                          (() => {
                            const hist = order.itemHistories.find(
                              (h) => h.oldOrderItemId === it.id
                            );
                            if (!hist) return null;
                            return (
                              <Chip
                                label={`Thay: ${hist.oldMenuItemName} → ${hist.newMenuItemName}`}
                                icon={<SwapHorizIcon />}
                                color="warning"
                              />
                            );
                          })()}
                        {/* New item highlight */}
                        {order.itemHistories &&
                          order.itemHistories.some(
                            (h) => h.newOrderItemId === it.id
                          ) && <Chip label={`Món mới`} color="success" />}
                        <Chip label={`${it.unitPrice.toLocaleString()} đ`} />

                        {it?.status === "Pending" && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              updateItemStatus(order.id, it.id, "Prepared")
                            }
                          >
                            Nấu
                          </Button>
                        )}
                        {it?.status === "Prepared" && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DoneIcon />}
                            onClick={() =>
                              updateItemStatus(order.id, it.id, "Served")
                            }
                          >
                            Phục vụ
                          </Button>
                        )}
                      </Stack>
                    ))}
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Chip
                      label={`Tổng: ${order.itemsTotal.toLocaleString()} đ`}
                    />
                    <Button
                      variant="contained"
                      startIcon={<SoupKitchenIcon />}
                      onClick={() => startCookingOrder(order.id)}
                    >
                      Bắt đầu nấu
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
        {items.length === 0 && <Alert severity="info">Không có đơn</Alert>}
      </Stack>
    </Grid>
  );

  return (
    <Box>
      <PageTitle
        title="Danh sách đơn đồ ăn"
        subtitle="Xem và quản lý các đơn hàng đồ ăn"
      />

      <Box sx={{ my: 1 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <DatePicker
              label="Từ ngày"
              value={startDate}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
              onChange={(v) => setStartDate(v ?? dayjs())}
            />
            <DatePicker
              label="Đến ngày"
              value={endDate}
              minDate={startDate}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
              onChange={(v) => setEndDate(v ?? dayjs())}
            />
          </Stack>
        </LocalizationProvider>
      </Box>

      {loading && <Alert severity="info">Đang tải...</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && (
        <Grid container spacing={2}>
          <Column title="Mới đặt" items={grouped["Mới"]} />
          <Column title="Đang nấu" items={grouped["Đang nấu"]} />
          <Column title="Sẵn sàng" items={grouped["Sẵn sàng"]} />
          <Column title="Đã phục vụ" items={grouped["Đã phục vụ"]} />
        </Grid>
      )}

      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1.5 }}>
          🍽️ Chọn món thay thế
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "grey.50" }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Search */}
            <TextField
              placeholder="Tìm món..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {menuLoading && (
              <Typography color="text.secondary">Đang tải...</Typography>
            )}

            {!menuLoading && menuItems.length === 0 && (
              <Typography color="text.secondary">Không có món</Typography>
            )}

            {/* Food list */}
            {!menuLoading &&
              menuItems
                .filter((mi) =>
                  (search || "").trim().length === 0
                    ? true
                    : mi.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((mi) => (
                  <Stack
                    key={mi.id}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: "white",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "0.15s",
                      "&:hover": {
                        bgcolor: "grey.100",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {/* Left section */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight={600}>{mi.name}</Typography>
                      {mi.unitPrice && (
                        <Typography variant="body2" color="text.secondary">
                          {mi.unitPrice.toLocaleString()}₫
                        </Typography>
                      )}
                    </Box>

                    {/* Select button */}
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => applyReplaceMenu(mi)}
                      endIcon={<Check />}
                      sx={{ fontWeight: 600 }}
                    >
                      Chọn
                    </Button>
                  </Stack>
                ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setMenuOpen(false)}
            variant="outlined"
            color="inherit"
            startIcon={<Close />}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
