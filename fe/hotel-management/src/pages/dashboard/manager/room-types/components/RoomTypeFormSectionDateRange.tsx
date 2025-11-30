import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Divider, Tooltip, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React from "react";
import { Controller, type Control } from "react-hook-form";
import CalendarPriceSetup from "./CalendarPriceSetup";
import dayjs from "dayjs";

export interface DateRangeSectionProps {
  control: Control<any>;
  errors: Record<string, any>;
}

const RoomTypeFormSectionDateRange: React.FC<DateRangeSectionProps> = ({
  control,
  errors: _errors,
}) => {
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
      <Box sx={{ mb: 2 }}>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale="vi"
          localeText={{
            okButtonLabel: "Đồng ý",
            cancelButtonLabel: "Hủy",
            clearButtonLabel: "Xóa",
            todayButtonLabel: "Hôm nay",
          }}
        >
          <Controller
            name="prices"
            control={control}
            render={({ field: { value, onChange } }) => {
              const map = Object.fromEntries(
                (value || []).map((p: any) => [
                  dayjs(p.date).format("YYYY-MM-DD"),
                  p.price,
                ])
              );
              return (
                <CalendarPriceSetup
                  value={map}
                  onChangePriceMap={(m) => {
                    const list = Object.entries(m).map(([d, price]) => ({
                      date: new Date(d),
                      price,
                    }));
                    onChange(list);
                  }}
                />
              );
            }}
          />
        </LocalizationProvider>
      </Box>
    </Box>
  );
};

export default RoomTypeFormSectionDateRange;
