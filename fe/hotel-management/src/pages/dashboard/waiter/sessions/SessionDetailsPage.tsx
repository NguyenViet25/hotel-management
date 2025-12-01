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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import {
  AccessTime,
  Groups,
  TableRestaurant as TableRestaurantIcon,
  CleanHands,
} from "@mui/icons-material";
import useSWR from "swr";
import diningSessionsApi from "../../../../api/diningSessionsApi";
import tablesApi, {
  type TableDto,
  TableStatus,
} from "../../../../api/tablesApi";
import ordersApi, { type OrderDetailsDto } from "../../../../api/ordersApi";
import orderItemsApi from "../../../../api/orderItemsApi";
import serviceRequestsApi, {
  type ServiceRequestDto,
} from "../../../../api/serviceRequestsApi";
import { useEffect, useMemo, useState } from "react";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import { toast } from "react-toastify";
import PageTitle from "../../../../components/common/PageTitle";

export default function SessionDetailsPage() {
  const { id } = useParams();
  const { hotelId } = useStore<StoreState>((s) => s);
  const [orderId, setOrderId] = useState<string>("");
  const [requestType, setRequestType] = useState("water");
  const [requestDesc, setRequestDesc] = useState("");
  const [tab, setTab] = useState<number>(0);
  const [attachOpen, setAttachOpen] = useState(false);
  const [availableTables, setAvailableTables] = useState<TableDto[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
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
        toast.success("Đã ghi nhận yêu cầu");
        setRequestDesc("");
        await mutateReq();
      } else {
        toast.error(res.message || "Ghi nhận yêu cầu thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const updateRequestStatus = async (reqId: string, status: string) => {
    try {
      const res = await serviceRequestsApi.update(reqId, { status });
      if (res.isSuccess) {
        toast.success("Đã cập nhật yêu cầu");
        await mutateReq();
      } else {
        toast.error(res.message || "Cập nhật yêu cầu thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  useEffect(() => {
    const loadAvailableTables = async () => {
      if (!hotelId) return;
      const res = await tablesApi.listTables({
        hotelId,
        status: TableStatus.Available,
        page: 1,
        pageSize: 100,
      });
      setAvailableTables(res.data || []);
    };
    if (attachOpen) {
      setSelectedTableId("");
      loadAvailableTables();
    }
  }, [attachOpen, hotelId]);

  const attachTable = async () => {
    if (!id || !selectedTableId) return;
    try {
      const res = await diningSessionsApi.attachTable(id, selectedTableId);
      if (res.isSuccess) {
        toast.success("Đã gắn bàn");
        setAttachOpen(false);
      } else {
        toast.error(res.message || "Gắn bàn thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const detachTable = async (tableId: string) => {
    if (!id) return;
    try {
      const res = await diningSessionsApi.detachTable(id, tableId);
      if (res.isSuccess) {
        toast.success("Đã tách bàn");
      } else {
        toast.error(res.message || "Tách bàn thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  return (
    <Box>
      <PageTitle
        title="Chi tiết phiên"
        subtitle={`Xem chi tiết phiên phục vụ`}
      />

      {session && (
        <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: "primary.light",
              border: "2px dashed",
              borderColor: "primary.main",
            }}
          >
            <AccessTime color="primary" />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, flexGrow: 1 }}
            >
              {new Date(session.startedAt).toLocaleString()}
            </Typography>
            <Chip
              label={session.status}
              color={session.status === "Open" ? "primary" : "default"}
              size="small"
            />
          </Box>
          <Stack spacing={0.5} sx={{ px: 2, py: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Groups fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {session.totalGuests} khách
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <TableRestaurantIcon fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {(session.tables || []).length} bàn đã gắn:
                {(session.tables || []).length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    {" "}
                    {(session.tables || [])
                      .sort((a, b) => a.tableName.localeCompare(b.tableName))
                      .map((t) => t.tableName)
                      .join(", ")}
                  </Typography>
                )}
              </Typography>
            </Stack>
            {!!session.notes && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CleanHands fontSize="small" color="disabled" />
                <Typography variant="caption" color="text.secondary">
                  Ghi chú: {session.notes}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Card>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Bàn" />
        <Tab label="Order" />
        <Tab label="Yêu cầu" />
      </Tabs>

      {tab === 0 && session && (
        <Box>
          <Typography variant="subtitle2">Bàn đang phục vụ</Typography>
          <List>
            {(session.tables || []).map((t) => (
              <ListItem key={t.tableId}>
                <ListItemText
                  primary={`${t.tableName} • ${t.capacity} chỗ`}
                  secondary={`Gắn lúc ${new Date(
                    t.attachedAt
                  ).toLocaleString()}`}
                />
                <Button
                  size="small"
                  color="warning"
                  onClick={() => detachTable(t.tableId)}
                >
                  Tách
                </Button>
              </ListItem>
            ))}
          </List>
          <Button variant="outlined" onClick={() => setAttachOpen(true)}>
            Gắn thêm bàn
          </Button>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Box>
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
        </Box>
      )}

      {tab === 2 && (
        <Box>
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
              <ListItem
                key={r.id}
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
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
                      color="warning"
                      onClick={() => updateRequestStatus(r.id, "Cancelled")}
                    >
                      Huỷ
                    </Button>
                  </Stack>
                }
              >
                <ListItemText
                  primary={`${r.requestType} • ${r.description}`}
                  secondary={`${new Date(r.createdAt).toLocaleString()} • ${
                    r.status
                  }`}
                />
              </ListItem>
            ))}
            {requests.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Không có yêu cầu
              </Typography>
            )}
          </List>
        </Box>
      )}

      <Dialog
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Gắn bàn vào phiên</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Bàn</InputLabel>
            <Select
              label="Bàn"
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(String(e.target.value))}
            >
              {availableTables.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} • {t.capacity} chỗ
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachOpen(false)}>Đóng</Button>
          <Button
            variant="contained"
            disabled={!selectedTableId}
            onClick={attachTable}
          >
            Gắn
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
