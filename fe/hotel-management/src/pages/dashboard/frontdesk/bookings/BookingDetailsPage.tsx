import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  Divider,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import PhoneIcon from "@mui/icons-material/Phone";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import bookingsApi, {
  BookingRoomStatus,
  EBookingStatus,
  type BookingDetailsDto,
  type UpdateBookingDto,
} from "../../../../api/bookingsApi";
import BookingFormModal from "./components/BookingFormModal";
import CancelBookingModal from "./components/CancelBookingModal";
import CallLogModal from "./components/CallLogModal";
import dayjs from "dayjs";
import PageTitle from "../../../../components/common/PageTitle";
import { BookingSummary } from "./components/BookingSummary";
import type { IBookingSummary } from "./components/types";
import theme from "../../../../theme";
import RoomTypeCard from "./components/RoomTypeCard";
import CallLogsDisplay from "./components/CallLogDIsplay";
import { Camera, CameraEnhance, Check, Edit } from "@mui/icons-material";
import { toast } from "react-toastify";

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<BookingDetailsDto | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openCall, setOpenCall] = useState(false);

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

  const statusChip = useMemo(() => {
    const s = data?.status as number | undefined;
    const mapping: Record<
      number,
      {
        label: string;
        color: "default" | "primary" | "success" | "warning" | "error";
      }
    > = {
      0: { label: "Chờ duyệt", color: "default" },
      1: { label: "Đã xác nhận", color: "primary" },
      2: { label: "Đã nhận phòng", color: "success" },
      3: { label: "Hoàn tất", color: "success" },
      4: { label: "Đã hủy", color: "error" },
    };
    if (s === undefined) return null;
    const m = mapping[s] || { label: String(s), color: "default" };
    return <Chip label={m.label} color={m.color} size="small" />;
  }, [data]);

  const dateRange = useMemo(() => {
    if (!data) return { start: "—", end: "—", nights: 0 };

    const start = data.bookingRoomTypes?.[0]?.startDate || "—";
    const end = data.bookingRoomTypes?.[0]?.endDate || "—";
    const nights = Math.max(1, dayjs(end).diff(dayjs(start), "day"));
    return { start, end, nights };
  }, [data]);

  const formatCurrency = (v?: number) =>
    typeof v === "number" ? `${v.toLocaleString()} đ` : "—";

  const bookingSummary: IBookingSummary = {
    primaryGuestName: data?.primaryGuestName || "—",
    phoneNumber: data?.phoneNumber || "—",
    email: data?.email || "—",
    totalAmount: data?.totalAmount || 0,
    discountAmount: data?.discountAmount || 0,
    depositAmount: data?.depositAmount || 0,
    leftAmount: data?.leftAmount || 0,
    createdAt: data?.createdAt || "—",
    notes: data?.notes || "—",
  };

  return (
    <Stack justifyContent={"space-between"} spacing={2} mb={2}>
      <PageTitle
        title="Quản lý yêu cầu đặt phòng"
        subtitle="Xem chi tiết yêu cầu đặt phòng"
      />
      {/* Top bar */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          aria-label="Quay lại danh sách"
        >
          Quay lại
        </Button>
      </Stack>

      {/* Page title */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Booking {data?.id || "—"}
          </Typography>
          {statusChip}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CameraEnhance />}
            onClick={() => {
              toast.warning("Tính năng đang trong quá trình hoàn thành");
            }}
            aria-label="Check-in booking"
          >
            Check in/out
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<Edit />}
            onClick={() => setOpenEdit(true)}
            aria-label="Chỉnh sửa booking"
          >
            Chỉnh sửa
          </Button>
          {data?.status === EBookingStatus.Pending && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setOpenCancel(true)}
              aria-label="Hủy booking"
            >
              Hủy
            </Button>
          )}

          {(data?.status === EBookingStatus.Cancelled ||
            data?.status === EBookingStatus.Pending) && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<Check />}
              onClick={() => {
                toast.warning("Tính năng đang trong quá trình hoàn thành");
              }}
              aria-label="Xác nhận booking"
            >
              Xác nhận
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Booking Summary */}
      <Stack sx={{ mb: 2 }}>
        <BookingSummary
          data={bookingSummary}
          dateRange={{
            start: dateRange.start,
            end: dateRange.end,
            nights: dateRange.nights,
          }}
          formatCurrency={formatCurrency}
        />
      </Stack>

      {/* Room Details: one card per room type */}
      <Stack spacing={1}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          color="primary"
          gutterBottom
        >
          Chi tiết phòng
        </Typography>

        <RoomTypeCard
          bookingRoomTypes={data?.bookingRoomTypes || []}
          formatCurrency={(amount) =>
            amount.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })
          }
        />
      </Stack>

      {/* Call logs */}
      <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
        <CardHeader
          title={
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={0.5}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="primary"
                gutterBottom
              >
                Nhật ký cuộc gọi
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PhoneIcon />}
                onClick={() => setOpenCall(true)}
              >
                Gọi khách
              </Button>
            </Stack>
          }
        />
        <CallLogsDisplay data={data?.callLogs || []} />
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

      {/* Call Log Modal */}
      <CallLogModal
        open={openCall}
        onClose={() => setOpenCall(false)}
        booking={data as any}
        onSubmitted={fetch}
      />
    </Stack>
  );
};

export default BookingDetailsPage;
