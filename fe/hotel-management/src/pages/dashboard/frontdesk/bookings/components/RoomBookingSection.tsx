import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
import {
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React from "react";
import { Controller } from "react-hook-form";
import type { RoomType } from "../../../../../api/roomTypesApi";

type Props = {
  index: number;
  control: any;
  errors?: any;
  roomTypes: RoomType[];
  onRemove?: () => void;
};

const RoomBookingSection: React.FC<Props> = ({
  index,
  control,
  errors,
  roomTypes,
  onRemove,
}) => {
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" fontWeight={700}>
          Mục #{index + 1}
        </Typography>
        {onRemove && (
          <IconButton
            color="error"
            size="small"
            onClick={onRemove}
            aria-label="remove room"
          >
            <DeleteOutlineIcon />
          </IconButton>
        )}
      </Stack>

      <Controller
        name={`roomTypes.${index}.roomId`}
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <TextField
            select
            label="Loại phòng"
            fullWidth
            required
            error={!!errors?.roomTypes?.[index]?.roomId}
            helperText={errors?.roomTypes?.[index]?.roomId?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MeetingRoomIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            {...field}
          >
            {roomTypes.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                <Stack>
                  <Typography fontWeight={600}>{r.name}</Typography>
                  <Stack gap={0.3}>
                    <Typography color="text.secondary" variant="body2">
                      {r.roomCount.toLocaleString()} người /phòng
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {r.priceFrom.toLocaleString()} đ -{" "}
                      {r.priceTo.toLocaleString()} đ
                    </Typography>
                  </Stack>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Controller
          name={`roomTypes.${index}.price`}
          control={control}
          render={({ field }) => (
            <TextField
              label="Giá phòng (VND)"
              type="number"
              fullWidth
              error={!!errors?.roomTypes?.[index]?.price}
              helperText={errors?.roomTypes?.[index]?.price?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">VND</InputAdornment>
                ),
                inputProps: { min: 1 },
                sx: { height: "100%" },
              }}
              {...field}
            />
          )}
        />

        <Controller
          name={`roomTypes.${index}.totalRooms`}
          control={control}
          render={({ field }) => (
            <TextField
              label="Số lượng phòng"
              type="number"
              fullWidth
              error={!!errors?.roomTypes?.[index]?.totalRooms}
              helperText={errors?.roomTypes?.[index]?.totalRooms?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RoomPreferencesIcon fontSize="small" />
                  </InputAdornment>
                ),
                inputProps: { min: 1 },
                sx: { height: "100%" },
              }}
              {...field}
            />
          )}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Controller
            name={`roomTypes.${index}.startDate`}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePicker
                label="Từ ngày"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors?.roomTypes?.[index]?.startDate,
                    helperText: errors?.roomTypes?.[index]?.startDate?.message,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Controller
            name={`roomTypes.${index}.endDate`}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePicker
                label="Đến ngày"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors?.roomTypes?.[index]?.endDate,
                    helperText: errors?.roomTypes?.[index]?.endDate?.message,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>
      </Stack>
    </Stack>
  );
};

export default RoomBookingSection;
