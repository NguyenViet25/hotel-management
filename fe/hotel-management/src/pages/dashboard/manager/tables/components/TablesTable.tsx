import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import type { TableDto, TableStatus } from "../../../../../api/tablesApi";
import DataTable, {
  type Column,
} from "../../../../../components/common/DataTable";
import { Add, Groups, Search } from "@mui/icons-material";
import CustomSelect, {
  type Option,
} from "../../../../../components/common/CustomSelect";
import tableImg from "../../../../../assets/table.png";

interface TablesTableProps {
  data: TableDto[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: TableDto) => void;
  onDelete?: (record: TableDto) => void;
  onSearch?: (search: string) => void;
}

const statusChip = (status: TableStatus) => {
  const map: Record<number, { label: string; color: any }> = {
    0: { label: "Sẵn sàng", color: "success" },
    1: { label: "Đang sử dụng", color: "primary" },
    2: { label: "Đã đặt", color: "warning" },
    3: { label: "Ngừng phục vụ", color: "error" },
  };
  const s = map[Number(status)] || { label: "—", color: "default" };
  return <Chip label={s.label} color={s.color} size="small" />;
};

const activeChip = (active?: boolean) => (
  <Chip
    label={active ? "Hoạt động" : "Vô hiệu"}
    color={active ? "info" : "default"}
    size="small"
  />
);

const TablesTable: React.FC<TablesTableProps> = ({
  data,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const total = data.length;
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "group">("list");
  const [dayFilter, setDayFilter] = useState<string | number>("");

  useEffect(() => {
    setPage(1);
  }, [data, dayFilter, viewMode]);

  const dayOptions: Option[] = useMemo(() => {
    const caps = Array.from(new Set((data || []).map((t) => t.capacity))).sort(
      (a, b) => a - b
    );
    return [{ value: "", label: "Tất cả dãy" }].concat(
      caps.map((c) => ({ value: c, label: `Dãy ${c}` }))
    );
  }, [data]);

  const filteredData = useMemo(() => {
    if (dayFilter === "" || dayFilter === undefined) return data;
    return data.filter((t) => String(t.capacity) === String(dayFilter));
  }, [data, dayFilter]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, page]);

  const columns: Column<TableDto>[] = [
    {
      id: "name",
      label: "Tên bàn",
      minWidth: 240,
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "grey.100",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <img
              src={tableImg}
              alt={row.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
          <Stack spacing={0.25}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.name}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Groups fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {typeof row.capacity === "number" && row.capacity > 0
                  ? `${row.capacity} người`
                  : "6 người"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      ),
    },
    { id: "capacity", label: "Dãy", minWidth: 120 },
    {
      id: "status",
      label: "Trạng thái",
      minWidth: 140,
      format: (v) => statusChip(v as TableStatus),
    },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            placeholder="Tìm kiếm..."
            size="small"
            value={searchText}
            onChange={(e) => {
              const v = e.target.value;
              setSearchText(v);
              onSearch?.(v);
            }}
            sx={{ width: 320 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {onAdd && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={onAdd}
            >
              Thêm mới
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <CustomSelect
            label="Lọc theo dãy"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            options={dayOptions}
          />
          <ToggleButtonGroup
            size="small"
            color="primary"
            exclusive
            value={viewMode}
            onChange={(_, v) => v && setViewMode(v)}
          >
            <ToggleButton value="list">Danh sách</ToggleButton>
            <ToggleButton value="group">Theo dãy</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {viewMode === "list" ? (
        <DataTable
          title="Danh sách bàn"
          columns={columns}
          data={pagedData}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
          getRowId={(row) => row.id}
          pagination={{ page, pageSize, total, onPageChange: setPage }}
        />
      ) : (
        <Stack spacing={2}>
          {dayOptions
            .filter((o) => o.value !== "")
            .filter((o) =>
              dayFilter === "" ? true : String(o.value) === String(dayFilter)
            )
            .map((o) => {
              const rows = data.filter(
                (t) => String(t.capacity) === String(o.value)
              );
              return (
                <Paper key={o.value as any} variant="outlined" sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={`Dãy ${o.value}`} color="warning" />
                      <Chip label={`${rows.length} bàn`} variant="outlined" />
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    {rows.map((row) => {
                      const seats =
                        typeof row.capacity === "number" && row.capacity > 0
                          ? row.capacity
                          : 6;
                      return (
                        <Card
                          key={row.id}
                          variant="outlined"
                          sx={{
                            width: 240,
                            borderRadius: 2,
                            position: "relative",
                            transition: "all .2s ease",
                            "&:hover": {
                              boxShadow: 2,
                              borderColor: "grey.300",
                            },
                          }}
                        >
                          <Box sx={{ position: "relative" }}>
                            <Box sx={{ height: 110, overflow: "hidden" }}>
                              <img
                                src={tableImg}
                                alt={row.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                            </Box>
                            <Box sx={{ position: "absolute", top: 8, left: 8 }}>
                              {statusChip(row.status)}
                            </Box>
                          </Box>
                          <CardContent sx={{ p: 1.5 }}>
                            <Stack spacing={0.5}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                {row.name}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <Groups fontSize="small" color="disabled" />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {seats} người/bàn
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                </Paper>
              );
            })}
        </Stack>
      )}
    </Box>
  );
};

export default TablesTable;
