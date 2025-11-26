import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Stack,
  Snackbar,
} from "@mui/material";
import useSWR from "swr";
import diningSessionsApi from "../../../../api/diningSessionsApi";
import ordersApi, { type OrderDetailsDto } from "../../../../api/ordersApi";
import orderItemsApi from "../../../../api/orderItemsApi";
import serviceRequestsApi, {
  type ServiceRequestDto,
} from "../../../../api/serviceRequestsApi";
import { useMemo, useState } from "react";
import { useStore, type StoreState } from "../../../../hooks/useStore";

export default function SessionDetailsPage() {
  const { id } = useParams();
  const { hotelId } = useStore<StoreState>((s) => s);
  const [orderId, setOrderId] = useState<string>("");
  const [requestType, setRequestType] = useState("water");
  const [requestDesc, setRequestDesc] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const requestTypes = useMemo(
    () => [
      { value: "water", label: "Nước" },
      { value: "towel", label: "Khăn" },
      { value: "ice", label: "Đá" },
      { value: "napkin", label: "Khăn giấy" },
      { value: "utensils", label: "Muỗng/Đĩa" },
      { value: "other", label: "Khác" },
    ],
    []
  );

  const { data: sessionRes } = useSWR(id ? ["session", id] : null, async () =>
    diningSessionsApi.getSession(id!)
  );
  const { data: orderRes, mutate: mutateOrder } = useSWR(
    orderId ? ["order", orderId] : null,
    async () => ordersApi.getById(orderId)
  );
  const { data: reqRes, mutate: mutateReq } = useSWR(
    id ? ["requests", id] : null,
    async () => serviceRequestsApi.listBySession(id!, 1, 20)
  );

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
    try {
      const res = await serviceRequestsApi.create({
        hotelId,
        diningSessionId: id,
        requestType,
        description: requestDesc,
      });
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã ghi nhận yêu cầu",
          severity: "success",
        });
        setRequestDesc("");
        await mutateReq();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Ghi nhận yêu cầu thất bại",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi", severity: "error" });
    }
  };

  const updateRequestStatus = async (reqId: string, status: string) => {
    try {
      const res = await serviceRequestsApi.update(reqId, { status });
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã cập nhật yêu cầu",
          severity: "success",
        });
        await mutateReq();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Cập nhật yêu cầu thất bại",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi", severity: "error" });
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5">Phiên bàn</Typography>
      {session && (
        <Box mt={1}>
          <Typography variant="subtitle1">Bàn {session.tableName}</Typography>
          <Chip
            label={session.status}
            color={session.status === "Open" ? "success" : "default"}
            size="small"
          />
        </Box>
      )}

      <Box mt={2}>
        <TextField
          label="Order Id"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          size="small"
        />
        <Button sx={{ ml: 1 }} variant="contained" disabled={!orderId}>
          Xem Order
        </Button>
      </Box>

      {order && (
        <Box mt={2}>
          <Typography variant="h6">Món trong Order</Typography>
          <Grid container spacing={2}>
            {order.items.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2">
                      {item.menuItemName}
                    </Typography>
                    <Typography variant="caption">
                      SL: {item.quantity}
                    </Typography>
                    <Box mt={1}>
                      <Chip label={item.status} size="small" />
                    </Box>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        label="Trạng thái"
                        value={item.status}
                        onChange={(e) =>
                          handleUpdateItemStatus(
                            item.id,
                            String(e.target.value)
                          )
                        }
                      >
                        {statusOptions.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
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
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Loại</InputLabel>
            <Select
              label="Loại"
              value={requestType}
              onChange={(e) => setRequestType(String(e.target.value))}
            >
              {requestTypes.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Mô tả"
            value={requestDesc}
            onChange={(e) => setRequestDesc(e.target.value)}
            size="small"
            fullWidth
          />
          <Button variant="contained" onClick={handleCreateRequest}>
            Gửi
          </Button>
        </Box>
        <List>
          {requests.map((r) => (
            <ListItem key={r.id}>
              <ListItemText
                primary={`${r.requestType} • ${r.description}`}
                secondary={`${new Date(r.createdAt).toLocaleString()} • ${
                  r.status
                }`}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={r.status} size="small" />
                {r.status !== "Completed" && r.status !== "Cancelled" && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => updateRequestStatus(r.id, "InProgress")}
                    >
                      Bắt đầu
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => updateRequestStatus(r.id, "Completed")}
                    >
                      Hoàn tất
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => updateRequestStatus(r.id, "Cancelled")}
                    >
                      Hủy
                    </Button>
                  </>
                )}
              </Stack>
            </ListItem>
          ))}
        </List>
      </Box>

      <Snackbar
        open={!!snackbar?.open}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      />
    </Box>
  );
}
