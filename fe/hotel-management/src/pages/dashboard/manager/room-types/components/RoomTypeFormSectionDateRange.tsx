import React from "react";
import {
  Box,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Button,
  Tooltip,
  Divider,
  InputAdornment,
} from "@mui/material";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface DateRangeSectionProps {
  control: Control<any>;
  errors: Record<string, any>;
}

const RoomTypeFormSectionDateRange: React.FC<DateRangeSectionProps> = ({
  control,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dateRanges",
  });

  return (
    <Box sx={{ borderRadius: 2 }}>
      <Typography
        variant="h6"
        sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}
      >
        Giá theo ngày
        <Tooltip title="Định nghĩa các khoảng ngày có mức giá đặc biệt">
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Tooltip>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ví dụ: Lễ/Tết hoặc mùa cao điểm.
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          Khoảng ngày đặc biệt
        </Typography>
        <Button
          onClick={() => append({ startDate: null, endDate: null, price: 0 })}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Thêm khoảng ngày
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
                    <Tooltip title="Ngày bắt đầu của khoảng giá">
                      <DatePicker
                        label="Từ"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.dateRanges?.[index]?.startDate,
                            helperText:
                              errors.dateRanges?.[index]?.startDate?.message,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EventIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </Tooltip>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name={`dateRanges.${index}.endDate`}
                  control={control}
                  render={({ field }) => (
                    <Tooltip title="Ngày kết thúc của khoảng giá">
                      <DatePicker
                        label="Đến"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.dateRanges?.[index]?.endDate,
                            helperText:
                              errors.dateRanges?.[index]?.endDate?.message,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EventIcon fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </Tooltip>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Controller
                  name={`dateRanges.${index}.price`}
                  control={control}
                  render={({ field }) => (
                    <Tooltip title="Giá áp dụng cho khoảng ngày này">
                      <TextField
                        {...field}
                        label="Giá"
                        type="number"
                        fullWidth
                        margin="normal"
                        error={!!errors.dateRanges?.[index]?.price}
                        helperText={errors.dateRanges?.[index]?.price?.message}
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
              <Grid item xs={12} sm={1}>
                <IconButton
                  color="error"
                  onClick={() => remove(index)}
                  aria-label="remove"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </LocalizationProvider>
    </Box>
  );
};

export default RoomTypeFormSectionDateRange;
