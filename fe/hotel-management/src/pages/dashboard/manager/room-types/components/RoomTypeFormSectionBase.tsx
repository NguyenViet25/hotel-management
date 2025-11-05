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
        Giá base
        <Tooltip title="Giá cơ bản áp dụng mặc định cho mỗi đêm">
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Thiết lập giá mặc định. Các giá theo thứ hoặc theo khoảng ngày sẽ ghi đè
        khi có.
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="basePrice"
            control={control}
            render={({ field }) => (
              <Tooltip title="Nhập giá cơ bản theo VNĐ">
                <TextField
                  {...field}
                  label="Giá base (VND)"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.basePrice}
                  helperText={errors.basePrice?.message}
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Tooltip>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomTypeFormSectionBase;
