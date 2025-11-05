import React from "react";
import { Grid, TextField, Typography, Paper } from "@mui/material";
import { Controller, type Control } from "react-hook-form";

export interface BaseSectionProps {
  control: Control<any>;
  errors: Record<string, any>;
}

const RoomTypeFormSectionBase: React.FC<BaseSectionProps> = ({ control, errors }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Giá base</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="basePrice"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Giá base (VND)"
                type="number"
                fullWidth
                error={!!errors.basePrice}
                helperText={errors.basePrice?.message}
                inputProps={{ min: 0 }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RoomTypeFormSectionBase;