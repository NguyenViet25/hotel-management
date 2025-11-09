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
  Stack,
} from "@mui/material";
import { Controller, type Control } from "react-hook-form";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface BaseSectionProps {
  control: Control<any>;
  errors: Record<string, any>;
}

const RoomTypeFormSectionBase: React.FC<BaseSectionProps> = ({
  control,
  errors,
}) => {
  return (
    <Box sx={{ borderRadius: 2 }}>
      <Typography
        variant="h6"
        sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}
      >
        Khoảng giá base
        <Tooltip title="Giá cơ bản áp dụng mặc định cho mỗi đêm">
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Thiết lập khoảng giá mặc định. Các giá theo ngày sẽ ghi đè khi có.
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack direction={"row"} spacing={2}>
        <Controller
          name="basePrice"
          control={control}
          render={({ field }) => (
            <Tooltip title="Nhập giá cơ bản theo VNĐ">
              <TextField
                {...field}
                label="Giá từ (VND)"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.basePrice}
                helperText={errors.basePrice?.message}
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">VND</InputAdornment>
                  ),
                }}
              />
            </Tooltip>
          )}
        />
        <Controller
          name="basePrice"
          control={control}
          render={({ field }) => (
            <Tooltip title="Nhập giá cơ bản theo VNĐ">
              <TextField
                {...field}
                label="Giá đến (VND)"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.basePrice}
                helperText={errors.basePrice?.message}
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">VND</InputAdornment>
                  ),
                }}
              />
            </Tooltip>
          )}
        />
      </Stack>
    </Box>
  );
};

export default RoomTypeFormSectionBase;
