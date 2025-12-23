import viLocale from "@fullcalendar/core/locales/vi";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import {
  Box,
  Button,
  FormControlLabel,
  Popover,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import roomsApi, { isPeakUsageDay } from "../../../../../api/roomsApi";
import { useStore } from "../../../../../hooks/useStore";
import roomTypesApi, {
  type RoomTypePriceHistoryItem,
} from "../../../../../api/roomTypesApi";
import SetPriceDialog from "./SetPriceDialog";

type PriceMap = Record<string, number>;

export interface CalendarPriceSetupProps {
  value?: PriceMap;
  onChangePriceMap?: (map: PriceMap) => void;
  roomTypeId?: string;
}

const toKey = (d: Date) => dayjs(d).format("YYYY-MM-DD");

const CalendarPriceSetup: React.FC<CalendarPriceSetupProps> = ({
  value,
  onChangePriceMap,
  roomTypeId,
}) => {
  const { hotelId } = useStore();
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [priceMap, setPriceMap] = useState<PriceMap>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hoverHistoryMode, setHoverHistoryMode] = useState(false);
  const [hoverAnchorEl, setHoverAnchorEl] = useState<HTMLElement | null>(null);
  const [hoverDateStr, setHoverDateStr] = useState<string | null>(null);
  const [hoverLoading, setHoverLoading] = useState(false);
  const [hoverLastYearLatest, setHoverLastYearLatest] =
    useState<RoomTypePriceHistoryItem | null>(null);
  const [hoverCurrentYearList, setHoverCurrentYearList] = useState<
    RoomTypePriceHistoryItem[]
  >([]);
  const [historyCache, setHistoryCache] = useState<
    Record<
      string,
      {
        lastYearLatest: RoomTypePriceHistoryItem | null;
        currentYearList: RoomTypePriceHistoryItem[];
      }
    >
  >({});
  const [hoverOnPopover, setHoverOnPopover] = useState(false);
  const [peakDates, setPeakDates] = useState<Set<string>>(new Set());
  const [monthKey, setMonthKey] = useState<string | null>(null);

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

  const handleSelectDate = (arg: any) => {
    const key = arg.format("YYYY-MM-DD");
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
    setSelectedDates(new Set());
  };

  const handleClearPrices = () => {
    let next: PriceMap = {};
    setPriceMap((prev) => {
      next = { ...prev };
      selectedDates.forEach((k) => {
        delete next[k];
      });
      return next;
    });
    if (onChangePriceMap) onChangePriceMap(next);
    setSelectedDates(new Set());
  };

  React.useEffect(() => {
    if (value) {
      setPriceMap(value);
    }
  }, [value]);
  React.useEffect(() => {
    const load = async () => {
      if (!hotelId || !monthKey) {
        setPeakDates(new Set());
        return;
      }
      try {
        const res = await roomsApi.getRoomsUsageSummaryByMonth(
          Number(monthKey.split("-")[1]),
          Number(monthKey.split("-")[0])
        );
        const list = ((res as any).data || res.data) ?? [];
        const set = new Set<string>();
        for (const it of list) {
          const dateStr = dayjs(it.date).format("YYYY-MM-DD");
          const peak = isPeakUsageDay({
            date: dateStr,
            totalRooms: it.totalRooms,
            bookedRooms: it.bookedRooms,
            percentage: it.percentage,
          });
          if (peak) set.add(dateStr);
        }
        setPeakDates(set);
      } catch {
        setPeakDates(new Set());
      }
    };
    load();
  }, [hotelId, monthKey]);

  const selectedCount = selectedDates.size;
  const handleClearSelection = () => setSelectedDates(new Set());

  const openHoverHistory = async (date: Date, anchorEl: HTMLElement) => {
    if (!hoverHistoryMode) return;
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    setHoverAnchorEl(anchorEl);
    setHoverDateStr(dateStr);
    if (!roomTypeId) {
      setHoverLastYearLatest(null);
      setHoverCurrentYearList([]);
      setHoverLoading(false);
      return;
    }
    const cached = historyCache[dateStr];
    if (cached) {
      setHoverLastYearLatest(cached.lastYearLatest);
      setHoverCurrentYearList(cached.currentYearList);
      return;
    }
    setHoverLoading(true);
    try {
      const curYear = dayjs(date).year();
      const lastYear = curYear - 1;
      const from = dayjs(`${lastYear}-01-01`).format("YYYY-MM-DD");
      const to = dayjs(`${curYear}-12-31`).format("YYYY-MM-DD");
      const res = await roomTypesApi.getPriceHistory(roomTypeId, from, to);
      const all =
        ((res as any).data || (res as any).data?.data || res.data) ?? [];
      const lastYearDateStr = dayjs(date).year(lastYear).format("YYYY-MM-DD");
      const lastYearItems = all.filter(
        (it: RoomTypePriceHistoryItem) =>
          dayjs(it.date).format("YYYY-MM-DD") === lastYearDateStr
      );
      const latestLastYear =
        lastYearItems
          .slice()
          .sort(
            (a: RoomTypePriceHistoryItem, b: RoomTypePriceHistoryItem) =>
              dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf()
          )[0] || null;
      const curYearItems = all
        .filter(
          (it: RoomTypePriceHistoryItem) =>
            dayjs(it.date).format("YYYY-MM-DD") === dateStr
        )
        .slice()
        .sort(
          (a: RoomTypePriceHistoryItem, b: RoomTypePriceHistoryItem) =>
            dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf()
        );
      setHoverLastYearLatest(latestLastYear);
      setHoverCurrentYearList(curYearItems);
      setHistoryCache((prev) => ({
        ...prev,
        [dateStr]: {
          lastYearLatest: latestLastYear,
          currentYearList: curYearItems,
        },
      }));
    } finally {
      setHoverLoading(false);
    }
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
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={hoverHistoryMode}
                onChange={(e) => setHoverHistoryMode(e.target.checked)}
              />
            }
            label="Xem lịch sử giá"
          />
          {selectedCount > 0 && (
            <>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClearSelection}
              >
                Xóa chọn
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleClearPrices}
              >
                Xóa giá
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
          "& .fc-daygrid-day.peak-date ": {
            backgroundColor: (theme) => theme.palette.error.light,
          },
          "& .fc-daygrid-day.peak-date .fc-daygrid-day-number": {
            fontWeight: 700,
            color: "white",
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
          locales={[viLocale]}
          locale="vi"
          initialView="dayGridMonth"
          selectable
          selectMirror={false}
          dayMaxEvents
          events={events}
          dateClick={handleSelectDate}
          select={handleSelectRange}
          datesSet={async (arg: any) => {
            const start = dayjs(arg.start);
            const month = start.format("YYYY-MM");
            if (!hotelId) {
              setPeakDates(new Set());
              return;
            }
            if (monthKey !== month) {
              setMonthKey(month);
            }
          }}
          dayCellDidMount={(info: any) => {
            info.el.addEventListener("mouseenter", () => {
              if (hoverHistoryMode)
                openHoverHistory(info.date, info.el as HTMLElement);
            });
            info.el.addEventListener("mouseleave", () => {
              setTimeout(() => {
                if (!hoverOnPopover) {
                  setHoverAnchorEl(null);
                  setHoverDateStr(null);
                  setHoverLoading(false);
                }
              }, 150);
            });
          }}
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
            (() => {
              const key = dayjs(arg.date).format("YYYY-MM-DD");
              const classes: string[] = [];
              if (selectedDates.has(key)) classes.push("selected-date");
              if (peakDates.has(key)) classes.push("peak-date");
              return classes;
            })()
          }
          height="auto"
        />
      </Box>

      <SetPriceDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmPrice}
      />
      <Popover
        open={hoverHistoryMode && !!hoverAnchorEl}
        anchorEl={hoverAnchorEl}
        onClose={() => setHoverAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box
          sx={{ p: 1.5, maxWidth: 320 }}
          onMouseEnter={() => setHoverOnPopover(true)}
          onMouseLeave={() => {
            setHoverOnPopover(false);
            setHoverAnchorEl(null);
            setHoverDateStr(null);
            setHoverLoading(false);
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">
              {hoverDateStr ? dayjs(hoverDateStr).format("DD/MM/YYYY") : ""}
            </Typography>
            {hoverLoading ? (
              <Typography color="text.secondary">Đang tải...</Typography>
            ) : (
              <>
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={700}>
                    Năm trước
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hoverLastYearLatest
                      ? `₫${(hoverLastYearLatest.price || 0).toLocaleString(
                          "vi-VN"
                        )} • ${dayjs(hoverLastYearLatest.updatedAt).format(
                          "DD/MM/YYYY HH:mm"
                        )}`
                      : "Không có dữ liệu"}
                  </Typography>
                </Stack>
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={700}>
                    Năm hiện tại
                  </Typography>
                  {hoverCurrentYearList.length ? (
                    <Stack spacing={0.25}>
                      {hoverCurrentYearList.map((h) => (
                        <Stack
                          key={h.id}
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography variant="body2" color="text.secondary">
                            ₫{(h.price || 0).toLocaleString("vi-VN")}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(h.updatedAt).format("DD/MM/YYYY HH:mm")}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

export default CalendarPriceSetup;
