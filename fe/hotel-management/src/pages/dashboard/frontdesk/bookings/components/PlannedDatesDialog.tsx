import { useEffect, useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

type Props = {
  open: boolean;
  initialStart: string;
  initialEnd: string;
  minStart?: string;
  maxEnd?: string;
  onClose: () => void;
  onConfirm: (startIso: string, endIso: string) => void;
};

export default function PlannedDatesDialog({ open, initialStart, initialEnd, minStart, maxEnd, onClose, onConfirm }: Props) {
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

  const constraints = useMemo(() => ({
    min: minStart ? dayjs(minStart) : undefined,
    max: maxEnd ? dayjs(maxEnd) : undefined,
  }), [minStart, maxEnd]);

  useEffect(() => {
    const errs: string[] = [];
    if (!start.isValid() || !end.isValid()) errs.push("Ngày không hợp lệ");
    if (end.isBefore(start)) errs.push("Trả phải sau Nhận");
    if (constraints.min && start.isBefore(constraints.min)) errs.push("Nhận phải sau thời gian bắt đầu loại phòng");
    if (constraints.max && end.isAfter(constraints.max)) errs.push("Trả phải trước thời gian kết thúc loại phòng");
    setError(errs.join(". "));
  }, [start, end, constraints.min, constraints.max]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cập nhật thời gian dự kiến</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DateTimePicker label="Nhận (dự kiến)" value={start} onChange={(v) => v && setStart(v)} />
            <DateTimePicker label="Trả (dự kiến)" value={end} onChange={(v) => v && setEnd(v)} />
            {error ? (
              <TextField value={error} error fullWidth InputProps={{ readOnly: true }} />
            ) : (
              <Typography variant="caption" color="text.secondary">Chọn khoảng thời gian hợp lệ</Typography>
            )}
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onConfirm(start.toISOString(), end.toISOString())} disabled={!!error}>Xác nhận</Button>
      </DialogActions>
    </Dialog>
  );
}