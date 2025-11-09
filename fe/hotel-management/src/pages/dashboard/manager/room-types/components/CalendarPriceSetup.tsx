import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Button, Stack, Typography } from "@mui/material";
import SetPriceDialog from "./SetPriceDialog";
import dayjs from "dayjs";
import viLocale from "@fullcalendar/core/locales/vi";

type PriceMap = Record<string, number>;

export interface CalendarPriceSetupProps {
  // Optional callback to expose selected prices to parent if needed in future
  onChangePriceMap?: (map: PriceMap) => void;
}

const toKey = (d: Date) => dayjs(d).format("YYYY-MM-DD");

const CalendarPriceSetup: React.FC<CalendarPriceSetupProps> = ({
  onChangePriceMap,
}) => {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [priceMap, setPriceMap] = useState<PriceMap>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const events: any[] = useMemo(
    () =>
      Object.entries(priceMap).map(([date, price]) => ({
        id: date,
        start: date,
        allDay: true,
        title: `₫${price.toLocaleString("vi-VN")}`,
        className: "price-event",
      })),
    [priceMap]
  );

  const handleDateClick = (arg: any) => {
    const key = arg.dateStr; // already in YYYY-MM-DD
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSelectRange = (arg: any) => {
    const start = dayjs(arg.start);
    // In FullCalendar, end for all-day is exclusive; include end - 1 day
    const endInclusive = dayjs(arg.end).subtract(1, "day");
    const keys: string[] = [];
    for (
      let d = start;
      d.isBefore(endInclusive) || d.isSame(endInclusive, "day");
      d = d.add(1, "day")
    ) {
      keys.push(d.format("YYYY-MM-DD"));
    }
    setSelectedDates((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.add(k));
      return next;
    });
  };

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const handleConfirmPrice = (price: number) => {
    setPriceMap((prev) => {
      const next: PriceMap = { ...prev };
      selectedDates.forEach((k) => {
        next[k] = price;
      });
      return next;
    });
    setDialogOpen(false);
    if (onChangePriceMap) onChangePriceMap(priceMap);
  };

  const selectedCount = selectedDates.size;

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Chọn các ngày để cài đặt giá
        </Typography>
        {selectedCount > 0 && (
          <Button variant="contained" onClick={handleOpenDialog}>
            Cài đặt giá chung ({selectedCount})
          </Button>
        )}
      </Stack>

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
          "& .fc-daygrid-day": {
            cursor: "pointer",
          },
          "& .fc-daygrid-day.fc-day-today": {
            backgroundColor: (theme) => theme.palette.action.hover,
          },
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          locales={[viLocale]} // <-- Add all locale definitions here
          locale="vi" // <-- Force Vietnamese
          initialView="dayGridMonth"
          selectable
          selectMirror
          dayMaxEvents
          events={events}
          dateClick={handleDateClick}
          select={handleSelectRange}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          buttonText={{
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            list: "Danh sách",
          }}
          allDayText="Cả ngày"
          noEventsText="Không có sự kiện để hiển thị"
          moreLinkText={(n) => `+${n} thêm`}
          dayCellClassNames={(arg) =>
            selectedDates.has(dayjs(arg.date).format("YYYY-MM-DD"))
              ? ["selected-date"]
              : []
          }
          height="auto"
        />
      </Box>

      <SetPriceDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmPrice}
      />
    </Box>
  );
};

export default CalendarPriceSetup;
