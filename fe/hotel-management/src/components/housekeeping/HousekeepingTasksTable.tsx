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
  InputAdornment,
} from "@mui/material";
import { useMemo, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { Search } from "@mui/icons-material";
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
  const currency = (v?: number) =>
    typeof v === "number" ? `${v.toLocaleString()}₫` : "—";
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "InProgress" | "Completed"
  >("All");
  const [searchText, setSearchText] = useState<string>("");
  const [floorFilter, setFloorFilter] = useState<number | "all">("all");

  const openInfo = async (id: string) => {
    try {
      const houseKeepingTask = await housekeepingApi.getAsync(id);
      setSelected(houseKeepingTask.data || null);
    } catch (e) {
      void e;
    }
    setInfoOpen(true);
  };

  const filteredTasks = useMemo(() => {
    return (tasks || []).filter((t) => {
      const status = t.completedAt
        ? "Completed"
        : t.startedAt
        ? "InProgress"
        : "Pending";
      const byStatus = statusFilter === "All" || statusFilter === status;
      const bySearch =
        !searchText ||
        t.roomNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        (t.assignedToName || "")
          .toLowerCase()
          .includes(searchText.toLowerCase());
      const byFloor = floorFilter === "all" || t.floor === floorFilter;
      return byStatus && bySearch && byFloor;
    });
  }, [tasks, statusFilter, searchText, floorFilter]);

  const floorOptions = useMemo(() => {
    const floors = Array.from(new Set((tasks || []).map((t) => t.floor))).sort(
      (a, b) => a - b
    );
    return floors;
  }, [tasks]);

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
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            label="Trạng thái"
            value={statusFilter}
            onChange={(e: SelectChangeEvent) =>
              setStatusFilter(
                e.target.value as "All" | "Pending" | "InProgress" | "Completed"
              )
            }
          >
            <MenuItem value="All">Tất cả</MenuItem>
            <MenuItem value="Pending">Chưa làm</MenuItem>
            <MenuItem value="InProgress">Đang làm</MenuItem>
            <MenuItem value="Completed">Hoàn tất</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Tầng</InputLabel>
          <Select
            label="Tầng"
            value={String(floorFilter)}
            onChange={(e: SelectChangeEvent) => {
              const v = e.target.value;
              setFloorFilter(v === "all" ? "all" : Number(v));
            }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            {floorOptions.map((f) => (
              <MenuItem key={f} value={f}>
                Tầng {f}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <DataTable
        columns={columns}
        data={filteredTasks}
        loading={loading}
        getRowId={(t) => t.id}
        actionColumn={false}
      />
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        maxWidth="md"
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
                          <TableCell sx={{ width: "28%" }}>Minibar</TableCell>
                          <TableCell align="right" sx={{ width: "16%" }}>
                            SL
                          </TableCell>
                          <TableCell align="right" sx={{ width: "12%" }}>
                            Đơn giá
                          </TableCell>
                          <TableCell align="right" sx={{ width: "16%" }}>
                            SL trong phòng
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
                                  {b.minibarName}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {b.originalQuantity}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {currency(b.minibarPrice)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {b.comsumedQuantity}
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
