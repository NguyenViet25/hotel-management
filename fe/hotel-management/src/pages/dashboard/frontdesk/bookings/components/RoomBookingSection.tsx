import { MonetizationOn } from "@mui/icons-material";
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
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import type { RoomType } from "../../../../../api/roomTypesApi";
import { isEmpty } from "lodash";

type Props = {
  index: number;
  control: any;
  errors?: any;
  roomTypes: RoomType[];
  onRemove?: () => void;
  setReloadCount: (func: (prev: number) => number) => void;
  hideHeader?: boolean;
  availableRooms?: number;
};

const RoomBookingSection: React.FC<Props> = ({
  index,
  control,
  errors,
  roomTypes,
  onRemove,
  setReloadCount,
  hideHeader = false,
  availableRooms = 0,
}) => {
  const [exceeded, setExceeded] = useState(false);
  return (
    <Stack spacing={2}>
      {!hideHeader && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
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
      )}

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
            onChange={(e) => {
              field.onChange(e);
              setReloadCount((prev) => prev + 1);
            }}
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
                      * Giá ngày thường: {r.priceFrom.toLocaleString()} đ
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      * Giá cuối tuần: {r.priceTo.toLocaleString()} đ
                    </Typography>
                  </Stack>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {/* <Controller
          name={`roomTypes.${index}.price`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Đơn giá"
              type="text"
              fullWidth
              value={
                field.value !== undefined && field.value !== null
                  ? new Intl.NumberFormat("vi-VN").format(Number(field.value))
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                const num = raw ? Number(raw) : 0;
                field.onChange(num);
                setReloadCount((prev) => prev + 1);
              }}
              error={!!errors?.roomTypes?.[index]?.price}
              helperText={errors?.roomTypes?.[index]?.price?.message}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MonetizationOn />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      VND
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          )}
        /> */}

        <Controller
          name={`roomTypes.${index}.totalRooms`}
          control={control}
          render={({ field }) => (
            <TextField
              label="Số lượng phòng"
              type="text"
              fullWidth
              error={
                !!errors?.roomTypes?.[index]?.totalRooms ||
                (exceeded && availableRooms > 0)
              }
              helperText={
                errors?.roomTypes?.[index]?.totalRooms?.message ||
                (exceeded && availableRooms > 0
                  ? `Vượt quá số lượng phòng trống: còn ${availableRooms} phòng`
                  : undefined)
              }
              value={
                field.value !== undefined && field.value !== null
                  ? new Intl.NumberFormat("vi-VN").format(Number(field.value))
                  : ""
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RoomPreferencesIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      {`Còn: ${availableRooms} phòng`}
                    </Typography>
                  </InputAdornment>
                ),
                sx: { height: "100%" },
              }}
              onChange={(e) => {
                if (isEmpty(e.target.value)) {
                  field.onChange(0);
                  setExceeded(false);
                  setReloadCount((prev) => prev + 1);
                  return;
                }
                const raw = e.target.value;
                const num = raw ? Number(raw) : 1;
                if (num > 999) {
                  field.onChange(999);
                  setExceeded(!!availableRooms && 999 > availableRooms);
                  setReloadCount((prev) => prev + 1);
                  return;
                }
                field.onChange(num);
                setExceeded(!!availableRooms && num > availableRooms);
                setReloadCount((prev) => prev + 1);
              }}
            />
          )}
        />
      </Stack>
      {/* Date range is now global in BookingFormModal */}
    </Stack>
  );
};

export default RoomBookingSection;
