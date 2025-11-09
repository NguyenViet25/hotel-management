import { MenuItem, Stack, TextField, Typography, Box } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Dayjs } from "dayjs";
import React from "react";
import type { BookingStatus } from "../../../../../api/bookingsApi";
import type { RoomType } from "../../../../../api/roomTypesApi";

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
  roomTypeId: string;
  onRoomTypeIdChange: (value: string) => void;
  roomTypes: RoomType[];
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
  roomTypeId,
  onRoomTypeIdChange,
  roomTypes,
  statusOptions,
}) => {
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        pt: 1,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
      }}
    >
      {/* 🏷️ Section Title */}

      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{
          mb: 1,
          color: "text.secondary",
        }}
      >
        Bộ lọc tìm kiếm
      </Typography>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <TextField
          label="Nhập tên khách, số điện thoại"
          value={guestName}
          size="small"
          fullWidth
          onChange={(e) => onGuestNameChange(e.target.value)}
          sx={{ minWidth: 160 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Từ ngày"
            value={fromDate}
            onChange={onFromDateChange}
            slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Đến ngày"
            value={toDate}
            onChange={onToDateChange}
            slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
          />
        </LocalizationProvider>

        <TextField
          select
          label="Loại phòng"
          value={roomTypeId}
          size="small"
          onChange={(e) => onRoomTypeIdChange(e.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {roomTypes.map((rt) => (
            <MenuItem key={rt.id} value={rt.id}>
              {rt.name}
            </MenuItem>
          ))}
        </TextField>

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
