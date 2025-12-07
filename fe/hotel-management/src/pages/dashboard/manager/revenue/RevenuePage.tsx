import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import revenueApi, { type RevenueStatsDto } from "../../../../api/revenueApi";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const currency = (v: number) => `${Math.round(Number(v)).toLocaleString()} đ`;

const RevenuePage: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [from, setFrom] = useState<Dayjs>(dayjs().subtract(29, "day"));
  const [to, setTo] = useState<Dayjs>(dayjs());
  const [granularity, setGranularity] = useState<"day" | "month">("day");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RevenueStatsDto | null>(null);

  const chartData = useMemo(
    () =>
      (stats?.points || []).map((p) => ({
        date:
          granularity === "month"
            ? dayjs(p.date).format("MM/YYYY")
            : dayjs(p.date).format("DD/MM"),
        total: p.total,
      })),
    [stats, granularity]
  );

  const load = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const res = await revenueApi.getRevenue({
        hotelId,
        fromDate: from.startOf("day").toISOString(),
        toDate: to.endOf("day").toISOString(),
        granularity,
      });
      if (res.isSuccess) setStats(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, from, to, granularity]);

  return (
    <Box>
      <PageTitle title="Thống kê doanh thu" subtitle="Theo ngày/tháng" />

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Tổng doanh thu
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {currency(stats?.total || 0)}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Số hóa đơn
            </Typography>
            <Typography variant="h6">{stats?.count || 0}</Typography>
          </Stack>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="vi"
              >
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Phân nhóm"
                    value={granularity}
                    onChange={(e) => setGranularity(e.target.value as any)}
                    fullWidth
                  >
                    <MenuItem value="day">Theo ngày</MenuItem>
                    <MenuItem value="month">Theo tháng</MenuItem>
                  </TextField>
                  <DatePicker
                    label="Từ ngày"
                    value={from}
                    onChange={(v) => v && setFrom(v)}
                  />
                  <DatePicker
                    label="Đến ngày"
                    value={to}
                    onChange={(v) => v && setTo(v)}
                  />
                </Stack>
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardHeader title="Biểu đồ doanh thu" />
            <CardContent sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ left: 8, right: 16, top: 12, bottom: 12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(v) =>
                      Math.round(Number(v) / 1000).toLocaleString() + "k"
                    }
                  />
                  <Tooltip formatter={(v: any) => currency(Number(v))} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#5563DE"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RevenuePage;
