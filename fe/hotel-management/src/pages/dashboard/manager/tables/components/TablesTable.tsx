import {
  Add,
  Groups,
  Search,
  TableRestaurant as TableRestaurantIcon,
} from "@mui/icons-material";
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
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import type { TableDto, TableStatus } from "../../../../../api/tablesApi";
import tableImg from "../../../../../assets/table.png";
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
  onSearch,
}) => {
  const [searchText, setSearchText] = useState("");
  const [dayFilter, setDayFilter] = useState<string | number>("");

  const dayOptions: Option[] = useMemo(() => {
    const caps = Array.from(new Set((data || []).map((t) => t.capacity))).sort(
      (a, b) => a - b
    );
    return [{ value: "", label: "Tất cả dãy" }].concat(
      caps.map((c) => ({ value: c, label: `Dãy ${c}` }))
    );
  }, [data]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ mb: 2 }}
        justifyContent={"space-between"}
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
                    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                    gap: 1.5,
                  }}
                >
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
                          width: "100%",
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
                          <Box sx={{ height: 110, overflow: "hidden", mt: 1 }}>
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
                </Box>
              </Paper>
            );
          })}
      </Stack>
    </Box>
  );
};

export default TablesTable;
