import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  capitalize,
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
import discountCodesApi from "../../../../../api/discountCodesApi";
import hotelService, { type Hotel } from "../../../../../api/hotelService";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import {
  moneyToVietnameseWords,
  formatDateVN,
} from "../../../../../utils/money-to-words";

// Promotion dialog
import PromotionDialog from "../../invoices/components/PromotionDialog";

// Icons
import PercentIcon from "@mui/icons-material/Percent";
import DiscountIcon from "@mui/icons-material/Discount";
import { Close, Print } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: BookingDetailsDto | null;
  onInvoiceCreated?: (invoice: InvoiceDto) => void;
  onRefreshBooking?: () => void | Promise<void>;
};

const currency = (v: number) => `${v.toLocaleString()} đ`;

const BookingInvoiceDialog: React.FC<Props> = ({
  open,
  onClose,
  booking,
  onInvoiceCreated,
  onRefreshBooking,
}) => {
  const { user, hotelId } = useStore<StoreState>((state) => state);
  const [promotionCode, setPromotionCode] = useState("");
  const [promotionValue, setPromotionValue] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);

  const [additionalNotes, setAdditionalNotes] = useState(
    booking?.additionalNotes ?? " "
  );
  const [additionalAmount, setAdditionalAmount] = useState<number>(
    booking?.additionalAmount ?? 0
  );

  const [promoOpen, setPromoOpen] = useState(false);
  const [additional, setAdditional] = useState<AdditionalChargesDto | null>();

  const [disableForPrint, setDisableForPrint] = useState(false);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [vatPercentage, setVatPercentage] = useState<number>(0);
  const [showVat, setShowVat] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Hoa don ${booking?.id?.substring(0, 8) ?? ""}`,
    onBeforePrint: async () => {
      setDisableForPrint(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
    },
    onAfterPrint: () => {
      setDisableForPrint(false);
      setShowVat(false);
    },
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
        setAdditionalNotes(booking.additionalNotes ?? "");
        setAdditionalAmount(booking.additionalAmount || 0);
        setPromotionCode(booking.promotionCode || "");
        setPromotionValue(booking.promotionValue || 0);
      } catch {}
    };

    load();
  }, [open, booking?.id]);

  useEffect(() => {
    const loadHotel = async () => {
      if (!open || !hotelId) return;
      try {
        const res = await hotelService.getHotelById(hotelId);
        if (res.isSuccess) setHotel(res.data);
      } catch {}
    };
    loadHotel();
  }, [open, hotelId]);

  // VAT is only fetched and shown when printing

  const tableRows = useMemo(() => {
    if (!booking)
      return [] as {
        label: string;
        quantity: number;
        nights?: number;
        unit: number;
        total: number;
      }[];
    const rows: {
      label: string;
      quantity: number;
      nights?: number;
      unit: number;
      total: number;
    }[] = [];
    for (const rt of booking.bookingRoomTypes || []) {
      const nights = Math.max(
        1,
        dayjs(rt.endDate).diff(dayjs(rt.startDate), "day")
      );
      const rooms = Math.max(rt.totalRoom, 1);
      const unit = rt.price * nights;
      rows.push({
        label: `Phòng ${rt.roomTypeName}`,
        quantity: rooms,
        nights,
        unit,
        total: unit * rooms,
      });
    }
    // if (ordersTotal > 0) {
    //   rows.push({
    //     label: "Đồ ăn/uống (đặt món)",
    //     quantity: 1,
    //     nights: undefined,
    //     unit: ordersTotal,
    //     total: ordersTotal,
    //   });
    // }
    for (const l of additional?.lines || []) {
      rows.push({
        label: l.description,
        quantity: 1,
        nights: undefined,
        unit: l.amount,
        total: l.amount,
      });
    }
    if (additionalAmount > 0) {
      rows.push({
        label:
          additionalNotes && additionalNotes.trim().length
            ? `Phụ thu thêm: ${additionalNotes.trim()}`
            : "Phụ thu thêm",
        quantity: 1,
        nights: undefined,
        unit: additionalAmount,
        total: additionalAmount,
      });
    }
    return rows;
  }, [booking, additional, ordersTotal, additionalAmount, additionalNotes]);

  const totals = useMemo(() => {
    const subtotal = tableRows
      .filter((r) => r.total > 0)
      .reduce((a, c) => a + c.total, 0);
    const discountAmt = Math.round((subtotal * (promotionValue || 0)) / 100);
    const deposit = booking?.depositAmount || 0;
    const taxableAmount = subtotal - discountAmt;
    const vatAmt = Math.round(
      (taxableAmount * (showVat ? vatPercentage || 0 : 0)) / 100
    );
    const finalNoVat = taxableAmount - deposit;
    const finalWithVat = taxableAmount + vatAmt - deposit;
    return {
      subtotal,
      discountAmt,
      deposit,
      taxableAmount,
      vatAmt,
      finalNoVat,
      finalWithVat,
    };
  }, [
    tableRows,
    promotionValue,
    booking?.depositAmount,
    vatPercentage,
    showVat,
  ]);

  // Confirm invoice
  const onConfirmInvoice = async () => {
    if (!booking?.id) return;

    try {
      const res = await invoicesApi.createBooking({
        bookingId: booking.id,
        promotionCode: promotionCode || undefined,
        discountCode: promotionCode || undefined,
        promotionValue: promotionValue || undefined,
        finalPayment:
          paymentAmount > 0 ? { amount: paymentAmount, type: 0 } : undefined,
        earlyCheckIn,
        lateCheckOut,
        additionalNotes,
        additionalAmount,
      });

      if (res.isSuccess) {
        toast.success("Xuất hóa đơn thành công");
        onInvoiceCreated?.(res.data);
        // Fetch VAT only when printing
        try {
          if (hotelId) {
            const vatRes = await hotelService.getVat(hotelId);
            if (vatRes.isSuccess) setVatPercentage(Number(vatRes.data || 0));
          }
        } catch {}
        setShowVat(true);
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
      <Box ref={invoiceRef}>
        <DialogContent sx={{ pb: 1 }}>
          <Stack spacing={1}>
            <Stack spacing={1}>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  textAlign: "center",
                  color: "#d32f2f",
                }}
              >
                HÓA ĐƠN THANH TOÁN
              </Typography>
              {hotel && (
                <Stack
                  spacing={0.2}
                  sx={{ color: "#c62828" }}
                  justifyContent={"center"}
                >
                  <Typography textAlign={"center"} fontWeight={600}>
                    {hotel.name}
                  </Typography>
                  <Typography textAlign={"center"}>
                    Địa chỉ: {hotel.address || "—"}
                  </Typography>
                  <Typography textAlign={"center"}>
                    SĐT: {hotel.phone || "—"}
                  </Typography>
                </Stack>
              )}

              <Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ color: "#c62828" }}
                >
                  <Typography>Tên khách hàng:</Typography>
                  <Typography sx={{ ml: 1, color: "text.primary" }}>
                    {booking?.primaryGuestName || "—"}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ color: "#c62828" }}
                >
                  <Typography>SĐT:</Typography>
                  <Typography sx={{ ml: 1, color: "text.primary" }}>
                    {booking?.phoneNumber || "—"}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Box>
              <Table
                size="small"
                sx={{
                  width: "100%",
                  border: "2px solid #c62828",
                  borderCollapse: "collapse",
                  "& .MuiTableCell-root": {
                    borderBottom: "1px dotted #c62828",
                    padding: "8px",
                  },
                  "& .MuiTableCell-root:not(:last-of-type)": {
                    borderRight: "2px solid #c62828",
                  },
                  "& thead .MuiTableCell-root": {
                    borderBottom: "2px solid #c62828",
                    fontWeight: 700,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ width: "8%" }}>
                      <b>TT</b>
                    </TableCell>
                    <TableCell sx={{ width: "40%" }}>
                      <b>Nội dung</b>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%" }}>
                      <b>SL</b>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "8%" }}>
                      <b>Đêm</b>
                    </TableCell>
                    <TableCell align="right" sx={{ width: "17%" }}>
                      <b>Đơn giá</b>
                    </TableCell>
                    <TableCell align="right" sx={{ width: "17%" }}>
                      <b>Thành tiền</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((it, idx) => (
                    <TableRow key={`${it.label}-${idx}`}>
                      <TableCell align="center">{idx + 1}</TableCell>
                      <TableCell>{it.label}</TableCell>
                      <TableCell align="center">{it.quantity}</TableCell>
                      <TableCell align="center">
                        {typeof it.nights === "number" ? it.nights : "—"}
                      </TableCell>
                      <TableCell align="right">{currency(it.unit)}</TableCell>
                      <TableCell align="right">{currency(it.total)}</TableCell>
                    </TableRow>
                  ))}
                  {booking && (booking.depositAmount || 0) > 0 && (
                    <TableRow>
                      <TableCell align="center">
                        {tableRows.length + 1}
                      </TableCell>
                      <TableCell sx={{ color: "#c62828" }}>
                        Khấu trừ tiền cọc
                      </TableCell>
                      <TableCell align="center">1</TableCell>
                      <TableCell align="center">__</TableCell>
                      <TableCell align="right">
                        {currency(booking.depositAmount)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#c62828" }}>
                        -{currency(booking.depositAmount)}
                      </TableCell>
                    </TableRow>
                  )}
                  {promotionValue > 0 && (
                    <TableRow>
                      <TableCell align="center">
                        {booking && booking.depositAmount > 0
                          ? tableRows.length + 2
                          : tableRows.length + 1}
                      </TableCell>
                      <TableCell sx={{ color: "#2e7d32" }}>
                        Giảm giá ({promotionCode ? `${promotionCode} - ` : ""}$
                        {promotionValue}%)
                      </TableCell>
                      <TableCell align="center">1</TableCell>
                      <TableCell align="center">—</TableCell>
                      <TableCell align="right">
                        {currency(totals.discountAmt)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#2e7d32" }}>
                        -{currency(totals.discountAmt)}
                      </TableCell>
                    </TableRow>
                  )}
                  {showVat && vatPercentage > 0 && (
                    <TableRow>
                      <TableCell align="center">
                        {tableRows.length +
                          (booking && booking.depositAmount > 0 ? 1 : 0) +
                          (promotionValue > 0 ? 1 : 0) +
                          1}
                      </TableCell>
                      <TableCell sx={{ color: "#c62828" }}>
                        Thuế VAT ({vatPercentage}%)
                      </TableCell>
                      <TableCell align="center">1</TableCell>
                      <TableCell align="center">—</TableCell>
                      <TableCell align="right">
                        {currency(totals.vatAmt)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#c62828" }}>
                        +{currency(totals.vatAmt)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell align="center"></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tổng cộng</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {currency(
                        showVat ? totals.finalWithVat : totals.finalNoVat
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Stack spacing={0.8} sx={{ mt: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ color: "#c62828" }}
                >
                  <Typography>Bằng chữ:</Typography>
                  <Typography
                    sx={{
                      fontStyle: "italic",
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {capitalize(
                      moneyToVietnameseWords(
                        showVat ? totals.finalWithVat : totals.finalNoVat
                      )
                    )}
                  </Typography>
                </Stack>
              </Stack>

              {!disableForPrint && (
                <Stack spacing={2} mt={1}>
                  {promotionValue > 0 && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PercentIcon color="primary" />
                      <Typography fontWeight={700}>Mã giảm giá</Typography>
                      <Chip
                        sx={{ fontSize: "0.9rem" }}
                        color="primary"
                        label={`${promotionCode} - ${promotionValue}%`}
                        onDelete={() => {
                          setPromotionCode("");
                          setPromotionValue(0);
                        }}
                      />
                    </Stack>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<DiscountIcon />}
                    onClick={() => {
                      toast.info("Tính năng đang trong quá trình phát triển!");
                      // setPromoOpen(true);
                    }}
                    sx={{ width: "fit-content" }}
                  >
                    Chọn mã khuyến mãi
                  </Button>
                  <TextField
                    type="number"
                    value={
                      additionalAmount !== undefined &&
                      additionalAmount !== null
                        ? new Intl.NumberFormat("vi-VN").format(
                            Number(additionalAmount)
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const num = raw ? Number(raw) : 0;
                      setAdditionalAmount(num);
                    }}
                    label="Phụ thu"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="start">VND</InputAdornment>
                        ),
                      },
                    }}
                    placeholder="Nhập phụ thu"
                    fullWidth
                  />
                  <TextField
                    value={additionalNotes}
                    label="Ghi chú"
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Nhập ghi chú"
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Stack>
              )}

              <Grid container mt={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack justifyContent={"center"} alignItems="center">
                    <Typography sx={{ color: "#c62828", opacity: 0 }}>
                      Khách hàng
                    </Typography>
                    <Typography sx={{ color: "#c62828" }}>
                      Khách hàng
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack justifyContent={"center"} alignItems="center">
                    <Typography sx={{ fontStyle: "italic", color: "#c62828" }}>
                      {formatDateVN(new Date())}
                    </Typography>
                    <Typography sx={{ color: "#c62828" }}>Lễ tân</Typography>
                    <Typography>{user?.fullname || "—"}</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
      </Box>

      <Divider sx={{ mb: 1, mt: 1 }} />
      {!disableForPrint && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Close />}
            color="error"
            onClick={onClose}
          >
            Đóng
          </Button>
          <Button
            startIcon={<Print />}
            variant="contained"
            onClick={onConfirmInvoice}
          >
            Xuất hóa đơn
          </Button>
        </DialogActions>
      )}

      <PromotionDialog
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        allowedScope={"booking"}
        onApply={(code) => {
          setPromotionCode(code.code);
          setPromotionValue(code.value);
          setPromoOpen(false);
        }}
      />
    </Dialog>
  );
};

export default BookingInvoiceDialog;
