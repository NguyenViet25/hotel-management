import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupsIcon from "@mui/icons-material/Groups";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dashboardApi, {
  type AdminDashboardSummary,
} from "../../../api/dashboardApi";
import hotelService, { type Hotel } from "../../../api/hotelService";
import type { RevenueStatsDto } from "../../../api/revenueApi";
import EmptyState from "../../../components/common/EmptyState";
import PageTitle from "../../../components/common/PageTitle";
const currency = (v: number) => `${Math.round(Number(v)).toLocaleString()} đ`;

const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [revStats, setRevStats] = useState<RevenueStatsDto | null>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [revError, setRevError] = useState<string | null>(null);

  const [from, setFrom] = useState(dayjs().startOf("month"));
  const [to, setTo] = useState(dayjs().endOf("month"));
  const [granularity, setGranularity] = useState<"day" | "month">("day");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotelId] = useState<string>(" ");

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
      setRevError(null);
      try {
        const res = await dashboardApi.getAdminRevenue({
          hotelId: hotelId || undefined,
          fromDate: from.startOf("day").toISOString(),
          toDate: to.endOf("day").toISOString(),
          granularity,
        });
        if (res.isSuccess) setRevStats(res.data);
        else setRevError(res.message || "Không thể tải doanh thu");
      } catch {
        setRevError("Không thể tải doanh thu");
      }
    };
    run();
  }, [from, to, granularity, hotelId]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await hotelService.getHotels({
          page: 1,
          pageSize: 1000,
          sortBy: "name",
          sortDir: "asc",
        });
        if (res.isSuccess) setHotels(res.data);
      } catch {
        setHotels([]);
      }
    };
    run();
  }, []);

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

      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Biểu đồ doanh thu toàn hệ thống
        </Typography>
        <Stack spacing={2} direction={{ xs: "column", lg: "row" }}>
          <TextField
            select
            label="Cơ sở"
            size="small"
            sx={{ minWidth: 220 }}
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
          >
            <MenuItem value=" ">Toàn hệ thống</MenuItem>
            {hotels.map((h) => (
              <MenuItem key={h.id} value={h.id}>
                {h.name}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="Từ ngày"
            value={from}
            onChange={(v) => v && setFrom(v)}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label="Đến ngày"
            value={to}
            onChange={(v) => v && setTo(v)}
            slotProps={{ textField: { size: "small" } }}
          />
          <TextField
            select
            label="Phân tách"
            size="small"
            sx={{ minWidth: 180 }}
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as "day" | "month")}
          >
            <MenuItem value="day">Theo ngày</MenuItem>
            <MenuItem value="month">Theo tháng</MenuItem>
          </TextField>
        </Stack>

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Tổng doanh thu
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {Math.round(Number(revStats?.total || 0)).toLocaleString()} đ
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Số hóa đơn
                </Typography>
                <Typography variant="h6">{revStats?.count || 0}</Typography>
              </Stack>
            </CardContent>
          </Card>
          <Box sx={{ flex: 3, height: 300 }}>
            {revError ? (
              <Alert severity="error">{revError}</Alert>
            ) : (revStats?.points?.length ?? 0) === 0 ? (
              <EmptyState
                title="Không có dữ liệu doanh thu"
                description="Hãy điều chỉnh khoảng thời gian hoặc chọn cơ sở khác"
              />
            ) : (
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={(revStats?.points || []).map((p) => ({
                      date: dayjs(p.date).format(
                        granularity === "month" ? "MM/YYYY" : "DD/MM"
                      ),
                      total: Number(p.total || 0),
                    }))}
                    margin={{ left: 8, right: 16, top: 12, bottom: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(v) =>
                        Math.round(Number(v) / 1000).toLocaleString() + "k"
                      }
                    />
                    <Tooltip formatter={(v) => currency(Number(v as number))} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#5563DE"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default AdminDashboardPage;
