import {
  Add,
  Delete,
  Edit,
  Groups,
  Search,
  TableRestaurant as TableRestaurantIcon,
  Visibility,
  LineAxis,
  TableBar,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import type { TableDto, TableStatus } from "../../../../../api/tablesApi";
import tableImg from "../../../../../assets/table.png";
import EmptyState from "../../../../../components/common/EmptyState";
import CustomSelect, {
  type Option,
} from "../../../../../components/common/CustomSelect";

interface TablesTableProps {
  data: TableDto[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: TableDto) => void;
  onDelete?: (record: TableDto) => void;
  onSearch?: (search: string) => void;
  onStatusFilterChange?: (status: string | number) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  onSelectToggle?: (id: string, status: TableStatus) => void;
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

const TablesTable: React.FC<TablesTableProps> = ({
  data,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  onStatusFilterChange,
  selectionMode = false,
  selectedIds = [],
  onSelectToggle,
}) => {
  const [searchText, setSearchText] = useState("");
  const [dayFilter, setDayFilter] = useState<number>(-1);
  const [statusFilter, setStatusFilter] = useState<number>(-1);
  const [viewItem, setViewItem] = useState<TableDto | null>(null);

  const dayOptions: Option[] = useMemo(() => {
    const caps = Array.from(new Set((data || []).map((t) => t.capacity))).sort(
      (a, b) => a - b
    );
    return [{ value: -1, label: "Tất cả dãy" }].concat(
      caps.map((c) => ({ value: c, label: `Dãy ${c}` }))
    );
  }, [data]);

  const statusOptions: Option[] = [
    { value: -1, label: "Tất cả trạng thái" },
    { value: 0, label: "Sẵn sàng" },
    { value: 1, label: "Đang sử dụng" },
    { value: 2, label: "Đã đặt" },
    { value: 3, label: "Ngừng phục vụ" },
  ];

  const groupsToRender = useMemo(() => {
    return dayOptions
      .filter((o) => o.value !== -1)
      .filter((o) =>
        dayFilter === -1 ? true : String(o.value) === String(dayFilter)
      );
  }, [dayOptions, dayFilter]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ mb: 2 }}
        justifyContent={"space-between"}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems="center"
        >
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
          <Box sx={{ minWidth: 200 }}>
            <CustomSelect
              size="small"
              label="Dãy"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              options={dayOptions}
              startIcon={<LineAxis />}
            />
          </Box>
          <Box sx={{ minWidth: 220 }}>
            <CustomSelect
              label="Trạng thái"
              size="small"
              value={statusFilter}
              onChange={(e) => {
                const v = e.target.value;
                setStatusFilter(v);
                onStatusFilterChange?.(v);
              }}
              options={statusOptions}
              startIcon={<TableBar />}
            />
          </Box>
        </Stack>
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

      <Stack spacing={2}>
        {groupsToRender.length === 0 && !loading ? (
          <EmptyState
            title="Không có dữ liệu"
            description="Không tìm thấy kết quả phù hợp. Thử thay đổi bộ lọc hoặc từ khóa."
            icon={<TableBar color="disabled" sx={{ fontSize: 40 }} />}
            height={200}
          />
        ) : (
          groupsToRender.map((o) => {
            const rows = data.filter(
              (t) => String(t.capacity) === String(o.value)
            );
            return (
              <Paper
                key={o.value as any}
                variant="outlined"
                sx={{
                  p: 2,
                  position: "relative",
                  border: "2px dashed",
                  borderColor: "warning.main",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #FFF8E1 0%, #FFFDF5 100%)",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: -8,
                    transform: "translateY(-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "background.paper",
                    border: "2px solid",
                    borderColor: "warning.main",
                  },
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    right: -8,
                    transform: "translateY(-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "background.paper",
                    border: "2px solid",
                    borderColor: "warning.main",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 1,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "warning.light",
                    border: "2px dashed",
                    borderColor: "warning.main",
                  }}
                >
                  <TableRestaurantIcon color="warning" />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      flexGrow: 1,
                    }}
                  >
                    {`Dãy ${o.value}`}
                  </Typography>
                  <Chip label={`${rows.length} bàn`} variant="outlined" />
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(1, minmax(0, 1fr))",
                      md: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(5, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                  }}
                >
                  {rows.map((row) => {
                    const seats = 6;
                    const isSelected = selectedIds.includes(row.id);
                    const available = Number(row.status) === Number(0);
                    return (
                      <Card
                        key={row.id}
                        variant="outlined"
                        sx={{
                          width: "100%",
                          borderRadius: 2,
                          position: "relative",
                          transition: "all .2s ease",
                          "&:hover": {
                            boxShadow: 2,
                            borderColor: "grey.300",
                          },
                          ...(selectionMode && isSelected
                            ? { borderColor: "primary.main", boxShadow: 3 }
                            : {}),
                        }}
                      >
                        <Box sx={{ position: "relative", pt: 4 }}>
                          <Box
                            sx={{
                              height: 110,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={tableImg}
                              alt={row.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block",
                              }}
                            />
                          </Box>
                          <Box sx={{ position: "absolute", top: 8, left: 8 }}>
                            {statusChip(row.status)}
                          </Box>
                        </Box>
                        <Stack spacing={0.5} sx={{ px: 1.5, pb: 1.5 }}>
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
                        <Stack
                          sx={{ position: "absolute", bottom: 8, right: 8 }}
                          direction="column"
                          spacing={0.5}
                        >
                          {!selectionMode && (
                            <>
                              <Tooltip title="Xem">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => setViewItem(row)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {onEdit && (
                                <Tooltip title="Sửa">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    onClick={() => onEdit(row)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onDelete && (
                                <Tooltip title="Xóa">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(row)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                          {selectionMode && (
                            <Button
                              fullWidth
                              size="small"
                              variant={isSelected ? "contained" : "outlined"}
                              disabled={!available && !isSelected}
                              onClick={() =>
                                onSelectToggle?.(row.id, row.status)
                              }
                            >
                              {isSelected ? "Đã chọn" : "Chọn"}
                            </Button>
                          )}
                        </Stack>
                      </Card>
                    );
                  })}
                </Box>
              </Paper>
            );
          })
        )}
      </Stack>

      <Dialog
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Chi tiết bàn</DialogTitle>
        <DialogContent>
          {viewItem && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TableRestaurantIcon color="warning" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {viewItem.name}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`Dãy ${viewItem.capacity}`} color="warning" />
                {statusChip(viewItem.status)}
                <Chip
                  label={viewItem.isActive ? "Hoạt động" : "Vô hiệu"}
                  size="small"
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewItem(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TablesTable;
