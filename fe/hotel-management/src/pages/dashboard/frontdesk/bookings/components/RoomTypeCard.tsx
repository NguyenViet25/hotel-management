import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import type { BookingRoomTypeDto } from "../../../../../api/bookingsApi";
import { CalendarMonth } from "@mui/icons-material";

interface RoomTypeCardProps {
  bookingRoomTypes: BookingRoomTypeDto[];
  formatCurrency: (amount: number) => string;
}

export default function RoomTypeCard({
  bookingRoomTypes,
  formatCurrency,
}: RoomTypeCardProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} flexWrap="wrap">
      {bookingRoomTypes.map((rt) => {
        const nightsTotal = dayjs(rt.endDate).diff(dayjs(rt.startDate), "day");
        const totalPrice = (nightsTotal || 0) * (rt.price || 0);

        return (
          <Card
            key={rt.roomTypeId}
            variant="outlined"
            sx={{
              borderRadius: 2,
              flex: "1 1 300px",
              minWidth: 280,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={700}>
                  {rt.roomTypeName || "Loại phòng"}
                </Typography>
              }
              subheader={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`Số phòng: ${rt.totalRoom || 0}`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`${nightsTotal || 0} đêm`}
                    size="small"
                    color="secondary"
                  />
                </Stack>
              }
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Thời gian:</Typography>
                  <Typography variant="body2">
                    {new Date(rt.startDate).toLocaleDateString()} →{" "}
                    {new Date(rt.endDate).toLocaleDateString()} (
                    {nightsTotal || 0} đêm)
                  </Typography>
                </Stack>

                <Typography variant="body2">
                  Giá/đêm: {formatCurrency(rt.price)}
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  Tổng giá: {formatCurrency(totalPrice)}
                </Typography>

                <Stack spacing={0.5}>
                  {(rt.bookingRooms || []).map((br) => (
                    <Typography key={br.bookingRoomId} variant="body2">
                      Phòng {br.roomName || br.roomId} —{" "}
                      {dayjs(br.startDate).format("DD/MM/YYYY")} →{" "}
                      {dayjs(br.endDate).format("DD/MM/YYYY")}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
