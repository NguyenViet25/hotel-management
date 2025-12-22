import { Check, Edit, Print } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import bookingsApi, {
  EBookingStatus,
  type BookingDetailsDto,
  type UpdateBookingDto,
} from "../../../../api/bookingsApi";
import PageTitle from "../../../../components/common/PageTitle";
import BookingFormModal from "./components/BookingFormModal";
import BookingInvoiceDialog from "./components/BookingInvoiceDialog";
import { BookingSummary } from "./components/BookingSummary";
import CallLogsDisplay from "./components/CallLogDIsplay";
import CallLogModal from "./components/CallLogModal";
import CancelBookingModal from "./components/CancelBookingModal";
import ConfirmBookingModal from "./components/ConfirmBookingModal";
import CompleteBookingModal from "./components/CompleteBookingModal";
import RoomTypeAssignCheckIn from "./components/RoomTypeAssignCheckIn";
import type { IBookingSummary } from "./components/types";
import { toast } from "react-toastify";

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<BookingDetailsDto | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openCall, setOpenCall] = useState(false);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openComplete, setOpenComplete] = useState(false);
  const [autoCompleteTriggered, setAutoCompleteTriggered] = useState(false);

  const fetch = async () => {
    if (!id) return;
    try {
      const res = await bookingsApi.getById(id);
      if (res.isSuccess && res.data) setData(res.data);
    } catch {}
  };

  console.log("res.data", data);

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

  const handleConfirm = async () => {
    if (!data?.id) return;
    try {
      const res = await bookingsApi.confirm(data?.id);
      if (res.isSuccess) {
        await fetch();
      }
    } catch {}
  };

  const handleSetCompleteStatus = async () => {
    if (!data?.id) return;
    try {
      const res = await bookingsApi.complete(data?.id);
      if (res.isSuccess) {
        await fetch();
        toast.success("Hoàn thành yêu cầu đặt phòng");
      }
    } catch {}
  };
  useEffect(() => {
    const readyToComplete =
      data?.status === EBookingStatus.Confirmed &&
      !!data?.bookingRoomTypes?.length &&
      data.bookingRoomTypes
        .flatMap((x) => x.bookingRooms)
        .every(
          (r) =>
            r.actualCheckInAt !== undefined &&
            r.actualCheckInAt !== null &&
            r.actualCheckOutAt !== undefined &&
            r.actualCheckOutAt !== null
        ) &&
      data.bookingRoomTypes.every((x) => {
        const assigned = x.bookingRooms?.length || 0;
        const required = x.totalRoom || 0;
        return assigned >= required && required > 0;
      });
    if (readyToComplete && !autoCompleteTriggered) {
      setAutoCompleteTriggered(true);
      handleSetCompleteStatus();
    }
    if (data?.status === EBookingStatus.Completed) {
      setAutoCompleteTriggered(true);
    }
  }, [data, autoCompleteTriggered]);

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
      2: { label: "Đã hoàn thành", color: "success" },
      3: { label: "Đã hoàn thành", color: "success" },
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
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", lg: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Booking #{data?.id?.substring(0, 8) || "—"}
          </Typography>
          {statusChip}
        </Stack>
        <Stack direction="row" spacing={1}>
          {data?.status !== EBookingStatus.Completed && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Edit />}
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
            </>
          )}

          {data?.status === EBookingStatus.Pending && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<Check />}
              onClick={() => setOpenConfirm(true)}
              aria-label="Xác nhận booking"
            >
              Xác nhận
            </Button>
          )}

          {data?.status === EBookingStatus.Confirmed && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Check />}
              onClick={() => setOpenComplete(true)}
              disabled={
                (data?.bookingRoomTypes
                  .flatMap((x) => x.bookingRooms)
                  .some(
                    (r) =>
                      r.actualCheckInAt === undefined ||
                      r.actualCheckInAt === null ||
                      r.actualCheckOutAt === undefined ||
                      r.actualCheckOutAt === null
                  ) ||
                  !data?.bookingRoomTypes?.every((x) => {
                    const assigned = x.bookingRooms?.length || 0;
                    const required = x.totalRoom || 0;
                    return assigned >= required && required > 0;
                  })) ??
                false
              }
              aria-label="Xác nhận booking"
            >
              Hoàn thành
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

      {/* Chi tiết phòng: gán phòng & check-in theo từng phòng của loại */}
      <Stack spacing={1}>
        <Typography variant="h6" fontWeight={800}>
          Gán Phòng & Check-in, Check-out
        </Typography>

        <RoomTypeAssignCheckIn booking={data as any} onRefresh={fetch} />
      </Stack>

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
      <ConfirmBookingModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        booking={data as any}
        onSubmitted={async () => {
          setOpenConfirm(false);
          await fetch();
        }}
      />

      {/* Call Log Modal */}
      <CallLogModal
        open={openCall}
        onClose={() => setOpenCall(false)}
        booking={data as any}
        onSubmitted={fetch}
      />

      <CompleteBookingModal
        open={openComplete}
        onClose={() => setOpenComplete(false)}
        booking={data as any}
        onProceed={() => {
          setOpenComplete(false);
          handleSetCompleteStatus();
        }}
      />

      <BookingInvoiceDialog
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        booking={data as any}
        onRefreshBooking={fetch}
      />
    </Stack>
  );
};

export default BookingDetailsPage;
