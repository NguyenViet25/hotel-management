import React from "react";
import {
  Box,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DeleteIcon from "@mui/icons-material/Delete";

export interface DateRangeSectionProps {
  control: Control<any>;
  errors: Record<string, any>;
}

const RoomTypeFormSectionDateRange: React.FC<DateRangeSectionProps> = ({ control, errors }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "dateRanges" });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Giá theo ngày</Typography>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2">Khoảng ngày đặc biệt</Typography>
        <Button
          onClick={() => append({ startDate: null, endDate: null, price: 0 })}
          variant="outlined"
        >
          + Thêm khoảng ngày
        </Button>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {fields.map((field, index) => (
          <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`dateRanges.${index}.startDate`}
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Từ"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{ textField: { fullWidth: true, error: !!errors.dateRanges?.[index]?.startDate, helperText: errors.dateRanges?.[index]?.startDate?.message } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`dateRanges.${index}.endDate`}
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Đến"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{ textField: { fullWidth: true, error: !!errors.dateRanges?.[index]?.endDate, helperText: errors.dateRanges?.[index]?.endDate?.message } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Controller
                  name={`dateRanges.${index}.price`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Giá"
                      type="number"
                      fullWidth
                      error={!!errors.dateRanges?.[index]?.price}
                      helperText={errors.dateRanges?.[index]?.price?.message}
                      inputProps={{ min: 0 }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton color="error" onClick={() => remove(index)} aria-label="remove">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </LocalizationProvider>
    </Paper>
  );
};

export default RoomTypeFormSectionDateRange;