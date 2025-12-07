import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import PageTitle from "../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../hooks/useStore";
import housekeepingTasksApi, {
  type HousekeepingTaskDto,
} from "../../../api/housekeepingTasksApi";
import HousekeepingTasksTable from "../../../components/housekeeping/HousekeepingTasksTable";

export default function MyTask() {
  const { hotelId, user } = useStore<StoreState>((s) => s);
  const [tasks, setTasks] = useState<HousekeepingTaskDto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    if (!hotelId || !user?.id) return;
    setLoading(true);
    try {
      const res = await housekeepingTasksApi.list({
        hotelId,
        assignedToUserId: user.id,
        onlyActive: false,
      });
      if (res.isSuccess && Array.isArray(res.data)) setTasks(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [hotelId, user?.id]);

  return (
    <Box>
      <PageTitle
        title={"Lịch sử nhiệm vụ"}
        subtitle={"Danh sách nhiệm vụ của tôi"}
      />
      <HousekeepingTasksTable tasks={tasks} loading={loading} />
    </Box>
  );
}
