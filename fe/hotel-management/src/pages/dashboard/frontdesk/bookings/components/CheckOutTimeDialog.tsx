import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

type Props = {
  open: boolean;
  scheduledEnd: string;
  scheduledStart?: string;
  defaultCheckInTime?: string | null;
  defaultCheckOutTime?: string | null;
  onClose: () => void;
  onConfirm: (
    selectedIso: string,
    info: { isLate: boolean; days: number; hours: number; minutes: number }
  ) => void;
};

export default function CheckOutTimeDialog({
  open,
  scheduledEnd,
  scheduledStart,
  defaultCheckInTime,
  defaultCheckOutTime,
  onClose,
  onConfirm,
}: Props) {
  const [value, setValue] = useState<Dayjs>(dayjs());

  const scheduled = useMemo(() => dayjs(scheduledEnd), [scheduledEnd]);

  const displayScheduledStart = useMemo(() => {
    if (!scheduledStart) return null as Dayjs | null;
    const base = dayjs(scheduledStart);
    const def = defaultCheckInTime ? dayjs(defaultCheckInTime) : null;
    if (def && base.isValid() && def.isValid()) {
      return base
        .hour(def.hour())
        .minute(def.minute())
        .second(0)
        .millisecond(0);
    }
    return base;
  }, [scheduledStart, defaultCheckInTime]);

  const displayScheduledEnd = useMemo(() => {
    const base = dayjs(scheduledEnd);
    const def = defaultCheckOutTime ? dayjs(defaultCheckOutTime) : null;
    if (def && base.isValid() && def.isValid()) {
      return base
        .hour(def.hour())
        .minute(def.minute())
        .second(0)
        .millisecond(0);
    }
    return base;
  }, [scheduledEnd, defaultCheckOutTime]);
  useEffect(() => {
    if (open) setValue(displayScheduledEnd || dayjs());
  }, [open, displayScheduledEnd]);

  const { isLate, days, hours, minutes } = useMemo(() => {
    const base = displayScheduledEnd || scheduled;
    const late = value.isAfter(base);
    const diff = Math.abs(value.diff(base, "minute"));
    const d = Math.floor(diff / 1440);
    const h = Math.floor((diff % 1440) / 60);
    const m = diff % 60;
    return { isLate: late, days: d, hours: h, minutes: m };
  }, [value, scheduled, displayScheduledEnd]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chọn thời gian Check-out</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {scheduledStart ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={700}>
                Dự kiến nhận phòng:
              </Typography>
              <Chip
                label={(displayScheduledStart || dayjs(scheduledStart)).format(
                  "DD/MM/YYYY HH:mm"
                )}
              />
            </Stack>
          ) : null}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              Dự kiến trả phòng:
            </Typography>
            <Chip label={displayScheduledEnd.format("DD/MM/YYYY HH:mm")} />
          </Stack>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Thời gian check-out"
              value={value}
              minDate={dayjs(scheduledStart)}
              onChange={(v) => v && setValue(v)}
            />
          </LocalizationProvider>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              color={isLate ? "warning" : "success"}
              label={
                isLate ? `Muộn ${days}d ${hours}h ${minutes}m` : `Đúng giờ`
              }
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() =>
            onConfirm(value.toISOString(), { isLate, days, hours, minutes })
          }
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
