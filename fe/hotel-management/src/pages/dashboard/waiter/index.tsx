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
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PageTitle from "../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../hooks/useStore";
import dashboardApi, {
  type WaiterDashboardSummary,
} from "../../../api/dashboardApi";

const WaiterDashboard: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [summary, setSummary] = useState<WaiterDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!hotelId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardApi.getWaiterSummary(hotelId);
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
        subtitle="Theo dõi bàn đang hoạt động và đơn đang xử lý"
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
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#FFF8E1" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#FFE082",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TableRestaurantIcon color="warning" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bàn đang hoạt động
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.openDiningSessions ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
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
                    Đơn đang xử lý
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.inProgressOrders ?? "—"}
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

export default WaiterDashboard;
