import { AddCircle, AddTask } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
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
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import AssignOrderDialog from "./components/AssignOrderDialog";
import CreateSessionDialog from "./components/CreateSessionDialog";

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
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent={"space-between"}
        mt={1}
        mb={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value={TableStatus.Available}>Trống</MenuItem>
            <MenuItem value={TableStatus.InUse}>Đang dùng</MenuItem>
            <MenuItem value={TableStatus.Reserved}>Đặt trước</MenuItem>
            <MenuItem value={TableStatus.OutOfService}>Ngưng phục vụ</MenuItem>
          </Select>
          <Chip
            label={`Đang mở: ${sessions.length}`}
            color="primary"
            size="small"
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
        <Typography variant="h6">Danh sách phiên</Typography>
        <List>
          {sessions.map((s) => (
            <ListItem
              key={s.id}
              secondaryAction={
                <Stack direction="row" spacing={1}>
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
              }
            >
              <ListItemText
                primary={`${new Date(s.startedAt).toLocaleString()} • ${
                  s.totalGuests
                } khách`}
                secondary={`Bàn đã gắn: ${(s.tables || []).length}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Danh sách bàn
      </Typography>
      <Grid container spacing={2} mt={1}>
        {tables.map((t) => (
          <Grid key={t.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              onClick={() => handleTableClick(t)}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
              }}
              variant="outlined"
            >
              <CardContent>
                <Typography variant="subtitle1">{t.name}</Typography>
                <Typography variant="caption">{t.capacity} chỗ</Typography>
                <Box mt={1}>{tableStatusChip(t.status)}</Box>
                {sessionForTable(t.id) && (
                  <Box mt={1}>
                    <Chip label="Phiên đang mở" color="primary" size="small" />
                    <Stack direction="row" spacing={1} mt={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/waiter/sessions/${sessionForTable(t.id)!.id}`
                          );
                        }}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSession(sessionForTable(t.id)!);
                          setAssignOpen(true);
                        }}
                      >
                        Gắn Order
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const s = sessionForTable(t.id)!;
                          try {
                            const res = await diningSessionsApi.detachTable(
                              s.id,
                              t.id
                            );
                            if (res.isSuccess) {
                              setSnackbar({
                                open: true,
                                message: "Đã tách bàn khỏi phiên",
                                severity: "success",
                              });
                              await mutateSessions();
                              await mutateTables();
                            } else {
                              setSnackbar({
                                open: true,
                                message: res.message || "Tách bàn thất bại",
                                severity: "error",
                              });
                            }
                          } catch {
                            setSnackbar({
                              open: true,
                              message: "Đã xảy ra lỗi",
                              severity: "error",
                            });
                          }
                        }}
                      >
                        Tách bàn
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          endSession(sessionForTable(t.id)!.id);
                        }}
                      >
                        Kết thúc
                      </Button>
                    </Stack>
                  </Box>
                )}
                {!sessionForTable(t.id) &&
                  t.status === TableStatus.Available && (
                    <Box mt={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="inherit"
                        startIcon={<AddTask />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTable(t);
                          setAttachOpen(true);
                        }}
                      >
                        Gắn vào phiên
                      </Button>
                    </Box>
                  )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
        maxWidth="sm"
      >
        <DialogTitle>Gắn bàn vào phiên</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Bàn</InputLabel>
            <Select
              label="Bàn"
              value={selectedAttachTableId}
              onChange={(e) => setSelectedAttachTableId(String(e.target.value))}
            >
              {availableAttachTables.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} • {t.capacity} chỗ
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
