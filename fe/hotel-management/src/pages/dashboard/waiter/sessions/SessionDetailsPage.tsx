import {
  AccessTime,
  AcUnit,
  Bed,
  Cancel,
  CheckCircle,
  CleanHands,
  CleaningServices,
  Delete,
  DryCleaning,
  Edit,
  EmojiFoodBeverage,
  Groups,
  HelpOutline,
  Hotel,
  LocalCafe,
  MonetizationOn,
  Person,
  Phone,
  PlayCircle,
  Power,
  ReceiptLong,
  RemoveCircle,
  RestaurantMenu,
  Send,
  StopCircle,
  TableBar,
  TableRestaurant as TableRestaurantIcon,
  WaterDrop,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const { hotelId, user } = useStore<StoreState>((s) => s);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedOrder, setAssignedOrder] = useState<OrderSummaryDto | null>(
    null
  );
  const isWaiter = (user?.roles || [])
    .map((x) => x.toLowerCase())
    .includes("waiter");
  const [requestType, setRequestType] = useState("water");
  const [requestDesc, setRequestDesc] = useState("");
  const [requestQty, setRequestQty] = useState<number>(1);
  const [tab, setTab] = useState<number>(0);
  const [attachFromSessionOpen, setAttachFromSessionOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editGuests, setEditGuests] = useState<number>(0);
  const [editStartedAt, setEditStartedAt] = useState<Dayjs | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [openConfirmOpen, setOpenConfirmOpen] = useState(false);
  const [deleteReqId, setDeleteReqId] = useState<string | null>(null);
  const [reload, setReload] = useState<number>(0);

  const requestTypes = useMemo(
    () => [
      { value: "water", label: "Nước" },
      { value: "tea", label: "Trà" },
      { value: "towel", label: "Khăn" },
      { value: "ice", label: "Đá" },
      { value: "napkin", label: "Khăn giấy" },
      { value: "utensils", label: "Muỗng/Đĩa" },
      { value: "charger", label: "Củ sạc" },
      { value: "other", label: "Khác" },
    ],
    []
  );

  const { pathname } = useLocation();
  const basePath = "/" + pathname.split("/").slice(1, 3).join("/");

  const { data: sessionRes, mutate: mutateSession } = useSWR(
    id ? ["session", id] : null,
    async () => diningSessionsApi.getSession(id!)
  );
  const { data: reqRes, mutate: mutateReq } = useSWR(
    id ? ["requests", id] : null,
    async () => serviceRequestsApi.listBySession(id!, 1, 20)
  );
  const { data: orderRes, mutate: mutateOrder } = useSWR(
    id ? ["session-order", id] : null,
    async () => diningSessionsApi.getOrderBySession(id!)
  );
  const { data: tablesBySessionRes, mutate: mutateTablesBySession } = useSWR(
    id ? ["session-tables", id] : null,
    async () => diningSessionsApi.getTablesBySession(id!)
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
    if (s === "InProgress") return "primary";
    if (s === "Completed") return "success";
    if (s === "Cancelled") return "error";
    return "default";
  };
  const typeLabel = (t?: string) => {
    const found = requestTypes.find((x) => x.value === t);
    return found?.label || t || "Khác";
  };

  const typeIcon = (t?: string) => {
    switch (t) {
      case "water":
        return <WaterDrop color="primary" />;
      case "tea":
        return <EmojiFoodBeverage color="secondary" />;
      case "coffee":
        return <LocalCafe color="info" />;
      case "towel":
        return <DryCleaning color="warning" />;
      case "ice":
        return <AcUnit color="info" />;
      case "napkin":
        return <CleaningServices color="secondary" />;
      case "utensils":
        return <RestaurantMenu color="success" />;
      case "blanket":
        return <Bed color="primary" />;
      case "pillow":
        return <Hotel color="secondary" />;
      case "charger":
        return <Power color="error" />;
      default:
        return <HelpOutline color="disabled" />;
    }
  };

  const capacityGroups = useMemo(() => {
    const source = (tablesBySessionRes?.data || session?.tables || []) as any[];
    const caps = Array.from(new Set(source.map((t) => t.capacity))).sort(
      (a, b) => a - b
    );
    return caps;
  }, [session, tablesBySessionRes, reload]);

  const handleCreateRequest = async () => {
    if (!hotelId || !id) return;
    try {
      const res = await serviceRequestsApi.create({
        hotelId,
        diningSessionId: id,
        requestType,
        description: requestDesc,
        quantity: requestQty || 1,
      });
      if (res.isSuccess) {
        toast.success("Đã ghi nhận yêu cầu");
        setRequestDesc("");
        setRequestQty(1);
        await mutateReq();
      } else {
        toast.error(res.message || "Ghi nhận yêu cầu thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const updateRequestStatus = async (reqId: string, status: string) => {
    if (isWaiter) return;
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
    if (isWaiter) return;
    setAttachFromSessionOpen(true);
  };

  const detachTable = async (tableId: string) => {
    if (!id) return;
    try {
      const res = await diningSessionsApi.detachTable(id, tableId);
      if (res.isSuccess) {
        toast.success("Đã tách bàn");
        await mutateSession();
        await mutateTablesBySession();
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
    if (isWaiter) return;
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
    if (isWaiter) return;
    if (!id) return;
    try {
      const res = await diningSessionsApi.deleteSession(id);
      if (res.isSuccess) {
        toast.success("Đã xóa phiên");
        navigate(basePath);
      } else {
        toast.error(res.message || "Xóa phiên thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const confirmEndSession = async () => {
    if (isWaiter) return;
    if (!id) return;
    try {
      const res = await diningSessionsApi.endSession(id);
      if (res.isSuccess) {
        toast.success("Đã kết thúc phiên");
        setEndConfirmOpen(false);
        await mutateSession();
      } else {
        toast.error(res.message || "Kết thúc phiên thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const reopenSession = async () => {
    if (isWaiter) return;
    if (!id) return;
    try {
      const res = await diningSessionsApi.updateSession(id, { status: "Open" });
      if (res.isSuccess) {
        toast.success("Đã mở phiên");
        await mutateSession();
      } else {
        toast.error(res.message || "Mở phiên thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const confirmDeleteRequest = async () => {
    try {
      if (!deleteReqId) return;
      const target = (requests || []).find((x) => x.id === deleteReqId);
      if (target?.status === "Completed") {
        toast.error("Không thể xóa yêu cầu đã hoàn tất");
        return;
      }
      const res = await serviceRequestsApi.delete(deleteReqId);
      if (res.isSuccess) {
        toast.success("Đã xóa yêu cầu");
        setDeleteReqId(null);
        await mutateReq();
      } else {
        toast.error(res.message || "Xóa yêu cầu thất bại");
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
              sx={{ color: "white", border: "1px dashed" }}
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
            {(orderRes?.data || assignedOrder) && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ReceiptLong fontSize="small" color="disabled" />
                <Typography variant="caption" color="text.secondary">
                  Đặt món:{" "}
                  {orderRes?.data?.customerName ||
                    assignedOrder?.customerName ||
                    "Walk-in"}{" "}
                  • {orderRes?.data?.customerPhone} •{" "}
                  {orderRes?.data?.itemsCount || assignedOrder?.itemsCount || 0}{" "}
                  món •{" "}
                  {Number(
                    orderRes?.data?.itemsTotal ?? assignedOrder?.itemsTotal ?? 0
                  ).toLocaleString()}{" "}
                  đ
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

          {!isWaiter && (
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
                disabled={isWaiter || session?.status !== "Open"}
              >
                Gắn bàn
              </Button>
              {session?.status !== "Open" && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<PlayCircle />}
                  onClick={() => setOpenConfirmOpen(true)}
                  disabled={isWaiter || session?.status === "Open"}
                >
                  Mở phiên
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                color="info"
                startIcon={<ReceiptLong />}
                onClick={() => {
                  if (isWaiter) return;
                  setAssignOpen(true);
                }}
                disabled={isWaiter || session?.status !== "Open"}
              >
                Gán yêu cầu đặt món
              </Button>
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<StopCircle />}
                onClick={() => setEndConfirmOpen(true)}
                disabled={isWaiter || session?.status !== "Open"}
              >
                Kết thúc
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<Edit />}
                onClick={openEdit}
                disabled={isWaiter || session?.status !== "Open"}
              >
                Sửa
              </Button>
              {/* <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={<Delete />}
                onClick={() => setDeleteTargetId(id || null)}
                disabled={isWaiter || session?.status !== "Open"}
              >
                Xóa
              </Button> */}
            </Stack>
          )}
        </Card>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Bàn" />
        <Tab label="Đặt món" />
        <Tab label="Yêu cầu thêm" />
      </Tabs>

      {tab === 0 && session && (
        <Box>
          <Typography variant="subtitle2">
            {session.status === "Open" ? "Bàn đang phục vụ" : "Bàn đã gắn"}
          </Typography>
          <Stack spacing={2} mt={1}>
            {capacityGroups.map((cap) => {
              const rows = (
                (tablesBySessionRes?.data || session.tables || []) as any[]
              ).filter((t) => Number(t.capacity) === Number(cap));
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
                              6 người/bàn
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
                        {!isWaiter && (
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
                              disabled={isWaiter || session?.status !== "Open"}
                            >
                              Tách
                            </Button>
                          </Stack>
                        )}
                      </Card>
                    ))}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
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
                disabled={session?.status !== "Open"}
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
              disabled={session?.status !== "Open"}
            />
            <TextField
              label="Số lượng"
              type="number"
              value={requestQty}
              onChange={(e) =>
                setRequestQty(Math.max(1, Number(e.target.value || 1)))
              }
              size="small"
              sx={{ width: 120 }}
              inputProps={{ min: 1 }}
              disabled={session?.status !== "Open"}
            />
            <Button
              startIcon={<Send />}
              variant="contained"
              sx={{ minWidth: 120 }}
              onClick={handleCreateRequest}
              disabled={isWaiter || session?.status !== "Open"}
            >
              Gửi
            </Button>
          </Box>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {requests.map((r) => (
              <Grid key={r.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardHeader
                    avatar={typeIcon(r.requestType)}
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
                      <Chip label={`SL: ${r.quantity}`} size="small" />
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
                      {!isWaiter ? (
                        <>
                          <Button
                            size="small"
                            startIcon={<PlayCircle />}
                            color="primary"
                            variant="contained"
                            fullWidth
                            onClick={() =>
                              updateRequestStatus(r.id, "InProgress")
                            }
                            disabled={isWaiter || session?.status !== "Open"}
                          >
                            Bắt đầu
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircle />}
                            color="success"
                            fullWidth
                            onClick={() =>
                              updateRequestStatus(r.id, "Completed")
                            }
                            disabled={isWaiter || session?.status !== "Open"}
                          >
                            Hoàn tất
                          </Button>
                          <Button
                            size="small"
                            color="warning"
                            variant="contained"
                            fullWidth
                            startIcon={<Cancel />}
                            onClick={() =>
                              updateRequestStatus(r.id, "Cancelled")
                            }
                            disabled={isWaiter || session?.status !== "Open"}
                          >
                            Huỷ
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* <Button
                            size="small"
                            color="warning"
                            variant="contained"
                            fullWidth
                            startIcon={<Delete />}
                            onClick={() => setDeleteReqId(r.id)}
                            disabled={session?.status !== "Open"}
                          >
                            Xóa
                          </Button> */}
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {requests.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Không có yêu cầu
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography variant="h6">Yêu cầu đặt món</Typography>
          <Box mt={1}>
            {!orderRes?.data ? (
              <Typography variant="body2" color="text.secondary">
                Chưa gán yêu cầu đặt món
              </Typography>
            ) : (
              <Stack spacing={1}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                  <Chip
                    icon={<Person fontSize="small" />}
                    label={`Khách: ${orderRes.data.customerName || "Walk-in"}`}
                  />
                  {orderRes.data.customerPhone && (
                    <Chip
                      icon={<Phone fontSize="small" />}
                      label={`SĐT: ${orderRes.data.customerPhone}`}
                    />
                  )}
                  <Chip
                    icon={<RestaurantMenu fontSize="small" />}
                    label={`Món: ${orderRes.data.itemsCount}`}
                  />
                  <Chip
                    icon={<MonetizationOn fontSize="small" />}
                    label={`Tổng: ${Number(
                      orderRes.data.itemsTotal
                    ).toLocaleString()} đ`}
                  />
                  {orderRes.data.promotionCode && (
                    <Chip
                      label={`Mã KM: ${orderRes.data.promotionCode}`}
                      color="primary"
                    />
                  )}
                  {orderRes.data.promotionValue ? (
                    <Chip
                      label={`Giảm: ${orderRes.data.promotionValue}%`}
                      color="primary"
                    />
                  ) : null}
                </Stack>
                <Divider />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ width: "6%" }}>
                        #
                      </TableCell>
                      <TableCell>Tên món</TableCell>
                      <TableCell align="right" sx={{ width: "12%" }}>
                        SL
                      </TableCell>
                      <TableCell align="right" sx={{ width: "18%" }}>
                        Đơn giá
                      </TableCell>
                      <TableCell align="right" sx={{ width: "18%" }}>
                        Thành tiền
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(orderRes.data.items || []).map((it, idx) => (
                      <TableRow key={it.id}>
                        <TableCell align="center">{idx + 1}</TableCell>
                        <TableCell>{it.menuItemName}</TableCell>
                        <TableCell align="right">{it.quantity}</TableCell>
                        <TableCell align="right">
                          {Number(it.unitPrice).toLocaleString()} đ
                        </TableCell>
                        <TableCell align="right">
                          {Number(it.unitPrice * it.quantity).toLocaleString()}{" "}
                          đ
                        </TableCell>
                      </TableRow>
                    ))}
                    {orderRes.data.promotionValue ? (
                      <TableRow>
                        <TableCell />
                        <TableCell sx={{ color: "#2e7d32" }}>
                          Giảm giá (
                          {orderRes.data.promotionCode
                            ? `${orderRes.data.promotionCode} - `
                            : ""}
                          {orderRes.data.promotionValue}%)
                        </TableCell>
                        <TableCell align="right">1</TableCell>
                        <TableCell align="right">
                          {Number(
                            Math.round(
                              (orderRes.data.itemsTotal *
                                (orderRes.data.promotionValue || 0)) /
                                100
                            )
                          ).toLocaleString()}{" "}
                          đ
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#2e7d32" }}>
                          -
                          {Number(
                            Math.round(
                              (orderRes.data.itemsTotal *
                                (orderRes.data.promotionValue || 0)) /
                                100
                            )
                          ).toLocaleString()}{" "}
                          đ
                        </TableCell>
                      </TableRow>
                    ) : null}
                    <TableRow>
                      <TableCell />
                      <TableCell sx={{ fontWeight: 700 }}>Tổng cộng</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {Number(
                          orderRes.data.itemsTotal -
                            Math.round(
                              (orderRes.data.itemsTotal *
                                (orderRes.data.promotionValue || 0)) /
                                100
                            )
                        ).toLocaleString()}{" "}
                        đ
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Stack>
            )}
          </Box>
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
                  setReload((prev) => prev + 1);
                  await mutateSession();
                  await mutateTablesBySession();
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachFromSessionOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmOpen} onClose={() => setOpenConfirmOpen(false)}>
        <DialogTitle>Mở phiên</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn mở phiên này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenConfirmOpen(false);
              reopenSession();
            }}
            disabled={isWaiter}
          >
            Mở phiên
          </Button>
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
          onAssigned={() => {}}
          onAssignedWithDetails={async (o) => {
            try {
              const res = await diningSessionsApi.assignOrder(id!, o.id);
              if (res.isSuccess) {
                setAssignedOrder(o);
                await mutateOrder();
                toast.success("Đã gắn order");
              } else {
                toast.error(res.message || "Gắn order thất bại");
              }
            } catch {
              toast.error("Đã xảy ra lỗi");
            }
          }}
        />
      )}

      <Dialog open={!!deleteReqId} onClose={() => setDeleteReqId(null)}>
        <DialogTitle>Xóa yêu cầu</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa yêu cầu này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteReqId(null)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteRequest}
            disabled={
              requests.find((x) => x.id === deleteReqId)?.status === "Completed"
            }
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={endConfirmOpen} onClose={() => setEndConfirmOpen(false)}>
        <DialogTitle>Kết thúc phiên</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn kết thúc phiên này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndConfirmOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={confirmEndSession}
            disabled={isWaiter}
          >
            Kết thúc
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
