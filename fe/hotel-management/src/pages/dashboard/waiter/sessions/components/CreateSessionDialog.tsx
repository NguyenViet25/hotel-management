import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import diningSessionsApi, { type CreateDiningSessionRequest, type DiningSessionDto } from "../../../../../api/diningSessionsApi";

interface Props {
  open: boolean;
  tableId?: string;
  onClose: () => void;
  onCreated: (session: DiningSessionDto) => void;
}

export default function CreateSessionDialog({ open, tableId, onClose, onCreated }: Props) {
  const { user, hotelId } = useStore<StoreState>((s) => s);
  const [guestId, setGuestId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!hotelId || !tableId) {
      setError("Hotel or table is missing");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: CreateDiningSessionRequest = {
      hotelId,
      tableId,
      waiterUserId: user?.id,
      guestId: guestId || undefined,
    };
    const res = await diningSessionsApi.createSession(payload);
    setSubmitting(false);
    if (!res.isSuccess) {
      setError(res.message || "Failed to create session");
      return;
    }
    onCreated(res.data);
    onClose();
    setGuestId("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tạo phiên phục vụ</DialogTitle>
      <DialogContent>
        <TextField label="Guest Id (optional)" value={guestId} onChange={(e) => setGuestId(e.target.value)} fullWidth margin="dense" />
        {error && <TextField value={error} fullWidth margin="dense" disabled />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Đóng</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>Tạo</Button>
      </DialogActions>
    </Dialog>
  );
}