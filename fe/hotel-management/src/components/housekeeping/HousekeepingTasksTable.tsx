import { Info } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import housekeepingApi from "../../api/housekeepingApi";
import { type HousekeepingTaskDto } from "../../api/housekeepingTasksApi";
import DataTable, { type Column } from "../common/DataTable";

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

  const openInfo = async (id: string) => {
    try {
      const from = new Date(selected?.startedAt!);
      from.setHours(0, 0, 0, 0);
      const to = new Date(selected?.completedAt!);
      to.setHours(23, 59, 59, 999);
      const houseKeepingTask = await housekeepingApi.getAsync(id);
      setSelected(houseKeepingTask.data || null);
    } catch {}
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
    // { id: "notes", label: "Ghi chú", minWidth: 180, format: (v) => v || "—" },
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
          onClick={() => openInfo(row.id)}
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
                  {selected.roomStatusLogs?.[0]?.notes || "Không có ghi chú"}
                </Typography>
              </Stack>

              <Divider />

              {/* EVIDENCE SECTION */}
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  📸 Ảnh minh chứng
                </Typography>
                {(() => {
                  const urls =
                    (selected.roomStatusLogs || [])
                      .flatMap((l) => l.evidenceUrls || [])
                      .filter((u): u is string => !!u) || [];
                  if (!urls.length) {
                    return (
                      <Stack
                        spacing={1}
                        sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 2 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Không có dữ liệu ảnh minh chứng
                        </Typography>
                      </Stack>
                    );
                  }
                  return (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(2, 1fr)",
                          sm: "repeat(3, 1fr)",
                          md: "repeat(4, 1fr)",
                        },
                        gap: 1.5,
                        bgcolor: "grey.50",
                        p: 1.5,
                        borderRadius: 2,
                      }}
                    >
                      {urls.map((url, idx) => (
                        <Box
                          key={`${url}-${idx}`}
                          sx={{ display: "flex", justifyContent: "center" }}
                        >
                          <img
                            src={url}
                            alt="Evidence"
                            style={{ width: "100%", borderRadius: 8 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  );
                })()}
              </Stack>

              <Divider />

              {/* MINIBAR SECTION */}
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  🛒 Minibar
                </Typography>
                {selected.minibarBookings && selected.minibarBookings.length ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" sx={{ width: "8%" }}>
                            #
                          </TableCell>
                          <TableCell sx={{ width: "32%" }}>Minibar</TableCell>
                          <TableCell align="right" sx={{ width: "20%" }}>
                            SL gốc
                          </TableCell>
                          <TableCell align="right" sx={{ width: "20%" }}>
                            SL tiêu thụ
                          </TableCell>
                          <TableCell align="center" sx={{ width: "20%" }}>
                            Trạng thái
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selected.minibarBookings.map((b, idx) => {
                          const isFull =
                            b.comsumedQuantity === b.originalQuantity;
                          return (
                            <TableRow key={b.id}>
                              <TableCell align="center">{idx + 1}</TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {b.minibarId}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {b.originalQuantity}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <TextField
                                  type="number"
                                  size="small"
                                  value={b.comsumedQuantity}
                                  inputProps={{
                                    min: 0,
                                    max: b.originalQuantity,
                                    readOnly: true,
                                  }}
                                  sx={{ width: 100 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {isFull ? (
                                  <Chip
                                    label="Đầy đủ"
                                    color="success"
                                    size="small"
                                  />
                                ) : (
                                  <Chip
                                    label="Thiếu"
                                    color="warning"
                                    size="small"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Không có dữ liệu minibar
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
