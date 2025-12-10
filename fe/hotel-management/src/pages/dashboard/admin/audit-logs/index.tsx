import { Alert, Box, Button, Grid, Snackbar, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

import auditService, {
  type AuditLogDto,
  type AuditQueryDto,
} from "../../../../api/auditService";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<AuditQueryDto>({
    page: 1,
    pageSize: 10,
  });

  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const columns: Column<AuditLogDto>[] = [
    {
      id: "action",
      label: "Hành động",
      minWidth: 150,
      sortable: true,
    },
    {
      id: "userId",
      label: "Người dùng",
      minWidth: 150,
      format: (value) => value || "Hệ thống",
    },
    {
      id: "hotelId",
      label: "Cơ sở",
      minWidth: 150,
      format: (value) => value || "N/A",
    },
    {
      id: "timestamp",
      label: "Thời gian",
      minWidth: 180,
      sortable: true,
      format: (value) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      id: "metadata",
      label: "Chi tiết",
      minWidth: 200,
      format: (value) => {
        if (!value) return "Không có chi tiết";
        try {
          return (
            <Box sx={{ maxWidth: 300, maxHeight: 100, overflow: "auto" }}>
              <pre style={{ margin: 0, fontSize: "0.75rem" }}>
                {JSON.stringify(value, null, 2)}
              </pre>
            </Box>
          );
        } catch (e) {
          return "Định dạng chi tiết không hợp lệ";
        }
      },
    },
  ];

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditService.getLogs({
        ...filters,
        page,
        pageSize,
      });

      if (response.isSuccess) {
        setLogs(response.data);
        setTotal(response.meta?.total || 0);
      } else {
        showSnackbar("Không thể tải nhật ký", "error");
      }
    } catch (error) {
      console.error("Lỗi khi tải nhật ký:", error);
      showSnackbar("Đã xảy ra lỗi khi tải nhật ký", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = () => {
    const newFilters: AuditQueryDto = {
      ...filters,
      page: 1,
    };

    if (fromDate) {
      newFilters.from = fromDate.toISOString();
    } else {
      delete newFilters.from;
    }

    if (toDate) {
      newFilters.to = toDate.toISOString();
    } else {
      delete newFilters.to;
    }

    if (actionFilter) {
      newFilters.action = actionFilter;
    } else {
      delete newFilters.action;
    }

    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFromDate(null);
    setToDate(null);
    setActionFilter("");
    setSearchText("");
    setFilters({
      page: 1,
      pageSize: 10,
    });
    setPage(1);
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <PageTitle
          title="Nhật ký hoạt động"
          subtitle="Xem lịch sử thao tác, hành động người dùng và các sự kiện hệ thống"
        />
      </Box>

      {/* Bộ lọc */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Loại hành động"
              size="small"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={handleFilterChange}>
                Áp dụng
              </Button>
              <Button variant="outlined" onClick={handleResetFilters}>
                Đặt lại
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Bảng dữ liệu */}
      <DataTable<AuditLogDto>
        columns={columns}
        data={logs}
        title="Nhật ký hoạt động"
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: handlePageChange,
        }}
        getRowId={(row) => row.id}
        actionColumn={false}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditLogs;
