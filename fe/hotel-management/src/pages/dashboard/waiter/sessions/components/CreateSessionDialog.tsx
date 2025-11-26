import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Stack } from "@mui/material";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import diningSessionsApi, { type CreateDiningSessionRequest, type DiningSessionDto } from "../../../../../api/diningSessionsApi";
import tablesApi, { type TableDto, TableStatus } from "../../../../../api/tablesApi";

interface Props {
  open: boolean;
  tableId?: string;
  onClose: () => void;
  onCreated: (session: DiningSessionDto) => void;
}

export default function CreateSessionDialog({ open, tableId, onClose, onCreated }: Props) {
  const { user, hotelId } = useStore<StoreState>((s) => s);
  const [notes, setNotes] = useState("");
  const [totalGuests, setTotalGuests] = useState<number>(1);
  const [startedAt, setStartedAt] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [selectedTableId, setSelectedTableId] = useState<string>(tableId || "");
  const [tables, setTables] = useState<TableDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTableId(tableId || "");
  }, [tableId]);

  useEffect(() => {
    const loadTables = async () => {
      if (!hotelId) return;
      const res = await tablesApi.listTables({ hotelId, status: TableStatus.Available, page: 1, pageSize: 100 });
      setTables(res.data || []);
    };
    if (open) loadTables();
  }, [open, hotelId]);

  const handleSubmit = async () => {
    if (!hotelId || !selectedTableId) {
      setError("Thiếu khách sạn hoặc bàn");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: CreateDiningSessionRequest = {
      hotelId,
      tableId: selectedTableId,
      waiterUserId: user?.id,
      startedAt: new Date(startedAt).toISOString(),
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
          <TextField label="Ngày giờ bắt đầu" type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} fullWidth size="small" />
          <TextField label="Ghi chú" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth size="small" multiline minRows={2} />
          <TextField label="Số khách" type="number" value={totalGuests} onChange={(e) => setTotalGuests(Math.max(1, Number(e.target.value)))} fullWidth size="small" />
          <FormControl fullWidth size="small">
            <InputLabel>Bàn</InputLabel>
            <Select label="Bàn" value={selectedTableId} onChange={(e) => setSelectedTableId(String(e.target.value))}>
              {tables.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name} • {t.capacity} chỗ</MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && <TextField value={error} fullWidth margin="dense" disabled />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Đóng</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>Tạo</Button>
      </DialogActions>
    </Dialog>
  );
}
