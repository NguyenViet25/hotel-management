import { Box, Button, Chip, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import tablesApi, {
  type TableDto,
  TableStatus,
} from "../../../../../api/tablesApi";
import diningSessionsApi from "../../../../../api/diningSessionsApi";
import TablesTable from "../../../manager/tables/components/TablesTable";
import { toast } from "react-toastify";

type Props = {
  sessionId: string;
  onAssigned?: () => void | Promise<void>;
};

const AssignMultipleTableDialog: React.FC<Props> = ({
  sessionId,
  onAssigned,
}) => {
  const { user, hotelId } = useStore<StoreState>((s) => s);
  const isWaiter = (user?.roles || []).map((x) => x.toLowerCase()).includes("waiter");
  const [items, setItems] = useState<TableDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | number>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [initialSelected, setInitialSelected] = useState<string[]>([]);

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
      toast.error("Không tải được danh sách bàn");
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

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const res = await diningSessionsApi.getSession(sessionId);
        if (res.isSuccess) {
          const ids = (res.data.tables || []).map((t) => t.tableId);
          setInitialSelected(ids);
          setSelected(ids);
        }
      } catch {}
    })();
  }, [sessionId]);

  const toggleSelect = (id: string, status: TableStatus) => {
    if (status !== TableStatus.Available) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id)
    );
  };

  const handleAssign = async () => {
    if (isWaiter) return;
    if (!sessionId || selected.length === 0) return;
    try {
      const attachIds = selected.filter((id) => !initialSelected.includes(id));
      const detachIds = initialSelected.filter((id) => !selected.includes(id));
      if (attachIds.length === 0 && detachIds.length === 0) {
        toast.info("Không có thay đổi");
        return;
      }
      const res = await diningSessionsApi.updateTables(sessionId, {
        attachTableIds: attachIds,
        detachTableIds: detachIds,
      });
      if (res.isSuccess) {
        toast.success(
          `Đã cập nhật gán bàn (gắn: ${attachIds.length}, gỡ: ${detachIds.length})`
        );
        setSelected([]);
        setInitialSelected([]);
        await onAssigned?.();
      } else {
        toast.error(res.message || "Cập nhật gán bàn thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
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
          disabled={isWaiter || selected.length === 0}
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
    </Box>
  );
};

export default AssignMultipleTableDialog;
