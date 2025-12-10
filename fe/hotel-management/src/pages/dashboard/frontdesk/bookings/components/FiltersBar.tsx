import { Box, MenuItem, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import React from "react";
import type { BookingStatus } from "../../../../../api/bookingsApi";

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
}) => {
  return (
    <Box>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
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
