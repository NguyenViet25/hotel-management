import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import diningSessionsApi, {
  type CreateDiningSessionRequest,
  type DiningSessionDto,
} from "../../../../../api/diningSessionsApi";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
// no table selection at creation time

interface Props {
  open: boolean;
  tableId?: string;
  onClose: () => void;
  onCreated: (session: DiningSessionDto) => void;
}

export default function CreateSessionDialog({
  open,
  onClose,
  onCreated,
}: Props) {
  const { user, hotelId } = useStore<StoreState>((s) => s);
  const isWaiter = (user?.roles || [])
    .map((x) => x.toLowerCase())
    .includes("waiter");
  const [notes, setNotes] = useState("");
  const [totalGuests, setTotalGuests] = useState<number>(1);
  const [startedAt, setStartedAt] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {}, []);

  const handleSubmit = async () => {
    if (isWaiter) return;
    if (!hotelId) {
      setError("Thiếu khách sạn");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: CreateDiningSessionRequest = {
      hotelId,
      // no tableId at creation
      waiterUserId: user?.id,
      startedAt: dayjs(startedAt).format("YYYY-MM-DDTHH:mm:ss"),
      notes: notes || undefined,
      totalGuests: totalGuests || undefined,
    };
    const res = await diningSessionsApi.createSession(payload);
    setSubmitting(false);
    if (!res.isSuccess) {
      setError(res.message || "Failed to create session");
      return;
    }
    onCreated(res.data);
    onClose();
    setNotes("");
    setTotalGuests(1);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo phiên phục vụ</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <DateTimePicker
            label="Ngày giờ bắt đầu"
            value={dayjs(startedAt)}
            minDateTime={dayjs()}
            maxDateTime={dayjs()}
            onChange={(v) => v && setStartedAt(v.format("YYYY-MM-DDTHH:mm:ss"))}
          />

          <TextField
            label="Ghi chú"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />
          <TextField
            label="Số khách"
            type="number"
            value={totalGuests}
            onChange={(e) =>
              setTotalGuests(Math.max(1, Number(e.target.value)))
            }
            fullWidth
            size="small"
          />
          {/* choose tables after session created */}
          {error && (
            <TextField value={error} fullWidth margin="dense" disabled />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Đóng
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || isWaiter}
        >
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
