import { Alert, Box, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import tablesApi, { type TableDto } from "../../../../api/tablesApi";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import TablesTable from "../../manager/tables/components/TablesTable";

const FrontDeskTableManagementPage: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [items, setItems] = useState<TableDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | number>("");

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

  return (
    <Box>
      <PageTitle title="Sơ đồ bàn" subtitle="Xem sơ đồ bàn ăn" />

      <TablesTable
        data={items}
        loading={loading}
        onSearch={(e) => setSearchTerm(e)}
        onStatusFilterChange={(v) => setStatusFilter(v)}
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

export default FrontDeskTableManagementPage;
