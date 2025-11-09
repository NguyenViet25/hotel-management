import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import bookingsApi, {
  type BookingDetailsDto,
  type UpdateBookingDto,
} from "../../../../api/bookingsApi";
import BookingFormModal from "./components/BookingFormModal";
import CancelBookingModal from "./components/CancelBookingModal";

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<BookingDetailsDto | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  const fetch = async () => {
    if (!id) return;
    try {
      const res = await bookingsApi.getById(id);
      if (res.isSuccess && res.data) setData(res.data);
    } catch {}
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (payload: UpdateBookingDto) => {
    if (!id) return;
    try {
      const res = await bookingsApi.update(id, payload);
      if (res.isSuccess) {
        await fetch();
      }
    } catch {}
  };

  return (
    <Stack spacing={2} sx={{ p: { xs: 1.5, md: 2 } }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          aria-label="Quay lại danh sách"
        >
          Quay lại
        </Button>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700}>
                Thông tin Booking
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenEdit(true)}
                  aria-label="Chỉnh sửa booking"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setOpenCancel(true)}
                  aria-label="Hủy booking"
                >
                  Hủy
                </Button>
              </Stack>
            </Stack>
          }
        />
        <CardContent>
          {data ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Booking
                    </Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">ID: {data.id}</Typography>
                      <Typography variant="body2">
                        Trạng thái: {String(data.status)}
                      </Typography>
                      <Typography variant="body2">Tiền cọc: {data.depositAmount}</Typography>
                      <Typography variant="body2">Giảm giá: {data.discountAmount}</Typography>
                      <Typography variant="body2">Tổng tiền: {data.totalAmount}</Typography>
                      <Typography variant="body2">Còn lại: {data.leftAmount}</Typography>
                      {data.notes && (
                        <Typography variant="body2">Ghi chú: {data.notes}</Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Khách hàng
                    </Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        Khách: {data.primaryGuestName || "—"}
                      </Typography>
                      <Typography variant="body2">SĐT: {data.phoneNumber || "—"}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Phòng & ngày
                    </Typography>
                    <Stack spacing={1}>
                      {data.bookingRoomTypes.map((rt) => (
                        <Stack key={rt.bookingRoomTypeId} spacing={0.5}>
                          <Typography variant="body2">
                            Loại phòng: {rt.roomTypeName} — Giá: {rt.price}
                          </Typography>
                          <Divider />
                          {rt.bookingRooms.map((br) => (
                            <Typography key={br.bookingRoomId} variant="body2">
                              Phòng {br.roomName || br.roomId} — {br.startDate} → {br.endDate}
                            </Typography>
                          ))}
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nhật ký gọi
                    </Typography>
                    <Stack spacing={0.5}>
                      {data.callLogs.length === 0 && (
                        <Typography variant="body2">Chưa có</Typography>
                      )}
                      {data.callLogs.map((c) => (
                        <Typography key={c.id} variant="body2">
                          {c.callTime} — Kết quả: {String(c.result)} — {c.notes || ""}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Đang tải...
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Update Booking Modal */}
      <BookingFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        mode="update"
        bookingData={data as any}
        onUpdate={handleUpdate}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        booking={data as any}
        onSubmitted={fetch}
      />
    </Stack>
  );
};

export default BookingDetailsPage;