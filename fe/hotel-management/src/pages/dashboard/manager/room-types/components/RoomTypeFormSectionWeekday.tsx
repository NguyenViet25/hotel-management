import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Tooltip,
  InputAdornment,
  Divider,
  Box,
} from "@mui/material";
import { Controller, type Control } from "react-hook-form";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface WeekdaySectionProps {
  control: Control<any>;
  errors: Record<string, any>;
}

const weekdayLabels = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

const RoomTypeFormSectionWeekday: React.FC<WeekdaySectionProps> = ({
  control,
  errors,
}) => {
  return (
    <Box sx={{ borderRadius: 2 }}>
      <Typography
        variant="h6"
        sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}
      >
        Giá theo thứ
        <Tooltip title="Thiết lập giá cho từng ngày trong tuần">
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Để giá bằng 0 để hệ thống dùng giá base cho ngày đó.
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {weekdayLabels.map((label, idx) => (
          <Grid item xs={12} sm={6} key={label}>
            <Controller
              name={`weekdayPrices.${idx}`}
              control={control}
              render={({ field }) => (
                <Tooltip title={`Giá áp dụng cho ${label}`}>
                  <TextField
                    {...field}
                    label={label}
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.weekdayPrices?.[idx]}
                    helperText={
                      errors.weekdayPrices?.[idx]?.message ||
                      "Để 0 để dùng giá base cho ngày đó."
                    }
                    inputProps={{ min: 0 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Tooltip>
              )}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RoomTypeFormSectionWeekday;
