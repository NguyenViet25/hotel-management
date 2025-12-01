import {
  AccessTime,
  AddCircle,
  Groups,
  Search,
  TableRestaurant as TableRestaurantIcon,
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
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import diningSessionsApi, {
  type DiningSessionDto,
} from "../../../../api/diningSessionsApi";
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
  const [availableAttachTables, setAvailableAttachTables] = useState<
    TableDto[]
  >([]);
  const [selectedAttachTableId, setSelectedAttachTableId] =
    useState<string>("");
  const [attachSearch, setAttachSearch] = useState("");
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
        status: "Open",
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
    setSnackbar({
      open: true,
      message: "Tạo phiên thành công",
      severity: "success",
    });
  };

  const attachSelectedTable = async () => {
    if (!selectedTable || !selectedSessionId) return;
    try {
      const res = await diningSessionsApi.attachTable(
        selectedSessionId,
        selectedTable.id
      );
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã gắn bàn vào phiên",
          severity: "success",
        });
        setAttachOpen(false);
        setSelectedSessionId("");
        await mutateSessions();
        await mutateTables();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Gắn bàn thất bại",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi", severity: "error" });
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const res = await diningSessionsApi.endSession(sessionId);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã kết thúc phiên",
          severity: "success",
        });
        await mutateSessions();
        await mutateTables();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Kết thúc phiên thất bại",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi", severity: "error" });
    }
  };

  const refreshAll = async () => {
    await mutateSessions();
    await mutateTables();
  };

  useEffect(() => {
    const loadAvailable = async () => {
      if (!hotelId) return;
      const res = await tablesApi.listTables({
        hotelId,
        status: TableStatus.Available,
        page: 1,
        pageSize: 100,
      });
      setAvailableAttachTables(res.data || []);
    };
    if (attachFromSessionOpen) {
      setSelectedAttachTableId("");
      loadAvailable();
    }
  }, [attachFromSessionOpen, hotelId]);

  const openAttachForSession = (sessionId: string) => {
    setAttachSessionTargetId(sessionId);
    setAttachFromSessionOpen(true);
  };

  const confirmAttachForSession = async () => {
    if (!attachSessionTargetId || !selectedAttachTableId) return;
    try {
      const res = await diningSessionsApi.attachTable(
        attachSessionTargetId,
        selectedAttachTableId
      );
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã gắn bàn vào phiên",
          severity: "success",
        });
        setAttachFromSessionOpen(false);
        setAttachSessionTargetId("");
        setSelectedAttachTableId("");
        await refreshAll();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Gắn bàn thất bại",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi", severity: "error" });
    }
  };

  return (
    <Box>
      <PageTitle title="Phiên phục vụ" subtitle="Quản lý phiên phục vụ " />
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ mb: 2 }}
        justifyContent={"space-between"}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems="center"
        >
          <TextField
            placeholder="Tìm kiếm phiên..."
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 320 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
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
          {sessions.map((s) => (
            <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                  <AccessTime color="primary" />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, flexGrow: 1 }}
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
                      Bàn đã gắn: {(s.tables || []).length}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ position: "absolute", bottom: 8, right: 8 }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(`/waiter/sessions/${s.id}`)}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openAttachForSession(s.id)}
                  >
                    Gắn bàn
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => endSession(s.id)}
                  >
                    Kết thúc
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
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

      <Snackbar
        open={!!snackbar?.open}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      />

      <Dialog
        open={attachFromSessionOpen}
        onClose={() => setAttachFromSessionOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Gắn bàn vào phiên</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <AssignMultipleTableDialog />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachFromSessionOpen(false)}>Đóng</Button>
          <Button
            variant="contained"
            disabled={!selectedAttachTableId}
            onClick={confirmAttachForSession}
          >
            Gắn
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
    </Box>
  );
}
