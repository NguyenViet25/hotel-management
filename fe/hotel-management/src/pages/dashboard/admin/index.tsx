import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupsIcon from "@mui/icons-material/Groups";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import auditService, { type AuditLogDto } from "../../../api/auditService";
import dashboardApi, {
  type AdminDashboardSummary,
} from "../../../api/dashboardApi";
import DataTable, { type Column } from "../../../components/common/DataTable";
import PageTitle from "../../../components/common/PageTitle";

const AdminDashboardPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const run = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const res = await dashboardApi.getAdminSummary();
        if (res.isSuccess) {
          setSummary(res.data);
        } else {
          setSummaryError(res.message || "Không thể tải tổng quan");
        }
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
        const from = dayjs().subtract(24, "hour").toISOString();
        const res = await auditService.getLogs({ page, pageSize, from });
        if ((res as any).isSuccess) {
          const rows = res.data;
          setAuditLogs(rows);
          setTotal((res as any).meta?.total ?? rows.length);
        } else {
          setTableError((res as any).message || "Không thể tải nhật ký");
        }
      } catch {
        setTableError("Không thể tải nhật ký");
      } finally {
        setTableLoading(false);
      }
    };
    run();
  }, [page, pageSize]);

  const columns: Column<AuditLogDto>[] = [
    {
      id: "action",
      label: "Hành động",
      minWidth: 150,
      sortable: true,
    },
    {
      id: "userId",
      label: "Người dùng",
      minWidth: 150,
      format: (value) => value || "Hệ thống",
    },
    {
      id: "hotelId",
      label: "Cơ sở",
      minWidth: 150,
      format: (value) => value || "N/A",
    },
    {
      id: "timestamp",
      label: "Thời gian",
      minWidth: 180,
      sortable: true,
      format: (value) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      id: "metadata",
      label: "Chi tiết",
      minWidth: 200,
      format: (value) => {
        if (!value) return "Không có chi tiết";
        try {
          return (
            <Box sx={{ maxWidth: 300, maxHeight: 100, overflow: "auto" }}>
              <pre style={{ margin: 0, fontSize: "0.75rem" }}>
                {JSON.stringify(value, null, 2)}
              </pre>
            </Box>
          );
        } catch (e) {
          return "Định dạng chi tiết không hợp lệ";
        }
      },
    },
  ];

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
                    {summaryLoading ? "—" : summary?.totalHotels ?? "—"}
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
                    {summaryLoading ? "—" : summary?.totalUsers ?? "—"}
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
                    {summaryLoading
                      ? "—"
                      : summary?.auditCountLast24Hours ?? "—"}
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
      <PageTitle subtitle="Hoạt động gần đây" />
      <DataTable
        columns={columns}
        data={auditLogs}
        loading={tableLoading}
        title="Nhật ký hoạt động"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (p) => setPage(p),
        }}
        getRowId={(row) => row.id}
        borderRadius={2}
      />
    </Box>
  );
};

export default AdminDashboardPage;
