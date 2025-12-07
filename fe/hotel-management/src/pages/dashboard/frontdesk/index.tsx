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
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PageTitle from "../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../hooks/useStore";
import dashboardApi, {
  type FrontDeskDashboardSummary,
} from "../../../api/dashboardApi";

const FrontDeskDashboard: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [summary, setSummary] = useState<FrontDeskDashboardSummary | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!hotelId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardApi.getFrontDeskSummary(hotelId);
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
        subtitle="Theo dõi trạng thái yêu cầu đặt phòng"
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
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
                  <HourglassEmptyIcon color="warning" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Yêu cầu chờ xác nhận
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.pendingBookings ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
                  <CheckCircleOutlineIcon color="success" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đã xác nhận
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.confirmedBookings ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
                  <DoneAllIcon color="primary" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hoàn tất
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.completedBookings ?? "—"}
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

export default FrontDeskDashboard;
