import React from "react";
import { Card, CardContent, CardHeader, Stack, Typography, Chip } from "@mui/material";
import type { BookingDetailsDto } from "../../../../../api/bookingsApi";

type Props = {
  booking: BookingDetailsDto | null;
};

const BookingDetailsPanel: React.FC<Props> = ({ booking }) => {
  const rt = booking?.bookingRoomTypes?.[0];
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader title="Thông tin booking" />
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>Tên khách:</Typography>
            <Chip label={booking?.primaryGuestName || "—"} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>Số điện thoại:</Typography>
            <Chip label={booking?.phoneNumber || "—"} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>Loại phòng:</Typography>
            <Chip label={rt?.roomTypeName || "—"} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>Ngày nhận phòng:</Typography>
            <Chip label={rt?.startDate || "—"} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>Ngày trả phòng:</Typography>
            <Chip label={rt?.endDate || "—"} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BookingDetailsPanel;