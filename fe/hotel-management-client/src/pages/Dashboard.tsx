import { Grid, Card, CardContent, CardHeader, Box, Stack, Typography, useMediaQuery } from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { LineChart, BarChart, PieChart } from "@mui/x-charts";
import PageHeader from "../components/PageHeader";

// Use icon component references instead of elements so we can size responsively
const kpiItems = [
  {
    title: "Công suất (OCC)",
    value: "72%",
    icon: HotelIcon,
    color: "#4F46E5",
    subtext: "+5% so với tuần trước",
  },
  {
    title: "ADR",
    value: "1.200.000₫",
    icon: PriceChangeIcon,
    color: "#059669",
    subtext: "+80.000₫ tuần này",
  },
  {
    title: "RevPAR",
    value: "864.000₫",
    icon: PointOfSaleIcon,
    color: "#DB2777",
    subtext: "+3% theo ngày",
  },
  {
    title: "F&B sales",
    value: "25.300.000₫",
    icon: RestaurantMenuIcon,
    color: "#2563EB",
    subtext: "+1.8M hôm nay",
  },
];

export default function Dashboard() {
  // Sample chart data
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const occSeries = [62, 64, 66, 69, 70, 75, 72];
  const roomRevenue = [8.2, 9.1, 9.8, 10.2, 10.9, 12.1, 11.4]; // millions
  const fnbRevenue = [2.3, 2.6, 2.8, 3.0, 3.2, 3.6, 3.1];
  const roomStatus = [
    { label: "Occupied", value: 68 },
    { label: "Available", value: 25 },
    { label: "Dirty", value: 6 },
    { label: "OOO", value: 1 },
  ];

  const isSmall = useMediaQuery("(max-width:900px)");
  const chartHeight = isSmall ? 240 : 300;
  const barHeight = isSmall ? 280 : 320;

  return (
    <Stack spacing={2}>
      <PageHeader title="Dashboard" subtitle="Tổng quan hiệu suất và doanh thu" />

      {/* KPI cards */}
      <Grid container spacing={2}>
        {kpiItems.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.title}>
            <Card
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                background: `linear-gradient(180deg, ${kpi.color}14, transparent)`,
              }}
            >
              <CardHeader
                avatar={
                  <Box sx={{ color: kpi.color }}>
                    {/** Render icon with moderate size */}
                    {(() => {
                      const IconComp = kpi.icon as any;
                      return <IconComp sx={{ fontSize: isSmall ? 28 : 32 }} />;
                    })()}
                  </Box>
                }
                title={<Typography variant="subtitle2">{kpi.title}</Typography>}
                subheader={
                  <Typography variant="caption" color="text.secondary">
                    {kpi.subtext}
                  </Typography>
                }
              />
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <CardHeader title="Xu hướng công suất theo ngày" />
            <CardContent>
              <LineChart
                height={chartHeight}
                xAxis={[{ data: days }]}
                series={[{ data: occSeries, label: "OCC %", color: "#4F46E5" }]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <CardHeader title="Tỷ lệ trạng thái phòng" />
            <CardContent>
              <PieChart
                height={chartHeight}
                series={[{
                  data: roomStatus.map((s, i) => ({ id: i, value: s.value, label: s.label })),
                }]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue bar chart */}
      <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <CardHeader title="Doanh thu theo ngày (triệu)" />
        <CardContent>
          <BarChart
            height={barHeight}
            xAxis={[{ data: days, scaleType: "band" }]}
            series={[
              { data: roomRevenue, label: "Phòng", color: "#059669" },
              { data: fnbRevenue, label: "F&B", color: "#2563EB" },
            ]}
            grid={{ horizontal: true }}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
