import {
  AccessTime,
  ArrowCircleRight,
  ChatBubble,
  Check,
  Close,
  ExpandMore,
  Info,
  Lightbulb,
  Phone,
  Save,
  Search,
  Warning,
} from "@mui/icons-material";
import DoneIcon from "@mui/icons-material/Done";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import bookingsApi, {
  type BookingDetailsDto,
} from "../../../../api/bookingsApi";
import menusApi, { type MenuItemDto } from "../../../../api/menusApi";
import ordersApi, {
  EOrderStatus,
  type OrderDetailsDto,
  type OrderSummaryDto,
} from "../../../../api/ordersApi";
import PageTitle from "../../../../components/common/PageTitle";
import FloatingWarningIcon from "../../../../components/common/FloatingWarningIcon";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import { isEmpty } from "lodash";

type ColumnKey = "Mới" | "Đang nấu" | "Sẵn sàng" | "Đã phục vụ";

const getOrderPhase = (status: number): string => {
  if (status === EOrderStatus.Draft) return "Mới";
  if (status === EOrderStatus.NeedConfirmed) return "Chờ xác nhận";
  if (status === EOrderStatus.Confirmed) return "Đã xác nhận";
  if (status === EOrderStatus.InProgress) return "Đang nấu";
  if (status === EOrderStatus.Ready) return "Sẵn sàng";
  if (status === EOrderStatus.Completed) return "Đã phục vụ";
  return "Mới";
};

