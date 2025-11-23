import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PageTitle from "../../../components/common/PageTitle";
import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupsIcon from "@mui/icons-material/Groups";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import dayjs from "dayjs";

type Facility = { id: string; name: string };
type User = { id: string; name: string };
type AuditLogItem = {
  id: string;
  action: string;
  user: string | null;
  timestamp: string;
};

const mockFetchFacilities = async (): Promise<Facility[]> => {
  await new Promise((r) => setTimeout(r, 500));
  return [
    { id: "h1", name: "Hotel Alpha" },
    { id: "h2", name: "Hotel Beta" },
    { id: "h3", name: "Hotel Gamma" },
    { id: "h4", name: "Hotel Delta" },
    { id: "h5", name: "Hotel Epsilon" },
  ];
};

const mockFetchUsers = async (): Promise<User[]> => {
  await new Promise((r) => setTimeout(r, 600));
  return Array.from({ length: 24 }).map((_, i) => ({
    id: `u${i + 1}`,
    name: `User ${i + 1}`,
  }));
};

const mockFetchAuditLogs = async (): Promise<AuditLogItem[]> => {
  await new Promise((r) => setTimeout(r, 800));
  const actions = [
    "CREATE_USER",
    "UPDATE_FACILITY",
    "LOGIN",
    "LOGOUT",
    "DELETE_USER",
    "ASSIGN_ROLE",
  ];
  const now = dayjs();
  return Array.from({ length: 50 }).map((_, i) => ({
    id: `${i + 1}`,
    action: actions[i % actions.length],
    user: i % 5 === 0 ? null : `User ${((i % 24) + 1).toString()}`,
    timestamp: now.subtract(i * 30, "minute").toISOString(),
  }));
};

const AdminDashboardPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "timestamp", sort: "desc" },
  ]);

  useEffect(() => {
    const run = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const [fRes, uRes] = await Promise.all([
          mockFetchFacilities(),
          mockFetchUsers(),
        ]);
        setFacilities(fRes);
        setUsers(uRes);
      } catch {
        setSummaryError("Không thể tải tổng quan");
      } finally {
        setSummaryLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      setTableLoading(true);
      setTableError(null);
      try {
        const logs = await mockFetchAuditLogs();
        setAuditLogs(logs);
      } catch {
        setTableError("Không thể tải nhật ký");
      } finally {
        setTableLoading(false);
      }
    };
    run();
  }, []);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "id", headerName: "ID", minWidth: 80 },
      { field: "action", headerName: "Hành động", flex: 1, minWidth: 160 },
      {
        field: "user",
        headerName: "Người dùng",
        flex: 1,
        minWidth: 160,
        valueGetter: (params: any) => params || "admin",
      },
      {
        field: "timestamp",
        headerName: "Thời gian",
        minWidth: 180,
        valueFormatter: (params: any) =>
          dayjs(params?.value as string).format("DD/MM/YYYY HH:mm"),
        sortable: true,
      },
    ],
    []
  );

  return (
    <Box>
      <PageTitle
        title="Tổng quan"
        subtitle="Xem thống kê, cơ sở, người dùng và hoạt động hệ thống"
      />

      {summaryError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {summaryError}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#E3F2FD" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#BBDEFB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ApartmentIcon color="primary" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tổng cơ sở
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {summaryLoading ? "—" : facilities.length}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#E8F5E9" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#C8E6C9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GroupsIcon color="success" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tổng người dùng
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {summaryLoading ? "—" : users.length}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#FFF3E0" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#FFE0B2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ListAltIcon color="warning" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nhật ký hệ thống
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {summaryLoading ? "—" : auditLogs.length}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {tableError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {tableError}
        </Alert>
      )}

      <Box sx={{ height: 480 }}>
        <DataGrid
          rows={auditLogs}
          columns={columns}
          loading={tableLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20]}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          disableRowSelectionOnClick
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "action.hover",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;
