import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import dashboardApi, {
  type HousekeeperDashboardSummary,
} from "../../../api/dashboardApi";
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
        subtitle={"Xem danh sách nhiệm vụ, cập nhật trạng thái dọn phòng"}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Phòng bẩn</Typography>
                <Typography variant="h5" color="error.main">
                  {hkLoading
                    ? "—"
                    : hkSummary?.dirtyRoomsCount ?? summary?.dirtyRooms ?? 0}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Đang dọn</Typography>
                <Typography variant="h5" color="info.main">
                  {rooms.filter((r) => r.status === RoomStatus.Cleaning).length}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Đã sạch</Typography>
                <Typography variant="h5" color="success.main">
                  {summary?.cleanRooms ?? 0}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">
                  Nhiệm vụ đang hoạt động
                </Typography>
                <Typography variant="h5" color="text.primary">
                  {hkLoading
                    ? "—"
                    : hkSummary?.assignedActiveTasks ?? tasks.length}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
