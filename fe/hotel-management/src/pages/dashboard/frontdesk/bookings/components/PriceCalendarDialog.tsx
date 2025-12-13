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
import pricingApi, { type PricingQuoteResponse } from "../../../../../api/pricingApi";
import { type BookingRoomTypeDto } from "../../../../../api/bookingsApi";

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
        const res = await pricingApi.quote({
          roomTypeId: roomType.roomTypeId,
          checkInDate: dayjs(roomType.startDate).format("YYYY-MM-DD"),
          checkOutDate: dayjs(roomType.endDate).format("YYYY-MM-DD"),
        });
        setQuote((res as any).data || res.data || null);
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Giá theo ngày {roomType?.roomTypeName ? `- ${roomType.roomTypeName}` : ""}
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
                  roomType?.startDate ? dayjs(roomType.startDate).toDate() : undefined
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
                        {new Intl.NumberFormat("vi-VN").format(price)} đ
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
