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
      ></Box>
    </Box>
  );
};

export default RoomTypeFormSectionDateRange;
