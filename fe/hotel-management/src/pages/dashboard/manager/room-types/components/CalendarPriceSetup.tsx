import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box, Button, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import SetPriceDialog from "./SetPriceDialog";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import viLocale from "@fullcalendar/core/locales/vi";

type PriceMap = Record<string, number>;

export interface CalendarPriceSetupProps {
  value?: PriceMap;
  onChangePriceMap?: (map: PriceMap) => void;
}

const toKey = (d: Date) => dayjs(d).format("YYYY-MM-DD");

const CalendarPriceSetup: React.FC<CalendarPriceSetupProps> = ({
  value,
  onChangePriceMap,
}) => {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [priceMap, setPriceMap] = useState<PriceMap>({});
  const [singleDate, setSingleDate] = useState<Dayjs | null>(dayjs());
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
    let next: PriceMap = {};
    setPriceMap((prev) => {
      next = { ...prev };
      selectedDates.forEach((k) => {
        next[k] = price;
      });
      return next;
    });
    setDialogOpen(false);
    if (onChangePriceMap) onChangePriceMap(next);
  };

  React.useEffect(() => {
    if (value) {
      setPriceMap(value);
    }
  }, [value]);

  const selectedCount = selectedDates.size;
  const handleClearSelection = () => setSelectedDates(new Set());
  const handleAddSingleDate = () => {
    if (!singleDate) return;
    const key = singleDate.format("YYYY-MM-DD");
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

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
        <Stack direction="row" spacing={1}>
          <DatePicker
            value={singleDate}
            onChange={(v) => setSingleDate(v)}
            slotProps={{ textField: { size: "small" } } as any}
          />
          <Button size="small" variant="outlined" onClick={handleAddSingleDate}>
            Thêm
          </Button>
          {selectedCount > 0 && (
            <>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClearSelection}
              >
                Xóa chọn
              </Button>
              <Button variant="contained" onClick={handleOpenDialog}>
                Cài đặt giá chung ({selectedCount})
              </Button>
            </>
          )}
        </Stack>
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
          "& .fc-daygrid-day.selected-date": {
            backgroundColor: "transparent",
          },
          "& .fc-daygrid-day.selected-date .fc-daygrid-day-number": {
            border: (theme) => `2px solid ${theme.palette.primary.main}`,
            borderRadius: 12,
            padding: "2px 6px",
            lineHeight: 1.2,
            display: "inline-block",
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
          selectMirror={false}
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
