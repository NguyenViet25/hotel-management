import { Box, Typography } from "@mui/material";
import DataTable, { type Column } from "../common/DataTable";
import { type HousekeepingTaskDto } from "../../api/housekeepingTasksApi";

type Props = {
  title?: string;
  tasks: HousekeepingTaskDto[];
  loading?: boolean;
};

export default function HousekeepingTasksTable({
  title,
  tasks,
  loading,
}: Props) {
  const columns: Column<HousekeepingTaskDto>[] = [
    { id: "roomNumber", label: "Phòng", minWidth: 90 },
    { id: "floor", label: "Tầng", minWidth: 60, format: (v) => String(v) },
    {
      id: "assignedToName",
      label: "Nhân viên",
      minWidth: 140,
      format: (v) => v || "—",
    },
    { id: "notes", label: "Ghi chú", minWidth: 220, format: (v) => v || "—" },
    {
      id: "createdAt",
      label: "Tạo lúc",
      minWidth: 140,
      format: (v) => new Date(v).toLocaleString(),
    },
    {
      id: "startedAt",
      label: "Bắt đầu",
      minWidth: 140,
      format: (v) => (v ? new Date(v).toLocaleString() : "—"),
    },
    {
      id: "completedAt",
      label: "Hoàn tất",
      minWidth: 140,
      format: (v) => (v ? new Date(v).toLocaleString() : "—"),
    },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      {title && (
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      <DataTable
        columns={columns}
        data={tasks}
        loading={loading}
        getRowId={(t) => t.id}
        actionColumn={false}
      />
    </Box>
  );
}
