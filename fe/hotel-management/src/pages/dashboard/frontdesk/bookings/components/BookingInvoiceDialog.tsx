import {
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";

// APIs
import bookingsApi, {
  type AdditionalChargesDto,
  type BookingDetailsDto,
} from "../../../../../api/bookingsApi";
import invoicesApi, { type InvoiceDto } from "../../../../../api/invoicesApi";
import ordersApi from "../../../../../api/ordersApi";

// Promotion dialog
import PromotionDialog from "../../invoices/components/PromotionDialog";

// Icons
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HotelIcon from "@mui/icons-material/Hotel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PercentIcon from "@mui/icons-material/Percent";
import DiscountIcon from "@mui/icons-material/Discount";
import { formatDateTime } from "../../../../../utils/date-helper";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDetailsDto | null;
  onInvoiceCreated?: (invoice: InvoiceDto) => void;
  onRefreshBooking?: () => void | Promise<void>;
};

const BookingInvoiceDialog: React.FC<Props> = ({
  open,
  onClose,
  booking,
  onInvoiceCreated,
  onRefreshBooking,
}) => {
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);

  const [promoOpen, setPromoOpen] = useState(false);
  const [additional, setAdditional] = useState<AdditionalChargesDto | null>(
    null
  );
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDto | null>(null);
  const [disableForPrint, setDisableForPrint] = useState(false);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Hoa don ${booking?.id?.substring(0, 8) ?? ""}`,
    onBeforePrint: async () => setDisableForPrint(true),
    onAfterPrint: () => setDisableForPrint(false),
  });

  // Load booking data
  useEffect(() => {
    const load = async () => {
      if (!open || !booking?.id) return;

      try {
        const prev = await bookingsApi.additionalChargesPreview(booking.id);
        if (prev.isSuccess) setAdditional(prev.data);
      } catch {}

      try {
        const os = await ordersApi.listOrders({
          bookingId: booking.id,
          pageSize: 100,
        });
        const sum = (os.data || [])
          .filter((o) => o.status !== "3")
          .reduce((acc, cur) => acc + (cur.itemsTotal || 0), 0);
        setOrdersTotal(sum);
      } catch {}

      try {
        const list = await invoicesApi.list({
          bookingId: booking.id,
          page: 1,
          pageSize: 1,
        });
        const item = list?.data?.items?.[0];

        if (item) {
          const det = await invoicesApi.getById(item.id);
          if (det.isSuccess) setInvoiceDetails(det.data);
        } else {
          setInvoiceDetails(null);
        }
      } catch {}
    };

    load();
  }, [open, booking?.id]);

  // Date range
  const dateRange = useMemo(() => {
    if (!booking) return { start: "—", end: "—", nights: 0 };

    const start = booking.bookingRoomTypes?.[0]?.startDate || "—";
    const end = booking.bookingRoomTypes?.[0]?.endDate || "—";

    const nights = Math.max(1, dayjs(end).diff(dayjs(start), "day"));
    return { start, end, nights };
  }, [booking]);

  // Charges lines
  const lines = useMemo(() => {
    if (!booking) return [];

    const roomLines = (booking.bookingRoomTypes || []).map((rt) => {
      const nights = Math.max(
        1,
        dayjs(rt.endDate).diff(dayjs(rt.startDate), "day")
      );
      const rooms = Math.max(rt.bookingRooms?.length || 0, 1);

      return {
        label: `${rt.roomTypeName} x ${rooms} (${nights} đêm)`,
        amount: rt.price * nights * rooms,
      };
    });

    const fnbLine =
      ordersTotal > 0
        ? [{ label: "Đồ ăn/uống (đặt món)", amount: ordersTotal }]
        : [];

    const surchargeLines = (additional?.lines || []).map((l) => ({
      label: l.description,
      amount: l.amount,
    }));

    const depositLine =
      (booking.depositAmount || 0) > 0
        ? [
            {
              label: "Khấu trừ tiền cọc",
              amount: -(booking.depositAmount || 0),
            },
          ]
        : [];

    return [...roomLines, ...fnbLine, ...surchargeLines, ...depositLine];
  }, [booking, additional, ordersTotal]);

  // Totals
  const base = lines
    .filter((x) => x.amount > 0)
    .reduce((a, c) => a + c.amount, 0);

  const discountAmt = Math.round((base * (discountPercent || 0)) / 100);
  const after = base - discountAmt;

  // Confirm invoice
  const onConfirmInvoice = async () => {
    if (!booking?.id) return;

    try {
      const res = await invoicesApi.createBooking({
        bookingId: booking.id,
        discountCode: discountCode || undefined,
        finalPayment:
          paymentAmount > 0 ? { amount: paymentAmount, type: 0 } : undefined,
        earlyCheckIn,
        lateCheckOut,
      });

      if (res.isSuccess) {
        toast.success("Xuất hóa đơn thành công");
        setInvoiceDetails(res.data);
        onInvoiceCreated?.(res.data);
        handlePrint?.();
        await onRefreshBooking?.();
      } else {
        toast.error(res.message || "Không thể xuất hóa đơn");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi xuất hóa đơn");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.4,
          fontSize: "1.35rem",
          fontWeight: 700,
        }}
      >
        <ReceiptLongIcon color="primary" sx={{ fontSize: 30 }} />
        Xuất hóa đơn
      </DialogTitle>

      <DialogContent
        sx={{
          mt: 1,
          pb: 1,
          fontSize: "0.85rem",
          "& .MuiTypography-root": { fontSize: "0.9rem" },
          "& .MuiButton-root": { fontSize: "0.85rem", py: 1, px: 1.5 },
          "& .MuiChip-root": { fontSize: "0.75rem" },
          "& .MuiTextField-root input": { fontSize: "0.85rem" },
        }}
      >
        <Stack spacing={3}>
          <div ref={invoiceRef}>
            {/* ============================
                SECTION 1 — INFORMATION
            ============================= */}
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: "#fafcff",
              }}
            >
              <Stack spacing={3}>
                {/* Guest info */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <HotelIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Thông tin khách & đặt phòng
                  </Typography>
                </Stack>

                <Stack spacing={0.5} pl={4}>
                  <Typography>
                    <b>Khách:</b> {booking?.primaryGuestName}
                  </Typography>
                  <Typography>
                    <b>Booking:</b> #{booking?.id?.substring(0, 8)}
                  </Typography>
                </Stack>

                {/* Stay info */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CalendarMonthIcon color="secondary" />
                  <Typography variant="h6" fontWeight={700}>
                    Thời gian lưu trú
                  </Typography>
                </Stack>

                <Typography pl={4}>
                  {formatDateTime(dateRange.start)} →{" "}
                  {formatDateTime(dateRange.end)} (<b>{dateRange.nights}</b>{" "}
                  đêm)
                </Typography>
              </Stack>
            </Card>

            {/* ============================
                SECTION 2 — SUMMARY
            ============================= */}
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                background: "linear-gradient(135deg,#f4f7ff,#e9f1ff)",
                mt: 3,
              }}
            >
              <Stack spacing={3}>
                {/* Charges header */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ReceiptIcon color="info" />
                  <Typography variant="h6" fontWeight={700}>
                    Chi tiết chi phí
                  </Typography>
                </Stack>

                {/* Charges list */}
                <Stack pl={2} spacing={1}>
                  {lines.map((l, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      justifyContent="space-between"
                      sx={{ pr: 1 }}
                    >
                      <Typography>{l.label}</Typography>
                      <Typography fontWeight={600}>
                        {l.amount.toLocaleString()} đ
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                {/* Discount card */}
                {discountPercent > 0 && (
                  <Card
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: "1px dashed #42a5f5",
                      bgcolor: "#e3f2fd",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PercentIcon color="primary" />
                      <Typography fontWeight={700}>Mã giảm giá</Typography>
                    </Stack>

                    <Chip
                      sx={{ mt: 1, fontSize: "0.9rem", ml: 1 }}
                      color="primary"
                      label={`${discountCode} - ${discountPercent}%`}
                    />
                  </Card>
                )}

                {/* Promotion button */}
                <Button
                  variant="outlined"
                  startIcon={<DiscountIcon />}
                  onClick={() => setPromoOpen(true)}
                  sx={{ width: "fit-content" }}
                >
                  Chọn mã khuyến mãi
                </Button>

                {/* Early/Late */}
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={earlyCheckIn}
                        onChange={(e) => setEarlyCheckIn(e.target.checked)}
                      />
                    }
                    label="Early Check-in"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={lateCheckOut}
                        onChange={(e) => setLateCheckOut(e.target.checked)}
                      />
                    }
                    label="Late Check-out"
                  />
                </Stack>

                {/* Total */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "white",
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="h6" fontWeight={700}>
                    Tổng cộng
                  </Typography>

                  <Typography variant="h4" fontWeight={800} color="primary">
                    {after.toLocaleString()} đ
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </div>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Hủy</Button>

        {invoiceDetails ? (
          <Button variant="contained" onClick={() => handlePrint?.()}>
            In hóa đơn
          </Button>
        ) : (
          <Button variant="contained" onClick={onConfirmInvoice} sx={{ px: 3 }}>
            Xác nhận & Xuất hóa đơn
          </Button>
        )}
      </DialogActions>

      <PromotionDialog
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        onApply={(code) => {
          setDiscountCode(code.code);
          setDiscountPercent(code.value);
          setPromoOpen(false);
        }}
      />
    </Dialog>
  );
};

export default BookingInvoiceDialog;
