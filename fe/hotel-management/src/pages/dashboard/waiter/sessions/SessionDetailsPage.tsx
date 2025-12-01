import { useParams, useNavigate } from "react-router-dom";
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
  TableBar,
  Edit,
  Delete,
} from "@mui/icons-material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useSWR from "swr";
import diningSessionsApi from "../../../../api/diningSessionsApi";
import ordersApi, { type OrderDetailsDto } from "../../../../api/ordersApi";
import orderItemsApi from "../../../../api/orderItemsApi";
import serviceRequestsApi, {
  type ServiceRequestDto,
} from "../../../../api/serviceRequestsApi";
import { useEffect, useMemo, useState } from "react";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import { toast } from "react-toastify";
import PageTitle from "../../../../components/common/PageTitle";
import AssignMultipleTableDialog from "./components/AssignMultipleTableDialog";
import dayjs, { Dayjs } from "dayjs";

export default function SessionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hotelId } = useStore<StoreState>((s) => s);
  const [orderId, setOrderId] = useState<string>("");
  const [requestType, setRequestType] = useState("water");
  const [requestDesc, setRequestDesc] = useState("");
  const [tab, setTab] = useState<number>(0);
  const [attachFromSessionOpen, setAttachFromSessionOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editGuests, setEditGuests] = useState<number>(0);
  const [editStartedAt, setEditStartedAt] = useState<Dayjs | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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

  const { data: sessionRes, mutate: mutateSession } = useSWR(
    id ? ["session", id] : null,
    async () => diningSessionsApi.getSession(id!)
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

  const openAttachForSession = () => {
    setAttachFromSessionOpen(true);
  };

  const detachTable = async (tableId: string) => {
    if (!id) return;
    try {
      const res = await diningSessionsApi.detachTable(id, tableId);
      if (res.isSuccess) {
        toast.success("Đã tách bàn");
        await mutateSession();
      } else {
        toast.error(res.message || "Tách bàn thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const openEdit = () => {
    if (!session) return;
    setEditNotes(session.notes || "");
    setEditGuests(Number(session.totalGuests || 0));
    setEditStartedAt(dayjs(session.startedAt));
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!id) return;
    try {
      const res = await diningSessionsApi.updateSession(id, {
        notes: editNotes,
        totalGuests: editGuests,
        startedAt: editStartedAt ? editStartedAt.toISOString() : undefined,
      });
      if (res.isSuccess) {
        toast.success("Đã cập nhật phiên");
        setEditOpen(false);
        setEditStartedAt(null);
        await mutateSession();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const deleteSessionAction = async () => {
    if (!id) return;
    try {
      const res = await diningSessionsApi.deleteSession(id);
      if (res.isSuccess) {
        toast.success("Đã xóa phiên");
        navigate("/waiter/sessions");
      } else {
        toast.error(res.message || "Xóa phiên thất bại");
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
              label={session.status === "Open" ? "Đang mở" : "Đóng"}
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
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1}
            sx={{ px: 2, pb: 2 }}
          >
            <Button
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<TableBar />}
              onClick={openAttachForSession}
            >
              Gắn bàn
            </Button>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<Edit />}
              onClick={openEdit}
            >
              Sửa
            </Button>
            <Button
              size="small"
              color="error"
              variant="contained"
              startIcon={<Delete />}
              onClick={() => setDeleteTargetId(id || null)}
            >
              Xóa
            </Button>
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
          <Grid container spacing={2} mt={1}>
            {(session.tables || []).map((t) => (
              <Grid key={t.tableId} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    position: "relative",
                    transition: "all .2s ease",
                    "&:hover": { boxShadow: 2, borderColor: "grey.300" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                    }}
                  >
                    <TableRestaurantIcon color="primary" />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, flexGrow: 1 }}
                    >
                      {t.tableName}
                    </Typography>
                    <Chip label={`${t.capacity} chỗ`} size="small" />
                  </Box>
                  <Stack spacing={0.5} sx={{ px: 2, py: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime fontSize="small" color="disabled" />
                      <Typography variant="caption" color="text.secondary">
                        Gắn lúc {new Date(t.attachedAt).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={1}
                    sx={{ px: 2, pb: 2 }}
                  >
                    <Button
                      size="small"
                      color="warning"
                      variant="contained"
                      fullWidth
                      onClick={() => detachTable(t.tableId)}
                    >
                      Tách
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
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
        open={attachFromSessionOpen}
        onClose={() => setAttachFromSessionOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Gắn bàn vào phiên</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            {id && (
              <AssignMultipleTableDialog
                sessionId={id}
                onAssigned={async () => {
                  setAttachFromSessionOpen(false);
                  await mutateSession();
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachFromSessionOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Sửa phiên</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Thời gian bắt đầu"
                value={editStartedAt}
                onChange={(v) => setEditStartedAt(v)}
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
            <TextField
              label="Ghi chú"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              multiline
              minRows={2}
            />
            <TextField
              label="Số khách"
              type="number"
              value={editGuests}
              onChange={(e) => setEditGuests(Number(e.target.value || 0))}
              inputProps={{ min: 0 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Đóng</Button>
          <Button variant="contained" onClick={submitEdit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle>Xóa phiên</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa phiên này?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hành động này sẽ gỡ tất cả bàn đã gắn khỏi phiên.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetId(null)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={deleteSessionAction}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
