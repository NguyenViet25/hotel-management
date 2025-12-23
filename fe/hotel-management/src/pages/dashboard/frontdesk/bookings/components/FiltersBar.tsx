import {
  Box,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import React from "react";
import type { BookingStatus } from "../../../../../api/bookingsApi";
import { GridView, TableChart } from "@mui/icons-material";
import dayjs from "dayjs";

export interface StatusOption {
  value: BookingStatus | "";
  label: string;
}

export interface FiltersBarProps {
  status: BookingStatus | "";
  onStatusChange: (value: BookingStatus | "") => void;
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
  onFromDateChange: (value: Dayjs | null) => void;
  onToDateChange: (value: Dayjs | null) => void;
  guestName: string;
  roomNumber: string;
  onGuestNameChange: (value: string) => void;
  onRoomNumberChange: (value: string) => void;
  statusOptions: StatusOption[];
  viewMode: "card" | "table";
  setViewMode: (value: "card" | "table") => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  status,
  onStatusChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  guestName,
  onGuestNameChange,
  statusOptions,
  viewMode,
  setViewMode,
}) => {
  return (
    <Box>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) =>
              setViewMode((v ?? viewMode) as "card" | "table")
            }
            size="small"
            color="primary"
          >
            <ToggleButton value="table">
              <TableChart sx={{ mr: 1 }} />
              Bảng
            </ToggleButton>
            <ToggleButton value="card">
              <GridView sx={{ mr: 1 }} />
              Thẻ
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <TextField
          label="Nhập tên khách, số điện thoại"
          value={guestName}
          size="small"
          fullWidth
          onChange={(e) => onGuestNameChange(e.target.value)}
          sx={{ minWidth: 160 }}
        />

        <DatePicker
          label="Từ ngày"
          value={fromDate}
          onChange={onFromDateChange}
          slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
        />

        <DatePicker
          label="Đến ngày"
          value={toDate}
          maxDate={dayjs(fromDate)}
          onChange={onToDateChange}
          slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
        />

        <TextField
          select
          label="Trạng thái"
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as unknown as BookingStatus | "")
          }
          size="small"
          sx={{ minWidth: 180 }}
        >
          {statusOptions.map((opt) => (
            <MenuItem key={String(opt.value)} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};

export default FiltersBar;
