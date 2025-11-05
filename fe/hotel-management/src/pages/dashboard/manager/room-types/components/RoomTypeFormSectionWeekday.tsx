import React from "react";
import { Grid, TextField, Typography, Paper } from "@mui/material";
import { Controller, type Control } from "react-hook-form";

export interface WeekdaySectionProps {
  control: Control<any>;
  errors: Record<string, any>;
}

const weekdayLabels = [
  "CN",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const RoomTypeFormSectionWeekday: React.FC<WeekdaySectionProps> = ({ control, errors }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Giá theo thứ</Typography>
      <Grid container spacing={2}>
        {weekdayLabels.map((label, idx) => (
          <Grid item xs={12} sm={6} key={label}>
            <Controller
              name={`weekdayPrices.${idx}`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={label}
                  type="number"
                  fullWidth
                  error={!!errors.weekdayPrices?.[idx]}
                  helperText={errors.weekdayPrices?.[idx]?.message || "Để 0 để dùng giá base cho ngày đó."}
                  inputProps={{ min: 0 }}
                />
              )}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default RoomTypeFormSectionWeekday;