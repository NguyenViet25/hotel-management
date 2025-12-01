import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import tablesApi, {
  type TableDto,
  TableStatus,
} from "../../../../../api/tablesApi";
import diningSessionsApi from "../../../../../api/diningSessionsApi";

type Props = {
  sessionId: string;
  onAssigned?: () => void | Promise<void>;
};

const AssignMultipleTableDialog: React.FC<Props> = ({
  sessionId,
  onAssigned,
}) => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [items, setItems] = useState<TableDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const fetchTables = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const res = await tablesApi.listTables({
        hotelId,
        status: TableStatus.Available,
        search: searchTerm,
        page: 1,
        pageSize: 100,
      });
      if (res.isSuccess) setItems(res.data);
    } catch {
      setSnackbar({
        open: true,
        message: "Không tải được danh sách bàn",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  useEffect(() => {
    const t = setTimeout(() => fetchTables(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const toggleSelect = (id: string, status: TableStatus) => {
    if (status !== TableStatus.Available) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id)
    );
  };

  const handleAssign = async () => {
    if (!sessionId || selected.length === 0) return;
    try {
      const res = await diningSessionsApi.updateTables(sessionId, {
        attachTableIds: selected,
      });
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã gắn các bàn đã chọn",
          severity: "success",
        });
        setSelected([]);
        await onAssigned?.();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Gắn bàn thất bại",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({ open: true, message: "Đã xảy ra lỗi", severity: "error" });
    }
  };

  const filtered = useMemo(() => {
    const bySearch = (t: TableDto) =>
      !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return (items || []).filter(bySearch);
  }, [items, searchTerm]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <TextField
          placeholder="Tìm bàn..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">🔎</InputAdornment>
            ),
          }}
        />
        <Chip
          label={`Đã chọn: ${selected.length}`}
          color={selected.length ? "primary" : "default"}
          size="small"
        />
        <Button
          variant="contained"
          disabled={selected.length === 0}
          onClick={handleAssign}
        >
          Gắn các bàn đã chọn
        </Button>
      </Stack>

      <Grid container spacing={1.5}>
        {filtered.map((row) => {
          const isSelected = selected.includes(row.id);
          const available = row.status === TableStatus.Available;
          return (
            <Grid key={row.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {row.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={`Dãy ${row.capacity}`} size="small" />
                      <Chip
                        label={available ? "Trống" : "Không khả dụng"}
                        color={available ? "success" : "default"}
                        size="small"
                      />
                    </Stack>
                    <Button
                      fullWidth
                      size="small"
                      variant={isSelected ? "contained" : "outlined"}
                      disabled={!available}
                      onClick={() => toggleSelect(row.id, row.status)}
                    >
                      {isSelected ? "Đã chọn" : "Chọn"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignMultipleTableDialog;
