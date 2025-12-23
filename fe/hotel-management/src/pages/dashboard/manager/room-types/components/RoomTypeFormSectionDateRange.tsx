import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Divider, Tooltip, Typography, Stack } from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { Controller, type Control } from "react-hook-form";
import CalendarPriceSetup from "./CalendarPriceSetup";

export interface DateRangeSectionProps {
  control: Control<any>;
  errors: Record<string, any>;
  roomTypeId?: string;
}

const RoomTypeFormSectionDateRange: React.FC<DateRangeSectionProps> = ({
  control,
  errors: _errors,
  roomTypeId,
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
      <Stack direction="column" spacing={1.25} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                backgroundColor: (theme) => theme.palette.primary.light,
                border: (theme) => `1px solid ${theme.palette.primary.main}`,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Giá ngày thường (T2-T5)
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                backgroundColor: (theme) => theme.palette.secondary.light,
                border: (theme) => `1px solid ${theme.palette.secondary.main}`,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Giá cuối tuần (T6-CN)
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                backgroundColor: (theme) => theme.palette.warning.light,
                border: (theme) => `1px solid ${theme.palette.warning.main}`,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Giá ghi đè
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                backgroundColor: (theme) => theme.palette.error.light,
                border: (theme) => `1px solid ${theme.palette.error.main}`,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Ngày cao điểm
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="body2" color="red">
          * Không thể ghi đè ngày trong quá khứ
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ mb: 2 }}>
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
                roomTypeId={roomTypeId}
              />
            );
          }}
        />
      </Box>
    </Box>
  );
};

export default RoomTypeFormSectionDateRange;
