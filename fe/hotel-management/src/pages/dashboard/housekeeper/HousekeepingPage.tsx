import {
  AssignmentInd,
  CheckCircle,
  CleaningServices,
  Hotel,
} from "@mui/icons-material";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { type HousekeeperDashboardSummary } from "../../../api/dashboardApi";
import housekeepingApi from "../../../api/housekeepingApi";
import housekeepingTasksApi, {
  type HousekeepingTaskDto,
} from "../../../api/housekeepingTasksApi";
import roomsApi, { RoomStatus, type RoomDto } from "../../../api/roomsApi";
import PageTitle from "../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../hooks/useStore";

export default function HousekeepingPage() {
  const { hotelId, user } = useStore<StoreState>((s) => s);

  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{
    cleanRooms: number;
    dirtyRooms: number;
    maintenanceRooms: number;
    occupiedRooms: number;
    outOfServiceRooms: number;
    totalRooms: number;
  } | null>(null);

  const [tasks, setTasks] = useState<HousekeepingTaskDto[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [hkSummary, setHkSummary] =
    useState<HousekeeperDashboardSummary | null>(null);
  const [hkLoading, setHkLoading] = useState(false);

  const refresh = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const res = await roomsApi.getRooms({ hotelId, page: 1, pageSize: 500 });
      if (res.isSuccess) setRooms(res.data);
      const sum = await housekeepingApi.getSummary(hotelId);
      if (sum.isSuccess && sum.data) setSummary(sum.data);
      await refreshTasks();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const refreshTasks = async () => {
    if (!hotelId || !user?.id) return;
    setTasksLoading(true);
    try {
      const res = await housekeepingTasksApi.list({
        hotelId,
        assignedToUserId: user.id,
        onlyActive: true,
      });
      if (res.isSuccess && Array.isArray(res.data)) setTasks(res.data);
    } finally {
      setTasksLoading(false);
    }
  };

  return (
    <Box>
      <PageTitle
        title={"Buồng phòng"}
        subtitle={"Xem tổng quan nhiệm vụ, trạng thái dọn phòng"}
      />

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "#FFEBEE" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#FFCDD2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Hotel color="error" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phòng bẩn
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {hkLoading
                      ? "—"
                      : hkSummary?.dirtyRoomsCount ?? summary?.dirtyRooms ?? 0}
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
                  <CleaningServices color="info" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đang dọn
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading
                      ? "—"
                      : rooms.filter((r) => r.status === RoomStatus.Cleaning)
                          .length}
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
                  <CheckCircle color="success" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Đã sạch
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {loading ? "—" : summary?.cleanRooms ?? 0}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
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
                  <AssignmentInd color="warning" />
                </Box>
                <Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nhiệm vụ đang hoạt động
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {hkLoading
                      ? "—"
                      : hkSummary?.assignedActiveTasks ?? tasks.length}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
