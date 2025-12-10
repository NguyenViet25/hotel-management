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
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  currentEnd: string;
  onClose: () => void;
  onConfirm: (newEndIso: string) => Promise<void> | void;
};

export default function ExtendStayDialog({
  open,
  currentEnd,
  onClose,
  onConfirm,
}: Props) {
  const [value, setValue] = useState<Dayjs>(dayjs(currentEnd));
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setValue(dayjs(currentEnd));
      setError("");
    }
  }, [open, currentEnd]);

  useEffect(() => {
    const errs: string[] = [];
    const curr = dayjs(currentEnd);
    if (!value.isValid()) errs.push("Ngày không hợp lệ");
    if (!value.isAfter(curr))
      errs.push("Ngày kết thúc mới phải sau ngày kết thúc dự kiến");
    setError(errs.join(". "));
  }, [value, currentEnd]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gia hạn thời gian ở</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <DateTimePicker
            label="Kết thúc mới"
            value={value}
            onChange={(v) => v && setValue(v)}
          />
          {error && (
            <Typography variant="caption" color="error">
              * {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={async () => {
            await onConfirm(value.toISOString());
          }}
          disabled={!!error}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
