import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import hotelService, {
  type HotelDefaultTimesDto,
  type ItemResponse,
} from "../../../../api/hotelService";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import { Save } from "@mui/icons-material";

const HotelSettingsPage: React.FC = () => {
  const { hotelId } = useStore<StoreState>((s) => s);
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [vat, setVat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const run = async () => {
      if (!hotelId) return;
      setLoading(true);
      try {
        const [timesRes, vatRes] = await Promise.all([
          hotelService.getDefaultTimes(hotelId),
          hotelService.getVat(hotelId),
        ]);
        if (timesRes.isSuccess) {
          const ci = timesRes.data.defaultCheckInTime
            ? dayjs(timesRes.data.defaultCheckInTime)
            : null;
          const co = timesRes.data.defaultCheckOutTime
            ? dayjs(timesRes.data.defaultCheckOutTime)
            : null;
          setCheckIn(ci);
          setCheckOut(co);
        } else {
          setSnackbar({
            open: true,
            message: timesRes.message || "Không thể tải cài đặt",
            severity: "error",
          });
        }
        if (vatRes.isSuccess) {
          setVat(Number(vatRes.data));
        }
      } catch {
        setSnackbar({
          open: true,
          message: "Không thể tải cài đặt",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [hotelId]);

  const save = async () => {
    try {
      if (!hotelId) return;
      const payload: HotelDefaultTimesDto = {
        defaultCheckInTime: checkIn ? checkIn.toISOString() : null,
        defaultCheckOutTime: checkOut ? checkOut.toISOString() : null,
      };
      const res = await hotelService.updateDefaultTimes(hotelId, payload);
      if (!res.isSuccess) {
        toast.error(res.message || "Cập nhật giờ mặc định thất bại");
        return;
      }
      if (vat !== null && !Number.isNaN(vat)) {
        const vatRes = await hotelService.updateVat(hotelId, vat);
        if (!vatRes.isSuccess) {
          toast.error(vatRes.message || "Cập nhật VAT thất bại");
          return;
        }
      }
      toast.success("Đã cập nhật cài đặt");
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  return (
    <Box>
      <PageTitle
        title="Cài đặt khách sạn"
        subtitle="Thiết lập giờ check-in/check-out mặc định"
      />

      {!hotelId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Vui lòng chọn cơ sở làm việc để tiếp tục.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Giờ check-in mặc định"
                    value={checkIn}
                    onChange={(v) => setCheckIn(v)}
                    slotProps={{ textField: { size: "small" } }}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Giờ check-out mặc định"
                    value={checkOut}
                    onChange={(v) => setCheckOut(v)}
                    slotProps={{ textField: { size: "small" } }}
                  />
                </LocalizationProvider>

                <TextField
                  label="Thuế VAT (%)"
                  type="number"
                  value={vat ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    const num = v === "" ? null : Number(v);
                    setVat(num);
                  }}
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                  <Button
                    startIcon={<Save />}
                    variant="contained"
                    onClick={save}
                    disabled={loading}
                  >
                    Lưu
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HotelSettingsPage;
