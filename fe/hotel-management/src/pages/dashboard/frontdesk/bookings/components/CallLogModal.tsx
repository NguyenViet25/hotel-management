import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Divider,
  InputAdornment,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotesIcon from "@mui/icons-material/Notes";
import bookingsApi, {
  type BookingDto,
  type CallResult,
} from "../../../../../api/bookingsApi";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDto | null;
  onSubmitted?: () => void;
};

type FormValues = {
  callTime?: string;
  result: CallResult;
  notes?: string;
};

export default function CallLogModal({
  open,
  onClose,
  booking,
  onSubmitted,
}: Props) {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { callTime: undefined, result: 0, notes: "" },
  });

  const submit = async (values: FormValues) => {
    if (!booking) return;
    try {
      if (
        values.callTime === null ||
        values.callTime === "" ||
        values.callTime === undefined
      ) {
        toast.warning("Vui lòng chọn thời gian gọi");
        return;
      }

      const payload = {
        callTime: values.callTime,
        result: values.result,
        notes: values.notes || undefined,
      };
      const res = await bookingsApi.createCallLog(booking.id, payload);
      if (res.isSuccess) {
        onSubmitted?.();
        onClose();
        reset();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Gọi xác nhận (1 ngày trước check-in)
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Call Time */}
          <Controller
            name="callTime"
            control={control}
            render={({ field }) => (
              <TextField
                label="Thời gian gọi"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                fullWidth
                {...field}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Result */}
          <Controller
            name="result"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Kết quả"
                fullWidth
                {...field}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CheckCircleOutlineIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value={1}>Xác nhận</MenuItem>
                <MenuItem value={0}>Không nghe máy</MenuItem>
                <MenuItem value={2}>Huỷ</MenuItem>
              </TextField>
            )}
          />

          {/* Notes */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                label="Ghi chú"
                placeholder="Nhập thông tin chi tiết nếu cần..."
                multiline
                minRows={3}
                fullWidth
                {...field}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ width: "100%", p: 1 }}
        >
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit(submit)}
          >
            Lưu
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
