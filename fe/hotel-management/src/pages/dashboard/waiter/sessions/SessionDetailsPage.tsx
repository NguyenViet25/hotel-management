import { useParams } from "react-router-dom";
import { Box, Typography, Grid, Card, CardContent, Chip, Select, MenuItem, FormControl, InputLabel, Button, TextField, List, ListItem, ListItemText } from "@mui/material";
import useSWR from "swr";
import diningSessionsApi from "../../../../api/diningSessionsApi";
import ordersApi, { type OrderDetailsDto } from "../../../../api/ordersApi";
import orderItemsApi from "../../../../api/orderItemsApi";
import serviceRequestsApi, { type ServiceRequestDto } from "../../../../api/serviceRequestsApi";
import { useState } from "react";
import { useStore, type StoreState } from "../../../../hooks/useStore";

export default function SessionDetailsPage() {
  const { id } = useParams();
  const { hotelId } = useStore<StoreState>((s) => s);
  const [orderId, setOrderId] = useState<string>("");
  const [requestType, setRequestType] = useState("water");
  const [requestDesc, setRequestDesc] = useState("");

  const { data: sessionRes } = useSWR(id ? ["session", id] : null, async () => diningSessionsApi.getSession(id!));
  const { data: orderRes, mutate: mutateOrder } = useSWR(orderId ? ["order", orderId] : null, async () => ordersApi.getById(orderId));
  const { data: reqRes, mutate: mutateReq } = useSWR(id ? ["requests", id] : null, async () => serviceRequestsApi.listBySession(id!, 1, 20));

  const session = sessionRes?.data;
  const order = orderRes?.data as OrderDetailsDto | undefined;
  const requests = (reqRes?.data?.requests || []) as ServiceRequestDto[];

  const statusOptions = ["Pending", "Cooking", "Ready", "Served", "Voided"];

  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    await orderItemsApi.updateStatus(itemId, { status });
    await mutateOrder();
  };

  const handleCreateRequest = async () => {
    if (!hotelId || !id) return;
    await serviceRequestsApi.create({ hotelId, diningSessionId: id, requestType, description: requestDesc });
    setRequestDesc("");
    await mutateReq();
  };

  return (
    <Box p={2}>
      <Typography variant="h5">Phiên bàn</Typography>
      {session && (
        <Box mt={1}>
          <Typography variant="subtitle1">Bàn {session.tableName}</Typography>
          <Chip label={session.status} color={session.status === "Open" ? "success" : "default"} size="small" />
        </Box>
      )}

      <Box mt={2}>
        <TextField label="Order Id" value={orderId} onChange={(e) => setOrderId(e.target.value)} size="small" />
        <Button sx={{ ml: 1 }} variant="contained" disabled={!orderId}>Xem Order</Button>
      </Box>

      {order && (
        <Box mt={2}>
          <Typography variant="h6">Món trong Order</Typography>
          <Grid container spacing={2}>
            {order.items.map((item) => (
              <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2">{item.menuItemName}</Typography>
                    <Typography variant="caption">SL: {item.quantity}</Typography>
                    <Box mt={1}><Chip label={item.status} size="small" /></Box>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        label="Trạng thái"
                        value={item.status}
                        onChange={(e) => handleUpdateItemStatus(item.id, String(e.target.value))}
                      >
                        {statusOptions.map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box mt={4}>
        <Typography variant="h6">Yêu cầu thêm</Typography>
        <Box mt={1} display="flex" gap={1}>
          <TextField label="Loại" value={requestType} onChange={(e) => setRequestType(e.target.value)} size="small" />
          <TextField label="Mô tả" value={requestDesc} onChange={(e) => setRequestDesc(e.target.value)} size="small" fullWidth />
          <Button variant="contained" onClick={handleCreateRequest}>Gửi</Button>
        </Box>
        <List>
          {requests.map((r) => (
            <ListItem key={r.id}>
              <ListItemText primary={`${r.requestType} • ${r.description}`} secondary={`${new Date(r.createdAt).toLocaleString()} • ${r.status}`} />
              <Chip label={r.status} size="small" />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}