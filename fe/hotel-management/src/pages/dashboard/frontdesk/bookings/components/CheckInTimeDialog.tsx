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
  scheduledStart: string;
  scheduledEnd?: string;
  onClose: () => void;
  onConfirm: (
    selectedIso: string,
    info: { isEarly: boolean; days: number; hours: number; minutes: number }
  ) => void;
};

export default function CheckInTimeDialog({
  open,
  scheduledStart,
  scheduledEnd,
  onClose,
  onConfirm,
}: Props) {
  const [value, setValue] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (open) setValue(dayjs());
  }, [open]);

  const scheduled = useMemo(() => dayjs(scheduledStart), [scheduledStart]);

  const { isEarly, days, hours, minutes } = useMemo(() => {
    const early = value.isBefore(scheduled);
    const diff = Math.abs(value.diff(scheduled, "minute"));
    const d = Math.floor(diff / 1440);
    const h = Math.floor((diff % 1440) / 60);
    const m = diff % 60;
    return { isEarly: early, days: d, hours: h, minutes: m };
  }, [value, scheduled]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chọn thời gian Check-in</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              Dự kiến nhận phòng:
            </Typography>
            <Chip label={dayjs(scheduledStart).format("DD/MM/YYYY HH:mm")} />
          </Stack>
          {scheduledEnd ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={700}>
                Dự kiến trả phòng:
              </Typography>
              <Chip label={dayjs(scheduledEnd).format("DD/MM/YYYY HH:mm")} />
            </Stack>
          ) : null}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Thời gian check-in"
              value={value}
              maxDate={dayjs(scheduledEnd)}
              onChange={(v) => v && setValue(v)}
            />
          </LocalizationProvider>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              color={isEarly ? "warning" : "success"}
              label={
                isEarly ? `Sớm ${days}d ${hours}h ${minutes}m` : `Đúng giờ`
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
            onConfirm(value.toISOString(), { isEarly, days, hours, minutes })
          }
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
