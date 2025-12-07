import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Hotel } from "../../../api/hotelService";
import { useHotels } from "../hooks/useHotels";
import dayjs from "dayjs";
import { EditLocationAlt } from "@mui/icons-material";

interface ChangeStatusModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  hotel: Hotel;
}

const schema = z.object({
  action: z.enum(["pause", "close", "resume"]),
  reason: z.string().min(5, "Lý do phải có ít nhất 5 ký tự"),
  until: z.date().optional().nullable(),
});

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  hotel,
}) => {
  const { changeHotelStatus } = useHotels();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      action: hotel.isActive ? "pause" : "resume",
      reason: "",
      until: null,
    },
  });

  const selectedAction = watch("action");
  const showDatePicker = selectedAction === "pause";

  const onSubmit = async (data: any) => {
    try {
      const statusRequest = {
        action: data.action,
        reason: data.reason,
        until: data.until ? data.until.toISOString() : undefined,
      };

      const result = await changeHotelStatus(hotel.id, statusRequest);

      if (result) {
        reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái khách sạn:", error);
    }
  };

  return (
    <Dialog open={visible} onClose={onCancel} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack gap={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditLocationAlt color="primary" />
              <Typography variant="h6">
                Thay đổi trạng thái khách sạn
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl component="fieldset" error={!!errors.action}>
                <Controller
                  name="action"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      {hotel.isActive ? (
                        <>
                          <FormControlLabel
                            value="pause"
                            control={<Radio />}
                            label="Tạm dừng"
                          />
                          <FormControlLabel
                            value="close"
                            control={<Radio />}
                            label="Đóng"
                          />
                        </>
                      ) : (
                        <FormControlLabel
                          value="resume"
                          control={<Radio />}
                          label="Hoạt động trở lại"
                        />
                      )}
                    </RadioGroup>
                  )}
                />
                {errors.action && (
                  <FormHelperText>
                    {errors.action.message as string}
                  </FormHelperText>
                )}
              </FormControl>

              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lý do"
                    placeholder="Nhập lý do thay đổi trạng thái"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.reason}
                    helperText={errors.reason?.message as string}
                  />
                )}
              />

              {showDatePicker && (
                <Controller
                  name="until"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Đến ngày (tùy chọn)"
                      value={dayjs(field.value)}
                      onChange={(value) => {
                        field.onChange(dayjs(value).toDate());
                      }}
                      minDate={dayjs(new Date())}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.until,
                          helperText: errors.until?.message as string,
                        },
                      }}
                    />
                  )}
                />
              )}
            </Box>
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 2 }}
              justifyContent="flex-end"
            >
              <Button onClick={onCancel}>Hủy</Button>
              <Button type="submit" variant="contained" color="primary">
                Xác nhận
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default ChangeStatusModal;
