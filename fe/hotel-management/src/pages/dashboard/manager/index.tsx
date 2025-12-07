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
import KingBedIcon from "@mui/icons-material/KingBed";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import HomeIcon from "@mui/icons-material/Home";
import PageTitle from "../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../hooks/useStore";
import dashboardApi, {
  type ManagerDashboardSummary,
} from "../../../api/dashboardApi";
import RevenuePage from "./revenue/RevenuePage";

const ManagerDashboardPage: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [summary, setSummary] = useState<ManagerDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!hotelId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardApi.getManagerSummary(hotelId);
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
        subtitle="Theo dõi tình trạng phòng và công việc vệ sinh"
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

      <Grid container spacing={2} sx={{ mb: 2 }}>
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
                  <KingBedIcon color="primary" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phòng đang có khách
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.occupiedRoomsCount ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

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
                  <CleaningServicesIcon color="warning" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phòng bẩn
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.dirtyRoomsCount ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
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
                  <AssignmentTurnedInIcon color="success" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phòng đang được vệ sinh
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading
                      ? "—"
                      : summary?.activeHousekeepingTaskCount ?? "—"}
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
                  <HomeIcon color="primary" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tổng số phòng
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.roomSummary?.totalRooms ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <RevenuePage />
    </Box>
  );
};

export default ManagerDashboardPage;
