import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PageTitle from "../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../hooks/useStore";
import dashboardApi, {
  type KitchenDashboardSummary,
} from "../../../api/dashboardApi";
import { CheckCircle, FoodBank, WaterfallChart } from "@mui/icons-material";

const KitchenDashboard: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [summary, setSummary] = useState<KitchenDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!hotelId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardApi.getKitchenSummary(hotelId);
        if (res.isSuccess) setSummary(res.data);
        else setError(res.message || "Không thể tải tổng quan");
      } catch {
        setError("Không thể tải tổng quan");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [hotelId]);

  return (
    <Box>
      <PageTitle
        title="Tổng quan"
        subtitle="Theo dõi món chờ chế biến và đơn đang xử lý"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!hotelId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Vui lòng chọn cơ sở làm việc để xem thống kê.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
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
                  <FastfoodIcon color="warning" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tổng đơn
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.pendingOrderItems ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
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
                  <ReceiptLongIcon color="primary" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đơn đang nấu
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.inProgressOrders ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#C8E6C9" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#A5D6A7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FoodBank color="primary" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đơn sẵn sàng
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.readyOrders ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 2, bgcolor: "lightgreen" }}
          >
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
                  <CheckCircle color="primary" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đơn hoàn thành
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.completedOrders ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KitchenDashboard;