export default function KitchenManagementPage() {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [summaries, setSummaries] = useState<OrderSummaryDto[]>([]);
  const [detailsMap, setDetailsMap] = useState<Record<string, OrderDetailsDto>>(
    {},
  );
  const [bookingMap, setBookingMap] = useState<
    Record<string, BookingDetailsDto | undefined>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [needConfirm, setNeedConfirm] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const inputRefs = useRef<
    Record<string, HTMLTextAreaElement | HTMLInputElement | null>
  >({});
  const cursorPosRef = useRef<Record<string, { start: number; end: number }>>(
    {},
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTarget, setMenuTarget] = useState<{
    orderId: string;
    itemId: string;
    qty: number;
  } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuItemMap, setMenuItemMap] = useState<Record<string, MenuItemDto>>(
    {},
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusDialogTargetId, setStatusDialogTargetId] = useState<
    string | null
  >(null);
  const [statusDialogNext, setStatusDialogNext] = useState<number | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {},
  );

  const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf("day"));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs().endOf("day"));

  const getNextOrderStatus = (s: number): number | null => {
    if (s === EOrderStatus.Draft) return EOrderStatus.NeedConfirmed;
    if (s === EOrderStatus.NeedConfirmed) return EOrderStatus.Confirmed;
    if (s === EOrderStatus.Confirmed) return EOrderStatus.InProgress;
    if (s === EOrderStatus.InProgress) return EOrderStatus.Ready;
    if (s === EOrderStatus.Ready) return EOrderStatus.Completed;
    return null;
  };

  const getNextStatusLabel = (s: number): string => {
    if (s === EOrderStatus.Draft) return "Chờ xác nhận";
    if (s === EOrderStatus.NeedConfirmed) return "Xác nhận";
    if (s === EOrderStatus.Confirmed) return "Bắt đầu nấu";
    if (s === EOrderStatus.InProgress) return "Sẵn sàng";
    if (s === EOrderStatus.Ready) return "Hoàn tất";
    return "";
  };

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
        bookingsToFetch.map((s) => bookingsApi.getById(s.bookingId!)),
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

  useEffect(() => {
    (async () => {
      try {
        const res = await menusApi.getMenuItems({
          isActive: true,
          page: 1,
          pageSize: 500,
        });
        const map: Record<string, MenuItemDto> = {};
        for (const mi of res.data || []) map[mi.id] = mi;
        setMenuItemMap(map);
      } catch {}
    })();
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
      const st = Number(d.status);
      if (st === EOrderStatus.NeedConfirmed) continue;
      if (st === EOrderStatus.Draft) {
        g["Mới"].push(d);
        continue;
      }
      if (st === EOrderStatus.InProgress) {
        g["Đang nấu"].push(d);
        continue;
      }
      if (st === EOrderStatus.Ready) {
        g["Sẵn sàng"].push(d);
        continue;
      }
      if (st === EOrderStatus.Completed) {
        g["Đã phục vụ"].push(d);
        continue;
      }
    }
    return g;
  }, [summaries, detailsMap, startDate, endDate]);

  const needConfirmedOrders = useMemo(() => {
    const list: OrderDetailsDto[] = [];
    for (const s of summaries) {
      const d = detailsMap[s.id];
      if (!d) continue;
      const created = dayjs(d.createdAt);
      const inRange =
        created.isAfter(startDate.startOf("day").subtract(1, "millisecond")) &&
        created.isBefore(endDate.endOf("day").add(1, "millisecond"));
      if (!inRange) continue;
      if (Number(d.status) === EOrderStatus.NeedConfirmed) list.push(d);
    }
    return list;
  }, [summaries, detailsMap, startDate, endDate]);

  const confirmedOrders = useMemo(() => {
    const list: OrderDetailsDto[] = [];
    for (const s of summaries) {
      const d = detailsMap[s.id];
      if (!d) continue;
      const created = dayjs(d.createdAt);
      const inRange =
        created.isAfter(startDate.startOf("day").subtract(1, "millisecond")) &&
        created.isBefore(endDate.endOf("day").add(1, "millisecond"));
      if (!inRange) continue;
      if (Number(d.status) === EOrderStatus.Confirmed) list.push(d);
    }
    return list;
  }, [summaries, detailsMap, startDate, endDate]);

  const startCookingOrder = async (orderId: string) => {
    const d = detailsMap[orderId];
    if (!d) return;
    const pending = d.items.filter(
      (i) => Number(i?.status) === EOrderStatus.Confirmed,
    );
    await Promise.all(
      pending.map((i) =>
        ordersApi.updateItem(orderId, i.id, {
          status: EOrderStatus.InProgress as any,
        }),
      ),
    );
    await ordersApi.updateStatus(orderId, {
      status: EOrderStatus.InProgress as any,
    });
    const res = await ordersApi.getById(orderId);
    setDetailsMap((m) => ({ ...m, [orderId]: res.data }));
  };

  const advanceOrderStatus = async (orderId: string) => {
    const current = Number(detailsMap[orderId]?.status ?? 0);
    if (current === 2) {
      await startCookingOrder(orderId);
      return;
    }
    const next = getNextOrderStatus(current);
    if (next === null) return;
    await ordersApi.updateStatus(orderId, { status: next as any });
    const res = await ordersApi.getById(orderId);
    setDetailsMap((m) => ({ ...m, [orderId]: res.data }));
  };

  const openStatusDialog = (orderId: string) => {
    const current = Number(detailsMap[orderId]?.status ?? 0);
    const next = getNextOrderStatus(current);
    if (next === null) return;
    setStatusDialogTargetId(orderId);
    setStatusDialogNext(next);
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!statusDialogTargetId || statusDialogNext === null) return;
    const current = Number(detailsMap[statusDialogTargetId]?.status ?? 0);
    if (
      current === EOrderStatus.Confirmed &&
      statusDialogNext === EOrderStatus.InProgress
    ) {
      await startCookingOrder(statusDialogTargetId);
    } else {
      await ordersApi.updateStatus(statusDialogTargetId, {
        status: statusDialogNext as any,
      });
    }
    const res = await ordersApi.getById(statusDialogTargetId);
    setDetailsMap((m) => ({ ...m, [statusDialogTargetId]: res.data }));
    setStatusDialogOpen(false);
    setStatusDialogTargetId(null);
    setStatusDialogNext(null);
    toast.success("Cập nhật trạng thái thành công");
  };

  const openConfirmDialog = (orderId: string) => {
    setConfirmTargetId(orderId);
    setConfirmOpen(true);
  };

  const confirmOrder = async () => {
    if (!confirmTargetId) return;
    await ordersApi.updateStatus(confirmTargetId, {
      status: EOrderStatus.Confirmed as any,
    });
    const res = await ordersApi.getById(confirmTargetId);
    setDetailsMap((m) => ({ ...m, [confirmTargetId]: res.data }));
    setConfirmOpen(false);
    setConfirmTargetId(null);
    toast.success("Xác nhận đơn thành công");
  };

  const saveNotes = async (orderId: string) => {
    const text = notesDraft[orderId] || "";
    const currentStatus = Number(detailsMap[orderId]?.status);
    const payload: any = {
      status: needConfirm[orderId]
        ? (EOrderStatus.NeedConfirmed as any)
        : (currentStatus as any),
      notes: text,
    };
    await ordersApi.updateStatus(orderId, payload);
    const res = await ordersApi.getById(orderId);
    setDetailsMap((m) => ({ ...m, [orderId]: res.data }));

    toast.success("Lưu yêu cầu đổi món thành công");
  };

  const applyReplaceMenu = async (menuItem: MenuItemDto) => {
    if (!menuTarget) return;
    await ordersApi.replaceItem(menuTarget.orderId, menuTarget.itemId, {
      newMenuItemId: menuItem.id,
      quantity: menuTarget.qty,
      reason: notesDraft[menuTarget.orderId] || undefined,
    });
    await ordersApi.updateStatus(menuTarget.orderId, {
      status: EOrderStatus.NeedConfirmed as any,
    });
    setNeedConfirm((m) => ({ ...m, [menuTarget.orderId]: true }));
    const res = await ordersApi.getById(menuTarget.orderId);
    setDetailsMap((m) => ({ ...m, [menuTarget.orderId]: res.data }));
    setMenuOpen(false);
    setMenuTarget(null);
  };

  const IngredientNote =
    "Hôm nay nguyên liệu A không đạt, xin phép bếp thay bằng món B. Anh/chị xác nhận giúp bếp ạ.";

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
          const guestCount = (booking?.bookingRoomTypes || [])
            .flatMap((brt) => brt.bookingRooms || [])
            .reduce((sum, br) => sum + (br.guests?.length || 0), 0);
          return (
            <Accordion
              key={order.id}
              sx={{
                borderRadius: 2,
                "&:not(.Mui-expanded)::before": { display: "none" },
              }}
              disableGutters
              expanded={!!expandedOrders[order.id]}
              onChange={(_, isExpanded) =>
                setExpandedOrders((m) => ({ ...m, [order.id]: isExpanded }))
              }
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack
                  direction="row"
                  spacing={0.5}
                  justifyContent={"space-between"}
                  alignItems="center"
                  sx={{ width: "100%" }}
                >
                  <Typography fontWeight={700}>Order {order.id}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {room && (
                      <Typography variant="body2" color="text.secondary">
                        Phòng {room}
                      </Typography>
                    )}
                    <Chip
                      label={getOrderPhase(order.status)}
                      color={
                        order.status === EOrderStatus.NeedConfirmed
                          ? "default"
                          : order.status === EOrderStatus.Confirmed
                            ? "primary"
                            : order.status === EOrderStatus.InProgress
                              ? "primary"
                              : order.status === EOrderStatus.Ready
                                ? "primary"
                                : order.status === EOrderStatus.Completed
                                  ? "success"
                                  : order.status === EOrderStatus.Cancelled
                                    ? "error"
                                    : "default"
                      }
                      size="small"
                    />
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.5}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        p: 1,
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 1.5,
                        bgcolor: "grey.50",
                      }}
                    >
                      <Stack spacing={0.75}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2">
                            {order.servingDate
                              ? new Date(order.servingDate).toLocaleString(
                                  "vi-VN",
                                )
                              : "—"}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            Họ và tên: {order.customerName}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">
                            SĐT: {order.customerPhone}
                          </Typography>
                        </Stack>
                        {(guestCount || order.guests) && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              Số khách: {guestCount || order.guests}
                            </Typography>
                          </Stack>
                        )}
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <ChatBubble fontSize="small" color="action" />
                          <Typography variant="body2">
                            Ghi chú của lễ tân: {order.notes || "—"}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack spacing={1}>
                    <Box>
                      <Stack spacing={0.75}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          {Number(order.status) ===
                            EOrderStatus.NeedConfirmed && (
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <Typography variant="body2" fontWeight={700}>
                                Yêu cầu đổi món
                              </Typography>
                              <Button
                                startIcon={<Lightbulb />}
                                color="warning"
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setNotesDraft((m) => ({
                                    ...m,
                                    [order.id]: IngredientNote,
                                  }));
                                  setNeedConfirm((m) => ({
                                    ...m,
                                    [order.id]: true,
                                  }));
                                  const el = inputRefs.current[order.id];
                                  requestAnimationFrame(() => {
                                    if (el) {
                                      el.focus();
                                      const len =
                                        (el as HTMLInputElement).value
                                          ?.length ??
                                        (el as HTMLTextAreaElement).value
                                          ?.length ??
                                        0;
                                      try {
                                        el.setSelectionRange(len, len);
                                      } catch {}
                                    }
                                  });
                                }}
                                sx={{ fontSize: "0.75rem", py: 0.3 }}
                              >
                                Gợi ý thay đổi món
                              </Button>
                            </Stack>
                          )}
                        </Stack>
                        {Number(order.status) === EOrderStatus.NeedConfirmed ? (
                          <TextField
                            size="small"
                            value={
                              notesDraft[order.id] ??
                              order.changeFoodRequest ??
                              ""
                            }
                            onChange={(e) => {
                              const el = inputRefs.current[order.id];
                              const start =
                                (el as HTMLInputElement | HTMLTextAreaElement)
                                  ?.selectionStart ?? 0;
                              const end =
                                (el as HTMLInputElement | HTMLTextAreaElement)
                                  ?.selectionEnd ?? 0;
                              cursorPosRef.current[order.id] = {
                                start,
                                end,
                              };
                              setNotesDraft((m) => ({
                                ...m,
                                [order.id]: e.target.value,
                              }));
                              requestAnimationFrame(() => {
                                const el2 = inputRefs.current[order.id];
                                const pos = cursorPosRef.current[order.id];
                                if (el2 && pos) {
                                  try {
                                    el2.focus();
                                    el2.setSelectionRange(pos.start, pos.end);
                                  } catch {}
                                }
                              });
                            }}
                            placeholder="Nhập yêu cầu đổi món"
                            multiline
                            minRows={2}
                            inputRef={(el) => {
                              inputRefs.current[order.id] = el;
                            }}
                            onSelect={(e) => {
                              const target = e.target as
                                | HTMLInputElement
                                | HTMLTextAreaElement;
                              cursorPosRef.current[order.id] = {
                                start: target.selectionStart ?? 0,
                                end: target.selectionEnd ?? 0,
                              };
                            }}
                            sx={{
                              "& .MuiInputBase-input": { fontSize: "0.9rem" },
                            }}
                          />
                        ) : (
                          <>
                            {!isEmpty(order.changeFoodRequest) && (
                              <Stack
                                direction={{ xs: "row" }}
                                spacing={1}
                                alignItems="center"
                                sx={{
                                  border: "1px dashed",
                                  borderRadius: 3,
                                  p: 1,
                                  backgroundColor: "yellow",
                                }}
                              >
                                <FloatingWarningIcon color="error" />
                                <Typography>
                                  <b>Yêu cầu đổi món: </b>
                                  {order.changeFoodRequest || "—"}
                                </Typography>
                              </Stack>
                            )}
                          </>
                        )}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {Number(order.status) === EOrderStatus.NeedConfirmed && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Save />}
                          size="small"
                          onClick={() => saveNotes(order.id)}
                        >
                          Lưu yêu cầu đổi món
                        </Button>
                      )}
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
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "grey.100",
                          }}
                        >
                          {menuItemMap[it.menuItemId]?.imageUrl ? (
                            <Box
                              component="img"
                              src={menuItemMap[it.menuItemId]?.imageUrl}
                              alt={it.menuItemName}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <LocalDiningIcon color="action" />
                          )}
                        </Box>
                        <Typography
                          sx={{
                            flex: 1,
                            textDecoration:
                              it.status === EOrderStatus.Cancelled
                                ? "line-through"
                                : "none",
                          }}
                        >
                          {it.menuItemName} x {it.quantity}
                        </Typography>
                        {order.itemHistories &&
                          order.itemHistories.some(
                            (h) => h.newOrderItemId === it.id,
                          ) && <Chip label={`Món mới`} color="success" />}
                        <Chip label={`${it.unitPrice.toLocaleString()} đ`} />
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
                    {(() => {
                      const cs = Number(order.status);
                      const next = getNextOrderStatus(cs);
                      if (next === null) return null;
                      const label = getNextStatusLabel(cs);
                      const icon =
                        cs === EOrderStatus.Confirmed ? (
                          <SoupKitchenIcon />
                        ) : cs === EOrderStatus.InProgress ? (
                          <LocalDiningIcon />
                        ) : cs === EOrderStatus.Ready ? (
                          <DoneIcon />
                        ) : cs === EOrderStatus.Draft ? (
                          <Warning />
                        ) : cs === EOrderStatus.NeedConfirmed ? (
                          <Check />
                        ) : (
                          <DoneIcon />
                        );

                      if (
                        cs === EOrderStatus.Completed ||
                        cs === EOrderStatus.NeedConfirmed ||
                        cs === EOrderStatus.Cancelled
                      )
                        return null;
                      return (
                        <>
                          {cs === EOrderStatus.NeedConfirmed ? (
                            <Button
                              variant="contained"
                              color="warning"
                              startIcon={<Check />}
                              onClick={() => openConfirmDialog(order.id)}
                            >
                              Xác nhận đơn
                            </Button>
                          ) : cs !== EOrderStatus.Draft &&
                            cs !== EOrderStatus.Ready ? (
                            <Button
                              variant="contained"
                              startIcon={icon}
                              onClick={() => openStatusDialog(order.id)}
                            >
                              {label}
                            </Button>
                          ) : null}
                        </>
                      );
                    })()}
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
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
      </Box>

      {loading && <Alert severity="info">Đang tải...</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && (
        <Grid container spacing={2}>
          {/* <Column title="Mới đặt" items={grouped["Mới"]} /> */}
          <Column title="Chờ xác nhận" items={needConfirmedOrders} />
          <Column title="Đã xác nhận" items={confirmedOrders} />
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
                    : mi.name.toLowerCase().includes(search.toLowerCase()),
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

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Xác nhận đơn</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            {confirmTargetId && (
              <>
                <Typography>Order {confirmTargetId}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(detailsMap[confirmTargetId]?.createdAt).format(
                    "D/M/YYYY HH:mm",
                  )}
                </Typography>
                {detailsMap[confirmTargetId]?.notes && (
                  <Box
                    sx={{
                      p: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "grey.50",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {detailsMap[confirmTargetId]?.notes}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            variant="outlined"
            startIcon={<Close />}
          >
            Đóng
          </Button>
          <Button
            onClick={confirmOrder}
            variant="contained"
            startIcon={<Check />}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Xác nhận thay đổi trạng thái
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            {statusDialogTargetId && (
              <>
                <Stack
                  direction={"row"}
                  alignItems="center"
                  spacing={1}
                  sx={{
                    border: "1px dashed",
                    p: 1,
                    backgroundColor: "yellow",
                    borderRadius: 3,
                  }}
                >
                  <ArrowCircleRight color="action" />
                  <Typography variant="body2">
                    Trạng thái tiếp theo:{" "}
                    {getNextStatusLabel(
                      Number(detailsMap[statusDialogTargetId]?.status ?? 0),
                    )}
                  </Typography>
                </Stack>
                {detailsMap[statusDialogTargetId]?.notes && (
                  <Box
                    sx={{
                      p: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "grey.50",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {detailsMap[statusDialogTargetId]?.notes}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusDialogOpen(false)}
            color="inherit"
            variant="outlined"
            startIcon={<Close />}
          >
            Đóng
          </Button>
          <Button
            onClick={confirmStatusChange}
            variant="contained"
            startIcon={<Check />}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
