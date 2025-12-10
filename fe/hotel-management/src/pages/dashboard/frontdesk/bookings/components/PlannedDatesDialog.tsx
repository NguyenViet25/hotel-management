import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  initialStart: string;
  initialEnd: string;
  minStart?: string;
  maxEnd?: string;
  onClose: () => void;
  onConfirm: (startIso: string, endIso: string) => void;
};

export default function PlannedDatesDialog({
  open,
  initialStart,
  initialEnd,
  minStart,
  maxEnd,
  onClose,
  onConfirm,
}: Props) {
  const [start, setStart] = useState<Dayjs>(dayjs(initialStart));
  const [end, setEnd] = useState<Dayjs>(dayjs(initialEnd));
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setStart(dayjs(initialStart));
      setEnd(dayjs(initialEnd));
      setError("");
    }
  }, [open, initialStart, initialEnd]);

  const constraints = useMemo(
    () => ({
      min: minStart ? dayjs(minStart) : undefined,
      max: maxEnd ? dayjs(maxEnd) : undefined,
    }),
    [minStart, maxEnd]
  );

  useEffect(() => {
    const errs: string[] = [];
    if (!start.isValid() || !end.isValid()) errs.push("Thời gian không hợp lệ");
    if (end.isBefore(start))
      errs.push("Thời gian trả phòng phải sau thời gian nhận phòng");

    setError(errs.join(". "));
  }, [start, end, constraints.min, constraints.max]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật thời gian dự kiến</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <DateTimePicker
            label="Thời gian nhận phòng (dự kiến)"
            value={start}
            onChange={(v) => v && setStart(v)}
          />
          <DateTimePicker
            label="Thời gian trả phòng (dự kiến)"
            value={end}
            onChange={(v) => v && setEnd(v)}
          />
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() =>
            onConfirm(
              start.format("YYYY-MM-DDTHH:mm:ss"),
              end.format("YYYY-MM-DDTHH:mm:ss")
            )
          }
          disabled={!!error}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
