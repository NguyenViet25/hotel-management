import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import DataTable, { type Column } from "../common/DataTable";
import { type HousekeepingTaskDto } from "../../api/housekeepingTasksApi";
import bookingsApi, { type BookingIntervalDto } from "../../api/bookingsApi";
import React, { useState } from "react";
import { Info } from "@mui/icons-material";

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
  const [infoOpen, setInfoOpen] = useState(false);
  const [selected, setSelected] = useState<HousekeepingTaskDto | null>(null);
  const [minibarBookingId, setMinibarBookingId] = useState<string>("");

  const openInfo = async (t: HousekeepingTaskDto) => {
    setSelected(t);
    setMinibarBookingId("");
    try {
      const from = new Date(t.startedAt || t.createdAt);
      from.setHours(0, 0, 0, 0);
      const to = new Date(t.completedAt || t.startedAt || t.createdAt);
      to.setHours(23, 59, 59, 999);
      const schedRes = await bookingsApi.roomSchedule(
        t.roomId,
        from.toISOString(),
        to.toISOString()
      );
      const intervals = (schedRes.data || []) as BookingIntervalDto[];
      setMinibarBookingId(intervals[0]?.bookingId || "");
    } catch {
      setMinibarBookingId("");
    }
    setInfoOpen(true);
  };

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
    {
      id: "actions",
      label: "Hành động",
      align: "center",
      minWidth: 120,
      render: (row) => (
        <Button
          startIcon={<Info fontSize="small" />}
          variant="outlined"
          size="small"
          onClick={() => openInfo(row)}
        >
          Xem chi tiết
        </Button>
      ),
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
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          🧹 Thông tin nhiệm vụ
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 3 }}>
          {selected && (
            <Stack spacing={2.5}>
              {/* ROOM SUMMARY */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  bgcolor: "grey.100",
                  p: 1.5,
                  borderRadius: 2,
                }}
              >
                <Chip
                  label={`Phòng ${selected.roomNumber}`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Tầng ${selected.floor}`}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              {/* TIMES SECTION */}
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  ⏱ Thời gian
                </Typography>

                <Stack spacing={0.6} pl={1}>
                  <Typography variant="body2">
                    <strong>Tạo lúc:</strong>{" "}
                    {new Date(selected.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Bắt đầu:</strong>{" "}
                    {selected.startedAt
                      ? new Date(selected.startedAt).toLocaleString()
                      : "—"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hoàn tất:</strong>{" "}
                    {selected.completedAt
                      ? new Date(selected.completedAt).toLocaleString()
                      : "—"}
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* NOTES */}
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  📝 Ghi chú
                </Typography>
                <Typography
                  variant="body2"
                  color={selected.notes ? "text.primary" : "text.secondary"}
                  sx={{
                    bgcolor: "grey.50",
                    p: 1.5,
                    borderRadius: 2,
                    minHeight: 48,
                  }}
                >
                  {selected.notes || "Không có ghi chú"}
                </Typography>
              </Stack>

              <Divider />

              {/* EVIDENCE SECTION */}
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  📸 Ảnh minh chứng
                </Typography>

                {/* Replace this when you have images */}
                <Stack
                  spacing={1}
                  sx={{
                    bgcolor: "grey.50",
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Không có dữ liệu ảnh minh chứng
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* MINIBAR SECTION */}
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  🛒 Minibar
                </Typography>

                {minibarBookingId ? (
                  <Chip
                    label={`Booking: ${minibarBookingId}`}
                    color="primary"
                    sx={{ width: "fit-content", fontWeight: 600 }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Không có thông tin minibar
                  </Typography>
                )}
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setInfoOpen(false)}
            variant="contained"
            fullWidth
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
