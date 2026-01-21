import {
  AccessTime,
  ChatBubble,
  Check,
  ExpandMore,
  Lightbulb,
  Phone,
  Save,
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
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { isEmpty } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { type BookingDetailsDto } from "../../../../../api/bookingsApi";
import { type MenuItemDto } from "../../../../../api/menusApi";
import {
  EOrderStatus,
  type OrderDetailsDto,
} from "../../../../../api/ordersApi";
import FloatingWarningIcon from "../../../../../components/common/FloatingWarningIcon";

export default function KitchenOrderAccordion({
  order,
  booking,
  menuItemMap,
  expanded,
  onToggle,
  ingredientNote,
  openConfirmDialog,
  openStatusDialog,
  onSaveNote,
}: {
  order: OrderDetailsDto;
  booking?: BookingDetailsDto;
  menuItemMap: Record<string, MenuItemDto>;
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
  ingredientNote: string;
  openConfirmDialog: (orderId: string) => void;
  openStatusDialog: (orderId: string) => void;
  onSaveNote: (orderId: string, text: string, needConfirm: boolean) => void;
}) {
  const [note, setNote] = useState<string>(order.changeFoodRequest || "");
  const [markNeedConfirm, setMarkNeedConfirm] = useState<boolean>(false);

  useEffect(() => {
    setNote(order.changeFoodRequest || "");
  }, [order.id, order.changeFoodRequest]);

  const room = booking?.bookingRoomTypes?.[0]?.bookingRooms?.[0]?.roomName;
  const guestCount = useMemo(
    () =>
      (booking?.bookingRoomTypes || [])
        .flatMap((brt) => brt.bookingRooms || [])
        .reduce((sum, br) => sum + (br.guests?.length || 0), 0),
    [booking],
  );

  const getOrderPhase = (status: number): string => {
    if (status === EOrderStatus.Draft) return "Mới";
    if (status === EOrderStatus.NeedConfirmed) return "Chờ xác nhận";
    if (status === EOrderStatus.Confirmed) return "Đã xác nhận";
    if (status === EOrderStatus.InProgress) return "Đang nấu";
    if (status === EOrderStatus.Ready) return "Sẵn sàng";
    if (status === EOrderStatus.Completed) return "Đã phục vụ";
    return "Mới";
  };

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

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  return (
    <Accordion
      key={order.id}
      sx={{
        borderRadius: 2,
        "&:not(.Mui-expanded)::before": { display: "none" },
      }}
      disableGutters
      expanded={expanded}
      onChange={(_, isExpanded) => onToggle(isExpanded)}
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
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2">
                    {order.servingDate
                      ? new Date(order.servingDate).toLocaleString("vi-VN")
                      : "—"}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Họ và tên: {order.customerName}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">
                    SĐT: {order.customerPhone}
                  </Typography>
                </Stack>
                {(guestCount || order.guests) && (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Số khách: {guestCount || order.guests}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" spacing={0.75} alignItems="center">
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
                  {Number(order.status) === EOrderStatus.NeedConfirmed && (
                    <Stack direction="row" spacing={0.75} alignItems="center">
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
                          setNote(ingredientNote);
                          setMarkNeedConfirm(true);
                          const el = inputRef.current;
                          requestAnimationFrame(() => {
                            if (el) {
                              el.focus();
                              const len =
                                (el as HTMLInputElement).value?.length ??
                                (el as HTMLTextAreaElement).value?.length ??
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
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                    }}
                    onBlur={() => {
                      setMarkNeedConfirm(true);
                    }}
                    placeholder="Nhập yêu cầu đổi món"
                    multiline
                    minRows={2}
                    inputRef={(el) => {
                      inputRef.current = el;
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
                  onClick={() => onSaveNote(order.id, note, markNeedConfirm)}
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
            <Chip label={`Tổng: ${order.itemsTotal.toLocaleString()} đ`} />
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
                  ) : cs !== EOrderStatus.Draft && cs !== EOrderStatus.Ready ? (
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
}
