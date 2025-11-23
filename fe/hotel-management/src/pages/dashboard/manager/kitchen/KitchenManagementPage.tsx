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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import DoneIcon from "@mui/icons-material/Done";
import EventIcon from "@mui/icons-material/Event";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import ordersApi, {
  type OrderDetailsDto,
  type OrderItemDto,
  type OrderSummaryDto,
  type OrderItemStatus,
} from "../../../../api/ordersApi";
import menusApi, { type MenuItemDto } from "../../../../api/menusApi";
import bookingsApi, {
  type BookingDetailsDto,
} from "../../../../api/bookingsApi";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import React, { useEffect, useMemo, useState } from "react";

type ColumnKey = "new" | "cooking" | "ready" | "served";

const getOrderPhase = (items: OrderItemDto[]): ColumnKey => {
  const total = items.length;
  const served = items.filter((i) => i?.status === "Served").length;
  const prepared = items.filter((i) => i?.status === "Prepared").length;
  const pending = items.filter((i) => i?.status === "Pending").length;
  if (served === total && total > 0) return "served";
  if (prepared === total && total > 0) return "ready";
  if (prepared > 0 && pending > 0) return "cooking";
  return "new";
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTarget, setMenuTarget] = useState<{
    orderId: string;
    itemId: string;
    qty: number;
  } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

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
      for (const b of bookingDetails) bMap[b.data.id] = b.data;
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
      new: [],
      cooking: [],
      ready: [],
      served: [],
    };
    for (const s of summaries) {
      const d = detailsMap[s.id];
      if (!d) continue;
      const key = getOrderPhase(d.items || []);
      g[key].push(d);
    }
    return g;
  }, [summaries, detailsMap]);

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
    const res = await ordersApi.getById(orderId);
    setDetailsMap((m) => ({ ...m, [orderId]: res.data }));
  };

  const saveNotes = async (orderId: string) => {
    const summary = summaries.find((s) => s.id === orderId);
    if (!summary) return;
    const text = notesDraft[orderId] || "";
    const tag = needConfirm[orderId] ? "[CẦN KH XÁC NHẬN] " : "";
    const payload = { id: orderId, notes: tag + text };
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
    await ordersApi.removeItem(menuTarget.orderId, menuTarget.itemId);
    await ordersApi.addItem(menuTarget.orderId, {
      menuItemId: menuItem.id,
      quantity: menuTarget.qty,
    });
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
    <Grid size={{ xs: 12, md: 3 }}>
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
                    <Typography fontWeight={600}>Ghi chú gửi khách</Typography>
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
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setNotesDraft((m) => ({
                            ...m,
                            [order.id]: IngredientNote,
                          }))
                        }
                      >
                        Không đạt nguyên liệu
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => saveNotes(order.id)}
                      >
                        Lưu ghi chú
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SwapHorizIcon />}
                        onClick={() =>
                          order.items[0] &&
                          openReplaceMenu(order.id, order.items[0])
                        }
                      >
                        Thay menu (chọn)
                      </Button>
                      <Button
                        variant="outlined"
                        color={needConfirm[order.id] ? "warning" : "inherit"}
                        onClick={() =>
                          setNeedConfirm((m) => ({
                            ...m,
                            [order.id]: !m[order.id],
                          }))
                        }
                      >
                        Đánh dấu cần KH xác nhận
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
                        <Typography sx={{ flex: 1 }}>
                          {it.menuItemName} x {it.quantity}
                        </Typography>
                        <Chip label={`${it.unitPrice.toLocaleString()} đ`} />
                        <Chip
                          label={
                            it?.status === "Pending"
                              ? "queued"
                              : it?.status === "Prepared"
                              ? "ready"
                              : it?.status?.toLowerCase()
                          }
                        />
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
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LocalDiningIcon />}
                          onClick={() => openReplaceMenu(order.id, it)}
                        >
                          Thay
                        </Button>
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

      {loading && <Alert severity="info">Đang tải...</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && (
        <Grid container spacing={2}>
          <Column title="Mới đặt" items={grouped.new} />
          <Column title="Đang nấu" items={grouped.cooking} />
          <Column title="Sẵn sàng" items={grouped.ready} />
          <Column title="Đã phục vụ" items={grouped.served} />
        </Grid>
      )}

      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chọn món thay thế</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {menuLoading && <Typography>Đang tải...</Typography>}
            {!menuLoading && menuItems.length === 0 && (
              <Typography>Không có món</Typography>
            )}
            {!menuLoading &&
              menuItems.map((mi) => (
                <Stack
                  key={mi.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography>{mi.name}</Typography>
                  <Button
                    variant="outlined"
                    onClick={() => applyReplaceMenu(mi)}
                  >
                    Chọn
                  </Button>
                </Stack>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMenuOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
