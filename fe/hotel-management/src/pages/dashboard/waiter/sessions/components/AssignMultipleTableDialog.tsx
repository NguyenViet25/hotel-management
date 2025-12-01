import { Alert, Box, Button, Chip, Snackbar, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import tablesApi, {
  type TableDto,
  TableStatus,
} from "../../../../../api/tablesApi";
import diningSessionsApi from "../../../../../api/diningSessionsApi";
import TablesTable from "../../../manager/tables/components/TablesTable";

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
  const [statusFilter, setStatusFilter] = useState<string | number>("");
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
        search: searchTerm,
        status:
          statusFilter === "" || statusFilter === -1
            ? undefined
            : (statusFilter as string | number),
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
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
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

      <TablesTable
        data={items}
        loading={loading}
        onSearch={(e) => setSearchTerm(e)}
        onStatusFilterChange={(v) => setStatusFilter(v)}
        selectionMode
        selectedIds={selected}
        onSelectToggle={toggleSelect}
      />

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
