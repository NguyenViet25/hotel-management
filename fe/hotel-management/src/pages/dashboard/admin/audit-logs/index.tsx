import {
  Alert,
  Box,
  Button,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import auditService, {
  type AuditLogDto,
  type AuditQueryDto,
} from "../../../../api/auditService";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";

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
      label: "Thực thể",
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

  const handleSearch = (searchText: string) => {
    setSearchText(searchText);
    const newFilters = { ...filters, action: searchText || undefined, page: 1 };
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

  const handleExport = () => {
    if (logs.length === 0) {
      showSnackbar("Không có nhật ký để xuất", "warning");
      return;
    }

    const headers = [
      "Hành động",
      "Người dùng",
      "Thực thể",
      "Thời gian",
      "Chi tiết",
    ];
    const csvRows = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.action,
          log.userId || "Hệ thống",
          log.hotelId || "N/A",
          dayjs(log.timestamp).format("DD/MM/YYYY HH:mm:ss"),
          log.metadata
            ? JSON.stringify(log.metadata).replace(/,/g, ";")
            : "Không có chi tiết",
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `audit_logs_${dayjs().format("YYYYMMDD_HHmmss")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <Typography variant="h6" component="h1" gutterBottom>
          Nhật ký hoạt động
        </Typography>
      </Box>

      {/* Bộ lọc */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Từ ngày"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Đến ngày"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Loại hành động"
              size="small"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
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
