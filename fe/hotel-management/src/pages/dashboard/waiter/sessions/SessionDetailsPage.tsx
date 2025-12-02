import {
  AccessTime,
  Cancel,
  CheckCircle,
  CleanHands,
  Delete,
  Edit,
  Groups,
  PlayCircle,
  ReceiptLong,
  RemoveCircle,
  Send,
  TableBar,
  TableRestaurant as TableRestaurantIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useSWR from "swr";
import diningSessionsApi from "../../../../api/diningSessionsApi";
import { type OrderSummaryDto } from "../../../../api/ordersApi";
import serviceRequestsApi, {
  type ServiceRequestDto,
} from "../../../../api/serviceRequestsApi";
import tableImg from "../../../../assets/table.png";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import AssignMultipleTableDialog from "./components/AssignMultipleTableDialog";
import AssignOrderDialog from "./components/AssignOrderDialog";

export default function SessionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hotelId } = useStore<StoreState>((s) => s);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedOrder, setAssignedOrder] = useState<OrderSummaryDto | null>(
    null
  );
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
  const { data: reqRes, mutate: mutateReq } = useSWR(
    id ? ["requests", id] : null,
    async () => serviceRequestsApi.listBySession(id!, 1, 20)
  );

  const session = sessionRes?.data;
  const requests = (reqRes?.data?.requests || []) as ServiceRequestDto[];

  const statusLabel = (s?: string) => {
    if (s === "InProgress") return "Đang xử lý";
    if (s === "Completed") return "Hoàn tất";
    if (s === "Cancelled") return "Đã huỷ";
    return "Chờ xử lý";
  };
  const statusColor = (s?: string) => {
    if (s === "InProgress") return "warning";
    if (s === "Completed") return "success";
    if (s === "Cancelled") return "error";
    return "default";
  };
  const typeLabel = (t?: string) => {
    const found = requestTypes.find((x) => x.value === t);
    return found?.label || t || "Khác";
  };

  const capacityGroups = useMemo(() => {
    const caps = Array.from(
      new Set((session?.tables || []).map((t) => t.capacity))
    ).sort((a, b) => a - b);
    return caps;
  }, [session]);

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
            <AccessTime color="primary" sx={{ color: "white" }} />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: "white", flexGrow: 1 }}
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
            {assignedOrder && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ReceiptLong fontSize="small" color="disabled" />
                <Typography variant="caption" color="text.secondary">
                  Order: {assignedOrder.customerName || "Walk-in"} •{" "}
                  {assignedOrder.itemsCount} món •{" "}
                  {Number(assignedOrder.itemsTotal).toLocaleString()} đ
                </Typography>
              </Stack>
            )}
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
              color="info"
              startIcon={<ReceiptLong />}
              onClick={() => setAssignOpen(true)}
            >
              Gán yêu cầu đặt món
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
        <Tab label="Yêu cầu" />
      </Tabs>

      {tab === 0 && session && (
        <Box>
          <Typography variant="subtitle2">Bàn đang phục vụ</Typography>
          <Stack spacing={2} mt={1}>
            {capacityGroups.map((cap) => {
              const rows = (session.tables || []).filter(
                (t) => Number(t.capacity) === Number(cap)
              );
              return (
                <Paper
                  key={cap}
                  variant="outlined"
                  sx={{
                    p: 2,
                    position: "relative",
                    border: "2px dashed",
                    borderColor: "warning.main",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, #FFF8E1 0%, #FFFDF5 100%)",
                    "&:before": {
                      content: '""',
                      position: "absolute",
                      top: "50%",
                      left: -8,
                      transform: "translateY(-50%)",
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "background.paper",
                      border: "2px solid",
                      borderColor: "warning.main",
                    },
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      top: "50%",
                      right: -8,
                      transform: "translateY(-50%)",
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "background.paper",
                      border: "2px solid",
                      borderColor: "warning.main",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 1,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: "warning.light",
                      border: "2px dashed",
                      borderColor: "warning.main",
                    }}
                  >
                    <TableRestaurantIcon color="warning" />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        flexGrow: 1,
                      }}
                    >
                      {`Dãy ${cap}`}
                    </Typography>
                    <Chip label={`${rows.length} bàn`} variant="outlined" />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(1, minmax(0, 1fr))",
                        md: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    {rows.map((t) => (
                      <Card
                        key={t.tableId}
                        variant="outlined"
                        sx={{
                          width: "100%",
                          borderRadius: 2,
                          position: "relative",
                          transition: "all .2s ease",
                          "&:hover": { boxShadow: 2, borderColor: "grey.300" },
                        }}
                      >
                        <Box sx={{ position: "relative", pt: 4 }}>
                          <Box sx={{ height: 110, overflow: "hidden" }}>
                            <img
                              src={tableImg}
                              alt={t.tableName}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block",
                              }}
                            />
                          </Box>
                          <Box sx={{ position: "absolute", top: 8, left: 8 }}>
                            <Chip
                              label="Đang sử dụng"
                              color="primary"
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Stack spacing={0.5} sx={{ px: 1.5, pb: 1.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
                            {t.tableName}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <Groups fontSize="small" color="disabled" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {t.capacity} người/bàn
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <AccessTime fontSize="small" color="disabled" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                            startIcon={<RemoveCircle />}
                            onClick={() => detachTable(t.tableId)}
                          >
                            Tách
                          </Button>
                        </Stack>
                      </Card>
                    ))}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      )}

      {tab === 1 && (
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
            <Button
              startIcon={<Send />}
              variant="contained"
              sx={{ minWidth: 120 }}
              onClick={handleCreateRequest}
            >
              Gửi
            </Button>
          </Box>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {requests.map((r) => (
              <Grid key={r.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardHeader
                    title={`${typeLabel(r.requestType)} • ${r.description}`}
                    subheader={`${new Date(r.createdAt).toLocaleString()}${
                      r.assignedToName ? " • " + r.assignedToName : ""
                    }`}
                    action={
                      <Chip
                        label={statusLabel(r.status)}
                        color={statusColor(r.status) as any}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      {r.assignedToName && (
                        <Chip
                          label={`Phục vụ: ${r.assignedToName}`}
                          size="small"
                        />
                      )}
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
                      <Button
                        size="small"
                        startIcon={<PlayCircle />}
                        color="primary"
                        variant="contained"
                        fullWidth
                        onClick={() => updateRequestStatus(r.id, "InProgress")}
                      >
                        Bắt đầu
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircle />}
                        color="success"
                        fullWidth
                        onClick={() => updateRequestStatus(r.id, "Completed")}
                      >
                        Hoàn tất
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        variant="contained"
                        fullWidth
                        startIcon={<Cancel />}
                        onClick={() => updateRequestStatus(r.id, "Cancelled")}
                      >
                        Huỷ
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {requests.length === 0 && (
              <Grid xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Không có yêu cầu
                </Typography>
              </Grid>
            )}
          </Grid>
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

      {id && (
        <AssignOrderDialog
          open={assignOpen}
          sessionId={id}
          onClose={() => setAssignOpen(false)}
          onAssigned={() => {
            toast.success("Đã gắn order");
          }}
          onAssignedWithDetails={(o) => setAssignedOrder(o)}
        />
      )}

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
