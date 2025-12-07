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
import { Button } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import PageTitle from "../../../../components/common/PageTitle";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import revenueApi, {
  type RevenueStatsDto,
  type RevenueBreakdownDto,
  type RevenueDetailItemDto,
} from "../../../../api/revenueApi";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info, InfoOutline } from "@mui/icons-material";

const currency = (v: number) => `${Math.round(Number(v)).toLocaleString()} đ`;

const RevenuePage: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [from, setFrom] = useState<Dayjs>(dayjs().subtract(29, "day"));
  const [to, setTo] = useState<Dayjs>(dayjs());
  const [granularity, setGranularity] = useState<"day" | "month">("day");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RevenueStatsDto | null>(null);
  const [breakdown, setBreakdown] = useState<RevenueBreakdownDto | null>(null);
  const [details, setDetails] = useState<RevenueDetailItemDto[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(10);
  const [catFrom, setCatFrom] = useState<Dayjs>(from);
  const [catTo, setCatTo] = useState<Dayjs>(to);

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
      const br = await revenueApi.getBreakdown({
        hotelId,
        fromDate: from.startOf("day").toISOString(),
        toDate: to.endOf("day").toISOString(),
        granularity,
      });
      if (br.isSuccess) setBreakdown(br.data);
    } finally {
      setLoading(false);
    }
  };

  const totalDetails = details.length;
  const totalPages = Math.max(1, Math.ceil(totalDetails / detailPageSize));
  const pagedDetails = useMemo(() => {
    const start = (detailPage - 1) * detailPageSize;
    return details.slice(start, start + detailPageSize);
  }, [details, detailPage, detailPageSize]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, from, to, granularity]);

  return (
    <Box>
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

      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Biểu đồ doanh thu
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <Stack spacing={2} direction={{ xs: "column", lg: "row" }}>
            <TextField
              select
              label="Phân nhóm"
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as any)}
              fullWidth
              size="small"
              sx={{ width: { xs: "100%", lg: 180 } }}
            >
              <MenuItem value="day">Theo ngày</MenuItem>
              <MenuItem value="month">Theo tháng</MenuItem>
            </TextField>
            <DatePicker
              label="Từ ngày"
              value={from}
              onChange={(v) => v && setFrom(v)}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
            <DatePicker
              label="Đến ngày"
              value={to}
              onChange={(v) => v && setTo(v)}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Stack>
        </LocalizationProvider>
        <Box sx={{ height: 320 }} mt={2}>
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
        </Box>
      </Card>

      <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Doanh thu theo danh mục
        </Typography>
        <Box>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Stack
              spacing={2}
              direction={{ xs: "column", sm: "row" }}
              sx={{ mb: 1 }}
            >
              <DatePicker
                label="Từ ngày (lọc)"
                value={catFrom}
                onChange={(v) => v && setCatFrom(v)}
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
              />
              <DatePicker
                label="Đến ngày (lọc)"
                value={catTo}
                onChange={(v) => v && setCatTo(v)}
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Đặt phòng</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={700}>
                  {currency(breakdown?.roomTotal || 0)}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<InfoOutline />}
                  onClick={async () => {
                    const res = await revenueApi.getDetails({
                      hotelId: hotelId || "",
                      fromDate: catFrom.startOf("day").toISOString(),
                      toDate: catTo.endOf("day").toISOString(),
                      sourceType: 0,
                    });
                    if (res.isSuccess) {
                      setDetails(res.data);
                      setDetailPage(1);
                      setDetailOpen(true);
                    }
                  }}
                >
                  Chi tiết
                </Button>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Đặt đồ ăn</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={700}>
                  {currency(breakdown?.fnbTotal || 0)}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<InfoOutline />}
                  onClick={async () => {
                    const res = await revenueApi.getDetails({
                      hotelId: hotelId || "",
                      fromDate: catFrom.startOf("day").toISOString(),
                      toDate: catTo.endOf("day").toISOString(),
                      sourceType: 1,
                    });
                    if (res.isSuccess) {
                      setDetails(res.data);
                      setDetailPage(1);
                      setDetailOpen(true);
                    }
                  }}
                >
                  Chi tiết
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {detailOpen && (
          <Box mt={2}>
            {(() => {
              const columns: Column<RevenueDetailItemDto>[] = [
                {
                  id: "createdAt",
                  label: "Ngày",
                  minWidth: 120,
                  format: (v: string) => dayjs(v).format("DD/MM/YYYY"),
                },
                { id: "description", label: "Mô tả", minWidth: 200 },

                {
                  id: "sourceType",
                  label: "Danh mục",
                  minWidth: 120,
                  format: (v: number) =>
                    v === 0
                      ? "Đặt phòng"
                      : v === 1
                      ? "Đặt đồ ăn"
                      : v === 2
                      ? "Khác"
                      : "Giảm giá",
                },
                {
                  id: "amount",
                  label: "Số tiền",
                  align: "right",
                  minWidth: 120,
                  format: (v: number) => currency(Number(v)),
                },
              ];

              return (
                <DataTable<RevenueDetailItemDto>
                  columns={columns}
                  data={pagedDetails}
                  loading={loading}
                  pagination={{
                    page: detailPage,
                    pageSize: detailPageSize,
                    total: details.length,
                    onPageChange: (p) => setDetailPage(p),
                  }}
                  actionColumn={false}
                  getRowId={(row) => `${row.invoiceId}-${row.createdAt}`}
                />
              );
            })()}
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default RevenuePage;
