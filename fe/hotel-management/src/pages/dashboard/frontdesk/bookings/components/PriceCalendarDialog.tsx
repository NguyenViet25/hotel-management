import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import dayjs from "dayjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import pricingApi, {
  type PricingQuoteResponse,
} from "../../../../../api/pricingApi";
import { type BookingRoomTypeDto } from "../../../../../api/bookingsApi";
import roomTypesApi from "../../../../../api/roomTypesApi";

type Props = {
  open: boolean;
  onClose: () => void;
  roomType: BookingRoomTypeDto | null;
};

const PriceCalendarDialog: React.FC<Props> = ({ open, onClose, roomType }) => {
  const [quote, setQuote] = useState<PricingQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!open || !roomType) return;
      setLoading(true);
      try {
        const [res, rtRes] = await Promise.all([
          pricingApi.quote({
            roomTypeId: roomType.roomTypeId,
            checkInDate: dayjs(roomType.startDate).format("YYYY-MM-DD"),
            checkOutDate: dayjs(roomType.endDate).format("YYYY-MM-DD"),
          }),
          roomTypesApi.getRoomTypeById(roomType.roomTypeId),
        ]);

        const rawQuote: PricingQuoteResponse | null =
          ((res as any).data || (res as any).data?.data || res.data) ?? null;
        const rt = ((rtRes as any).data ||
          (rtRes as any).data?.data ||
          rtRes.data) as any;

        const overrides = (rt?.priceByDates || []).map((d: any) =>
          dayjs(d.date).format("YYYY-MM-DD")
        );
        const overrideSet = new Set(overrides);
        const inputPrice = roomType.price || rt?.priceFrom || 0;

        const start = roomType.startDate ? dayjs(roomType.startDate) : null;
        const end = roomType.endDate ? dayjs(roomType.endDate) : null;

        let items =
          rawQuote?.items && rawQuote.items.length ? rawQuote.items : [];
        if (
          (!items || items.length === 0) &&
          start &&
          end &&
          start.isBefore(end)
        ) {
          const temp: { date: string; price: number }[] = [];
          let cursor = start.clone();
          while (cursor.isBefore(end)) {
            const dateStr = cursor.format("YYYY-MM-DD");
            const overridePrice = rt?.priceByDates?.find(
              (p: any) => dayjs(p.date).format("YYYY-MM-DD") === dateStr
            )?.price;
            temp.push({
              date: dateStr,
              price: overridePrice ?? inputPrice,
            });
            cursor = cursor.add(1, "day");
          }
          items = temp as any;
        } else {
          items = items.map((it: any) => {
            const d = dayjs(it.date).format("YYYY-MM-DD");
            const isOverride = overrideSet.has(d);
            return {
              ...it,
              price: isOverride ? it.price : inputPrice,
            };
          });
        }

        const total = items.reduce(
          (s: number, it: any) => s + (it.price || 0),
          0
        );
        setQuote({ items, total });
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [open, roomType]);

  const totalRooms =
    (roomType?.totalRoom as number) ||
    (roomType?.bookingRooms?.length as number) ||
    1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Giá theo ngày{" "}
        {roomType?.roomTypeName ? `- ${roomType.roomTypeName}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Typography>Đang tải...</Typography>
        ) : quote?.items?.length ? (
          <Stack spacing={2}>
            <Box
              sx={{
                "& .fc .price-event": {
                  backgroundColor: (theme) => theme.palette.primary.light,
                  border: "none",
                  color: (theme) => theme.palette.primary.contrastText,
                  padding: "2px 6px",
                  borderRadius: 12,
                  fontSize: "0.75rem",
                  display: "inline-block",
                  marginTop: "2px",
                },
              }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                locales={[viLocale]}
                locale="vi"
                initialView="dayGridMonth"
                initialDate={
                  roomType?.startDate
                    ? dayjs(roomType.startDate).toDate()
                    : undefined
                }
                selectable={false}
                dayMaxEvents
                events={(quote.items || []).map((it) => ({
                  id: it.date,
                  start: it.date,
                  allDay: true,
                  title: `₫${(it.price || 0).toLocaleString("vi-VN")}`,
                  className: "price-event",
                }))}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "",
                }}
                height="auto"
              />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Bảng giá theo ngày
              </Typography>
              <Stack spacing={0.5}>
                {(quote.items || []).map((it, i) => {
                  const price = it.price || 0;
                  const prev = i > 0 ? quote!.items[i - 1].price || 0 : price;
                  const changed = price !== prev;
                  return (
                    <Stack
                      key={`${it.date}-${i}`}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(it.date).format("DD/MM/YYYY")}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: changed ? "warning.main" : "text.primary",
                          fontWeight: changed ? 700 : 500,
                        }}
                      >
                        {new Intl.NumberFormat("vi-VN").format(price)} đ{" "}
                        {totalRooms > 1
                          ? `× ${totalRooms} phòng = ${new Intl.NumberFormat(
                              "vi-VN"
                            ).format(price * totalRooms)} đ`
                          : ""}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
              <Typography textAlign="end" fontWeight="bold" variant="body2">
                Tổng:{" "}
                {new Intl.NumberFormat("vi-VN").format(
                  (quote.total || 0) * totalRooms
                )}{" "}
                đ
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Typography color="text.secondary">Không có dữ liệu</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PriceCalendarDialog;
