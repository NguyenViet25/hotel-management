import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItemButton, ListItemText } from "@mui/material";
import ordersApi, { type OrderSummaryDto, type OrdersQueryParams } from "../../../../../api/ordersApi";
import diningSessionsApi from "../../../../../api/diningSessionsApi";
import { useStore, type StoreState } from "../../../../../hooks/useStore";

interface Props {
  open: boolean;
  sessionId: string;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignOrderDialog({ open, sessionId, onClose, onAssigned }: Props) {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setResults([]);
    setSearch("");
  }, [open]);

  const handleSearch = async () => {
    setLoading(true);
    const params: OrdersQueryParams = { hotelId: hotelId || undefined, search, page: 1, pageSize: 10 };
    const res = await ordersApi.listOrders(params);
    setLoading(false);
    setResults(res.data || []);
  };

  const handleAssign = async (orderId: string) => {
    await diningSessionsApi.assignOrder(sessionId, orderId);
    onAssigned();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gắn Order vào phiên</DialogTitle>
      <DialogContent>
        <TextField label="Tìm kiếm tên/số điện thoại" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth margin="dense" />
        <Button onClick={handleSearch} disabled={loading}>Tìm</Button>
        <List>
          {results.map((o) => (
            <ListItemButton key={o.id} onClick={() => handleAssign(o.id)}>
              <ListItemText primary={`${o.customerName || "Walk-in"} • ${o.itemsCount} món • ${o.itemsTotal}`} secondary={new Date(o.createdAt).toLocaleString()} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}