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
import type { DatesSetArg } from "@fullcalendar/core/index.js";

type PriceMap = Record<string, number>;

export interface CalendarPriceSetupProps {
  value?: PriceMap;
  onChangePriceMap?: (map: PriceMap) => void;
  roomTypeId?: string;
}

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
  const [viewStart, setViewStart] = useState<Date | null>(null);
  const [viewEnd, setViewEnd] = useState<Date | null>(null);
  const [roomTypeBase, setRoomTypeBase] = useState<{
    priceFrom: number;
    priceTo: number;
  } | null>(null);
  const [eventsState, setEventsState] = useState<any[]>([]);

  const rebuildEventsForMonth = (startDate: Date, endDate: Date) => {
    if (!roomTypeBase) {
      setEventsState([]);
      return;
    }
    console.log("render");
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const evs: any[] = [];
    for (
      let d = start;
      d.isBefore(end) || d.isSame(end, "day");
      d = d.add(1, "day")
    ) {
      const dateStr = d.format("YYYY-MM-DD");
      const weekend = d.day() === 5 || d.day() === 6;
      const base = weekend
        ? roomTypeBase.priceTo || 0
        : roomTypeBase.priceFrom || 0;
      const hasSet = priceMap[dateStr] !== undefined;
      const price = hasSet ? priceMap[dateStr] : base;
      evs.push({
        id: dateStr,
        start: dateStr,
        allDay: true,
        title: `₫${Number(price).toLocaleString("vi-VN")}`,
        className: `price-event ${weekend ? "weekend" : "weekday"} ${
          hasSet && Number(price) !== Number(base) ? "override" : ""
        }`,
      });
    }
    setEventsState(evs);
  };

  const handleSelectDate = (arg: any) => {
    const key = arg.format("YYYY-MM-DD");
    if (dayjs(key).isBefore(dayjs().startOf("day"))) return;
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
      const k = d.format("YYYY-MM-DD");
      if (dayjs(k).isBefore(dayjs().startOf("day"))) continue;
      keys.push(k);
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
      Array.from(selectedDates).forEach((k) => {
        if (!dayjs(k).isBefore(dayjs().startOf("day"))) {
          next[k] = price;
        }
      });
      return next;
    });
    setDialogOpen(false);
    if (onChangePriceMap) onChangePriceMap(next);
    setSelectedDates(new Set());
    if (viewStart && viewEnd) {
      setEventsState((prev) => {
        const map = new Map(prev.map((e) => [e.id, e]));
        Array.from(Object.keys(next)).forEach((k) => {
          const ev = map.get(k);
          const dow = dayjs(k).day();
          const weekend = dow === 5 || dow === 6;
          const p = next[k];
          const updated = {
            id: k,
            start: k,
            allDay: true,
            title: `₫${Number(p).toLocaleString("vi-VN")}`,
            className: `price-event ${weekend ? "weekend" : "weekday"} ${
              roomTypeBase
                ? Number(p) !==
                  Number(
                    weekend
                      ? roomTypeBase.priceTo || 0
                      : roomTypeBase.priceFrom || 0
                  )
                  ? "override"
                  : ""
                : ""
            }`,
          };
          if (ev) map.set(k, updated);
        });
        return Array.from(map.values());
      });
    }
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
    if (viewStart && viewEnd && roomTypeBase) {
      setEventsState((prev) => {
        const map = new Map(prev.map((e) => [e.id, e]));
        selectedDates.forEach((k) => {
          const dow = dayjs(k).day();
          const weekend = dow === 5 || dow === 6;
          const p = weekend
            ? roomTypeBase.priceTo || 0
            : roomTypeBase.priceFrom || 0;
          const updated = {
            id: k,
            start: k,
            allDay: true,
            title: `₫${Number(p).toLocaleString("vi-VN")}`,
            className: `price-event ${weekend ? "weekend" : "weekday"}`,
          };
          if (map.has(k)) map.set(k, updated);
        });
        return Array.from(map.values());
      });
    }
  };

  React.useEffect(() => {
    if (value) {
      setPriceMap(value);
    }
  }, [value]);
  React.useEffect(() => {
    const loadRoomType = async () => {
      if (!roomTypeId) {
        setRoomTypeBase(null);
        return;
      }
      try {
        const res = await roomTypesApi.getRoomTypeById(roomTypeId);
        const rt = (res as any).data || res.data;
        setRoomTypeBase({
          priceFrom: rt?.priceFrom ?? 0,
          priceTo: rt?.priceTo ?? 0,
        });
      } catch {
        setRoomTypeBase(null);
      }
    };
    loadRoomType();
  }, [roomTypeId]);
  React.useEffect(() => {
    if (viewStart && viewEnd && roomTypeBase && monthKey) {
      rebuildEventsForMonth(viewStart, viewEnd);
    }
  }, [monthKey, roomTypeBase]);

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
          "& .fc .price-event.weekend": {
            backgroundColor: (theme) => theme.palette.secondary.light,
          },
          "& .fc .price-event.override": {
            backgroundColor: (theme) => theme.palette.warning.light,
            color: (theme) => theme.palette.warning.contrastText,
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
          events={eventsState}
          dateClick={handleSelectDate}
          select={handleSelectRange}
          selectAllow={(info: any) => {
            const startOk = !dayjs(info.start).isBefore(dayjs().startOf("day"));
            const endInclusive = dayjs(info.end).subtract(1, "day");
            const endOk = !endInclusive.isBefore(dayjs().startOf("day"));
            return startOk && endOk;
          }}
          datesSet={async (arg: DatesSetArg) => {
            const currentStart = dayjs(arg.view.currentStart);
            const month = currentStart.format("YYYY-MM");
            if (!hotelId) {
              setPeakDates(new Set());
              return;
            }
            if (monthKey !== month) {
              setMonthKey(month);
            }
            const activeStart = dayjs(arg.view.activeStart);
            const activeEnd = dayjs(arg.view.activeEnd).subtract(1, "day");
            const startChanged =
              !viewStart || !dayjs(viewStart).isSame(activeStart, "day");
            const endChanged =
              !viewEnd || !dayjs(viewEnd).isSame(activeEnd, "day");
            if (startChanged && endChanged) {
              setViewStart(activeStart.toDate());
              setViewEnd(activeEnd.toDate());
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
              if (dayjs(key).isBefore(dayjs().startOf("day")))
                classes.push("disabled-date");
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
