import React from "react";
import { Box, Stack, TextField, MenuItem, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { OrderStatus } from "../../../../../api/ordersApi";

interface OrdersFiltersProps {
  status?: OrderStatus;
  search?: string;
  onStatusChange: (value?: OrderStatus) => void;
  onSearchChange: (value: string) => void;
}

// Filters component for UC-30 (List Orders)
// - Provides status filter (Serving/Paid) and free-text search on name/phone
const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  status,
  search,
  onStatusChange,
  onSearchChange,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          select
          label="Trạng thái"
          value={status ?? ""}
          onChange={(e) => {
            const val = e.target.value as OrderStatus | "";
            onStatusChange(val || undefined);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="Serving">Đang phục vụ</MenuItem>
          <MenuItem value="Paid">Đã thanh toán</MenuItem>
          <MenuItem value="Draft">Nháp</MenuItem>
          <MenuItem value="Cancelled">Đã hủy</MenuItem>
        </TextField>

        <TextField
          label="Tìm kiếm (tên/SĐT)"
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 240 }}
        />
      </Stack>
    </Box>
  );
};

export default OrdersFilters;