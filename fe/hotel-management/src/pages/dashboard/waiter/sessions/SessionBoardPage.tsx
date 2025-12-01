import {
  AccessTime,
  AddCircle,
  Delete,
  Edit,
  Groups,
  Info,
  Search,
  TableBar,
  TableRestaurant as TableRestaurantIcon,
  CleanHands,
  FoodBank,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  DateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import diningSessionsApi, {
  type DiningSessionDto,
} from "../../../../api/diningSessionsApi";
import serviceRequestsApi, {
  type ServiceRequestDto,
} from "../../../../api/serviceRequestsApi";
import tablesApi, {
  TableStatus,
  type TableDto,
  type TablesQueryParams,
} from "../../../../api/tablesApi";
import { type Option } from "../../../../components/common/CustomSelect";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import AssignOrderDialog from "./components/AssignOrderDialog";
import CreateSessionDialog from "./components/CreateSessionDialog";
import AssignMultipleTableDialog from "./components/AssignMultipleTableDialog";
import { toast } from "react-toastify";
import EmptyState from "../../../../components/common/EmptyState";

export default function SessionBoardPage() {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [selectedTable, setSelectedTable] = useState<TableDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [attachFromSessionOpen, setAttachFromSessionOpen] = useState(false);
  const [attachSessionTargetId, setAttachSessionTargetId] =
    useState<string>("");
  const [activeSession, setActiveSession] = useState<DiningSessionDto | null>(
    null
  );
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [dayFilter, setDayFilter] = useState<number>(-1);
  const [sessionStatusFilter, setSessionStatusFilter] = useState<
    "All" | "Open" | "Ended"
  >("All");
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState<DiningSessionDto | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editGuests, setEditGuests] = useState<number>(0);
  const [editStartedAt, setEditStartedAt] = useState<Dayjs | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [requestsSessionId, setRequestsSessionId] = useState<string>("");
  const [requests, setRequests] = useState<ServiceRequestDto[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [reqTypeFilter, setReqTypeFilter] = useState<string>("all");
  const [reqStatusFilter, setReqStatusFilter] = useState<string>("all");
  const [reqSearch, setReqSearch] = useState<string>("");
  const [newReqType, setNewReqType] = useState<string>("water");
  const [newReqDesc, setNewReqDesc] = useState<string>("");
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
  const [editReq, setEditReq] = useState<ServiceRequestDto | null>(null);
  const [editReqType, setEditReqType] = useState<string>("water");
  const [editReqDesc, setEditReqDesc] = useState<string>("");
  const [editReqStatus, setEditReqStatus] = useState<string>("Pending");
  const [deleteReqId, setDeleteReqId] = useState<string | null>(null);

  const openRequestsForSession = async (sessionId: string) => {
    setRequestsSessionId(sessionId);
    setRequestsOpen(true);
    setRequestsLoading(true);
    try {
      const res = await serviceRequestsApi.listBySession(sessionId, 1, 100);
      setRequests(res.data?.requests || []);
    } finally {
      setRequestsLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return (requests || []).filter((r) => {
      const byType = reqTypeFilter === "all" || r.requestType === reqTypeFilter;
      const byStatus =
        reqStatusFilter === "all" || r.status === reqStatusFilter;
      const bySearch =
        !reqSearch ||
        r.description.toLowerCase().includes(reqSearch.toLowerCase()) ||
        r.requestType.toLowerCase().includes(reqSearch.toLowerCase());
      return byType && byStatus && bySearch;
    });
  }, [requests, reqTypeFilter, reqStatusFilter, reqSearch]);

  const createRequest = async () => {
    try {
      if (!hotelId || !requestsSessionId) return;
      const res = await serviceRequestsApi.create({
        hotelId,
        diningSessionId: requestsSessionId,
        requestType: newReqType,
        description: newReqDesc,
      });
      if (res.isSuccess) {
        toast.success("Đã tạo yêu cầu");
        setNewReqDesc("");
        const l = await serviceRequestsApi.listBySession(
          requestsSessionId,
          1,
          100
        );
        setRequests(l.data?.requests || []);
      } else {
        toast.error(res.message || "Tạo yêu cầu thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const startRequest = async (id: string) => {
    try {
      const res = await serviceRequestsApi.update(id, { status: "InProgress" });
      if (res.isSuccess) {
        const l = await serviceRequestsApi.listBySession(
          requestsSessionId,
          1,
          100
        );
        setRequests(l.data?.requests || []);
      }
    } catch {}
  };
  const completeRequest = async (id: string) => {
    try {
      const res = await serviceRequestsApi.update(id, { status: "Completed" });
      if (res.isSuccess) {
        const l = await serviceRequestsApi.listBySession(
          requestsSessionId,
          1,
          100
        );
        setRequests(l.data?.requests || []);
      }
    } catch {}
  };
  const cancelRequest = async (id: string) => {
    try {
      const res = await serviceRequestsApi.update(id, { status: "Cancelled" });
      if (res.isSuccess) {
        const l = await serviceRequestsApi.listBySession(
          requestsSessionId,
          1,
          100
        );
        setRequests(l.data?.requests || []);
      }
    } catch {}
  };
  const confirmDeleteRequest = async () => {
    try {
      if (!deleteReqId) return;
      const res = await serviceRequestsApi.delete(deleteReqId);
      if (res.isSuccess) {
        toast.success("Đã xóa yêu cầu");
        const l = await serviceRequestsApi.listBySession(
          requestsSessionId,
          1,
          100
        );
        setRequests(l.data?.requests || []);
        setDeleteReqId(null);
      } else {
        toast.error(res.message || "Xóa yêu cầu thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };
  const openEditRequest = (r: ServiceRequestDto) => {
    setEditReq(r);
    setEditReqType(r.requestType);
    setEditReqDesc(r.description);
    setEditReqStatus(r.status);
  };
  const saveEditRequest = async () => {
    try {
      if (!editReq) return;
      const res = await serviceRequestsApi.update(editReq.id, {
        status: editReqStatus,
        requestType: editReqType,
        description: editReqDesc,
      });
      if (res.isSuccess) {
        toast.success("Đã cập nhật yêu cầu");
        const l = await serviceRequestsApi.listBySession(
          requestsSessionId,
          1,
          100
        );
        setRequests(l.data?.requests || []);
        setEditReq(null);
      } else {
        toast.error(res.message || "Cập nhật yêu cầu thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const { data: tablesRes, mutate: mutateTables } = useSWR(
    ["tables", hotelId, statusFilter],
    async () => {
      const params: TablesQueryParams = {
        hotelId: hotelId || undefined,
        page: 1,
        pageSize: 50,
        status: statusFilter === "all" ? undefined : statusFilter,
      };
      return tablesApi.listTables(params);
    }
  );

  const { data: sessionsRes, mutate: mutateSessions } = useSWR(
    ["sessions", hotelId],
    async () => {
      if (!hotelId) return undefined;
      return diningSessionsApi.getSessions({
        hotelId,
        status: sessionStatusFilter === "All" ? undefined : sessionStatusFilter,
        page: 1,
        pageSize: 50,
      });
    }
  );

  const tables = useMemo<TableDto[]>(() => tablesRes?.data || [], [tablesRes]);
  const sessions = useMemo<DiningSessionDto[]>(
    () => sessionsRes?.data?.sessions || [],
    [sessionsRes]
  );

  const filteredSessions = useMemo(() => {
    return (sessions || []).filter((s) => {
      const bySearch =
        !searchText ||
        (s.waiterName || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (s.notes || "")
          .toLowerCase()
          .includes(searchText.toLowerCase());
      const d = dayjs(s.startedAt);
      const byFrom =
        !fromDate || d.isSame(fromDate, "day") || d.isAfter(fromDate);
      const byTo = !toDate || d.isSame(toDate, "day") || d.isBefore(toDate);
      return bySearch && byFrom && byTo;
    });
  }, [sessions, searchText, fromDate, toDate]);

  const sessionsLoading = !sessionsRes;

  const filteredTables = useMemo(() => {
    const bySearch = (t: TableDto) =>
      !searchText || t.name.toLowerCase().includes(searchText.toLowerCase());
    return (tables || []).filter(bySearch);
  }, [tables, searchText]);

  const dayOptions: Option[] = useMemo(() => {
    const caps = Array.from(
      new Set((filteredTables || []).map((t) => t.capacity))
    ).sort((a, b) => a - b);
    return [{ value: -1, label: "Tất cả dãy" }].concat(
      caps.map((c) => ({ value: c, label: `Dãy ${c}` }))
    );
  }, [filteredTables]);

  const groupsToRender = useMemo(() => {
    return dayOptions
      .filter((o) => o.value !== -1)
      .filter((o) =>
        dayFilter === -1 ? true : String(o.value) === String(dayFilter)
      );
  }, [dayOptions, dayFilter]);

  const tableStatusChip = (status: number) => {
    const color =
      status === TableStatus.InUse
        ? "error"
        : status === TableStatus.Available
        ? "success"
        : "default";
    const label =
      status === TableStatus.InUse
        ? "Đang dùng"
        : status === TableStatus.Available
        ? "Trống"
        : String(status);
    return <Chip size="small" color={color as any} label={label} />;
  };

  const sessionForTable = (tableId: string) =>
    sessions.find((s) => s.tables?.some((t) => t.tableId === tableId));

  const handleTableClick = (t: TableDto) => {
    setSelectedTable(t);
    const s = sessionForTable(t.id);
    setActiveSession(s || null);
    if (s) {
      navigate(`/waiter/sessions/${s.id}`);
    } else {
      setAttachOpen(true);
    }
  };

  const handleCreated = async () => {
    await mutateSessions();
    await mutateTables();
    toast.success("Tạo phiên thành công");
  };

  const attachSelectedTable = async () => {
    if (!selectedTable || !selectedSessionId) return;
    try {
      const res = await diningSessionsApi.attachTable(
        selectedSessionId,
        selectedTable.id
      );
      if (res.isSuccess) {
        toast.success("Đã gắn bàn vào phiên");

        setAttachOpen(false);
        setSelectedSessionId("");
        await mutateSessions();
        await mutateTables();
      } else {
        toast.error(res.message || "Gắn bàn thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const deleteSessionAction = async (sessionId: string) => {
    try {
      const res = await diningSessionsApi.deleteSession(sessionId);
      if (res.isSuccess) {
        toast.success("Đã xóa phiên");

        await mutateSessions();
        await mutateTables();
      } else {
        toast.error(res.message || "Xóa phiên thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const openEdit = (s: DiningSessionDto) => {
    setEditSession(s);
    setEditNotes(s.notes || "");
    setEditGuests(Number(s.totalGuests || 0));
    setEditStartedAt(dayjs(s.startedAt));
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editSession) return;
    try {
      const res = await diningSessionsApi.updateSession(editSession.id, {
        notes: editNotes,
        totalGuests: editGuests,
        startedAt: editStartedAt ? editStartedAt.toISOString() : undefined,
      });
      if (res.isSuccess) {
        toast.success("Đã cập nhật phiên");

        setEditOpen(false);
        setEditSession(null);
        setEditStartedAt(null);
        await mutateSessions();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const refreshAll = async () => {
    await mutateSessions();
    await mutateTables();
  };

  useEffect(() => {
    if (!attachFromSessionOpen) return;
  }, [attachFromSessionOpen]);

  const openAttachForSession = (sessionId: string) => {
    setAttachSessionTargetId(sessionId);
    setAttachFromSessionOpen(true);
  };

  return (
    <Box>
      <PageTitle title="Phiên phục vụ" subtitle="Quản lý phiên phục vụ " />
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1}
        sx={{ mb: 2 }}
        justifyContent={"space-between"}
      >
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              label="Trạng thái"
              value={sessionStatusFilter}
              onChange={(e) => setSessionStatusFilter(e.target.value as any)}
            >
              <MenuItem value="All">Tất cả</MenuItem>
              <MenuItem value="Open">Đang mở</MenuItem>
              <MenuItem value="Ended">Đã kết thúc</MenuItem>
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={(v) => setFromDate(v)}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={(v) => setToDate(v)}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </LocalizationProvider>
        </Stack>
        <Button
          startIcon={<AddCircle />}
          variant="contained"
          onClick={() => setCreateOpen(true)}
        >
          Tạo phiên
        </Button>
      </Stack>
      <Box mt={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6">Danh sách phiên</Typography>
          <Chip
            label={`Đang mở: ${sessions.length}`}
            color="primary"
            size="small"
          />
        </Stack>
        <Grid container spacing={2} mt={1}>
          {filteredSessions.map((s) => (
            <Grid key={s.id} size={{ xs: 12, sm: 6, lg: 4 }}>
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
                      {new Date(s.startedAt).toLocaleString()}
                    </Typography>
                    <Chip label="Đang mở" color="primary" size="small" />
                  </Box>
                  <Stack spacing={0.5} sx={{ px: 2, py: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Groups fontSize="small" color="disabled" />
                      <Typography variant="caption" color="text.secondary">
                        {s.totalGuests} khách
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TableRestaurantIcon fontSize="small" color="disabled" />
                      <Typography variant="caption" color="text.secondary">
                        {(s.tables || []).length} bàn đã gắn:
                        {(s.tables || []).length > 0 && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            {" "}
                            {(
                              s.tables.sort((a, b) =>
                                a.tableName.localeCompare(b.tableName)
                              ) || []
                            )
                              .map((t) => t.tableName)
                              .join(", ")}
                          </Typography>
                        )}
                      </Typography>
                    </Stack>

                    {!!s.notes && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CleanHands fontSize="small" color="disabled" />
                        <Typography variant="caption" color="text.secondary">
                          Ghi chú: {s.notes}
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
                      fullWidth
                      variant="contained"
                      startIcon={<Info />}
                      onClick={() => navigate(`${s.id}`)}
                    >
                      Chi tiết
                    </Button>
                  </Stack>
              </Card>
            </Grid>
            ))}
        </Grid>
        {filteredSessions.length === 0 && !sessionsLoading && (
          <EmptyState
            title="Không có phiên phục vụ"
            description="Không tìm thấy kết quả phù hợp. Thử thay đổi bộ lọc hoặc từ khóa."
            icon={<FoodBank color="disabled" sx={{ fontSize: 40 }} />}
            height={200}
          />
        )}
      </Box>

      <CreateSessionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => handleCreated()}
      />

      {activeSession && (
        <AssignOrderDialog
          open={assignOpen}
          sessionId={activeSession.id}
          onClose={() => setAssignOpen(false)}
          onAssigned={async () => {
            await mutateSessions();
          }}
        />
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
            <AssignMultipleTableDialog
              sessionId={attachSessionTargetId}
              onAssigned={async () => {
                setAttachFromSessionOpen(false);
                setAttachSessionTargetId("");
                await refreshAll();
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachFromSessionOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={requestsOpen}
        onClose={() => setRequestsOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Yêu cầu thêm</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems="center"
            >
              <TextField
                select
                label="Loại"
                size="small"
                sx={{ minWidth: 180 }}
                value={reqTypeFilter}
                onChange={(e) => setReqTypeFilter(String(e.target.value))}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {requestTypes.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Trạng thái"
                size="small"
                sx={{ minWidth: 180 }}
                value={reqStatusFilter}
                onChange={(e) => setReqStatusFilter(String(e.target.value))}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="Pending">Chờ</MenuItem>
                <MenuItem value="InProgress">Đang làm</MenuItem>
                <MenuItem value="Completed">Hoàn tất</MenuItem>
                <MenuItem value="Cancelled">Huỷ</MenuItem>
              </TextField>
              <TextField
                label="Tìm kiếm"
                size="small"
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems="center"
            >
              <TextField
                select
                label="Loại yêu cầu"
                size="small"
                value={newReqType}
                onChange={(e) => setNewReqType(String(e.target.value))}
                sx={{ minWidth: 200 }}
              >
                {requestTypes.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Mô tả"
                size="small"
                value={newReqDesc}
                onChange={(e) => setNewReqDesc(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={createRequest}
                disabled={!newReqDesc}
              >
                Thêm
              </Button>
            </Stack>

            <List>
              {requestsLoading && (
                <Typography variant="body2" color="text.secondary">
                  Đang tải...
                </Typography>
              )}
              {!requestsLoading &&
                filteredRequests.map((r) => (
                  <ListItem
                    key={r.id}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => startRequest(r.id)}>
                          Bắt đầu
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => completeRequest(r.id)}
                        >
                          Hoàn tất
                        </Button>
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => cancelRequest(r.id)}
                        >
                          Huỷ
                        </Button>
                        <Button
                          size="small"
                          color="info"
                          onClick={() => openEditRequest(r)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setDeleteReqId(r.id)}
                        >
                          Xóa
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={`${
                        requestTypes.find((t) => t.value === r.requestType)
                          ?.label || r.requestType
                      } • ${r.description}`}
                      secondary={`${new Date(r.createdAt).toLocaleString()} • ${
                        r.status
                      }${r.assignedToName ? " • " + r.assignedToName : ""}`}
                    />
                  </ListItem>
                ))}
              {!requestsLoading && filteredRequests.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Không có yêu cầu
                </Typography>
              )}
            </List>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestsOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editReq} onClose={() => setEditReq(null)}>
        <DialogTitle>Sửa yêu cầu</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              select
              label="Loại"
              size="small"
              value={editReqType}
              onChange={(e) => setEditReqType(String(e.target.value))}
            >
              {requestTypes.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Mô tả"
              size="small"
              value={editReqDesc}
              onChange={(e) => setEditReqDesc(e.target.value)}
              multiline
              minRows={2}
            />
            <TextField
              select
              label="Trạng thái"
              size="small"
              value={editReqStatus}
              onChange={(e) => setEditReqStatus(String(e.target.value))}
            >
              <MenuItem value="Pending">Chờ</MenuItem>
              <MenuItem value="InProgress">Đang làm</MenuItem>
              <MenuItem value="Completed">Hoàn tất</MenuItem>
              <MenuItem value="Cancelled">Huỷ</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditReq(null)}>Đóng</Button>
          <Button variant="contained" onClick={saveEditRequest}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

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
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Gắn bàn vào phiên</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Phiên</InputLabel>
            <Select
              label="Phiên"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(String(e.target.value))}
            >
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {new Date(s.startedAt).toLocaleString()} • {s.totalGuests}{" "}
                  khách
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachOpen(false)}>Đóng</Button>
          <Button
            variant="contained"
            disabled={!selectedSessionId}
            onClick={attachSelectedTable}
          >
            Gắn
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
            onClick={async () => {
              if (!deleteTargetId) return;
              await deleteSessionAction(deleteTargetId);
              setDeleteTargetId(null);
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
