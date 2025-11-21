import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import useSWR from "swr";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import tablesApi, {
  type TableDto,
  type TablesQueryParams,
  TableStatus,
} from "../../../../api/tablesApi";
import diningSessionsApi, {
  type DiningSessionDto,
} from "../../../../api/diningSessionsApi";
import CreateSessionDialog from "./components/CreateSessionDialog";
import AssignOrderDialog from "./components/AssignOrderDialog";
import { useNavigate } from "react-router-dom";

export default function SessionBoardPage() {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [selectedTable, setSelectedTable] = useState<TableDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<DiningSessionDto | null>(
    null
  );
  const navigate = useNavigate();

  const { data: tablesRes, mutate: mutateTables } = useSWR(
    ["tables", hotelId],
    async () => {
      const params: TablesQueryParams = {
        hotelId: hotelId || undefined,
        page: 1,
        pageSize: 50,
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
    sessions.find((s) => s.tableId === tableId);

  const handleTableClick = (t: TableDto) => {
    setSelectedTable(t);
    const s = sessionForTable(t.id);
    setActiveSession(s || null);
    if (s) {
      navigate(`/waiter/sessions/${s.id}`);
    } else {
      setCreateOpen(true);
    }
  };

  const handleCreated = async () => {
    await mutateSessions();
    await mutateTables();
  };

  return (
    <Box p={2}>
      <Typography variant="h5">Phiên phục vụ</Typography>
      <Grid container spacing={2} mt={1}>
        {tables.map((t) => (
          <Grid key={t.id} item xs={12} sm={6} md={3} lg={2}>
            <Card
              onClick={() => handleTableClick(t)}
              sx={{ cursor: "pointer" }}
            >
              <CardContent>
                <Typography variant="subtitle1">{t.name}</Typography>
                <Typography variant="caption">{t.capacity} chỗ</Typography>
                <Box mt={1}>{tableStatusChip(t.status)}</Box>
                {sessionForTable(t.id) && (
                  <Box mt={1}>
                    <Chip label="Phiên đang mở" color="primary" size="small" />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedTable && (
        <CreateSessionDialog
          open={createOpen}
          tableId={selectedTable.id}
          onClose={() => setCreateOpen(false)}
          onCreated={() => handleCreated()}
        />
      )}

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

      <Box mt={2}>
        <Button
          variant="outlined"
          onClick={() => setAssignOpen(true)}
          disabled={!activeSession}
        >
          Gắn Order vào phiên
        </Button>
      </Box>
    </Box>
  );
}
