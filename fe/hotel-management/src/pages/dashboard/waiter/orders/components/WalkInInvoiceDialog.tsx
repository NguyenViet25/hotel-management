import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import ordersApi, {
  type OrderDetailsDto,
  type OrderSummaryDto,
} from "../../../../../api/ordersApi";
import invoicesApi, { type InvoiceDto } from "../../../../../api/invoicesApi";
import hotelService, { type Hotel } from "../../../../../api/hotelService";

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderSummaryDto | null;
  hotelId?: string | null;
  onInvoiceCreated?: (invoice: InvoiceDto) => void;
};

const currency = (v: number) => `${v.toLocaleString()} đ`;

const WalkInInvoiceDialog: React.FC<Props> = ({
  open,
  onClose,
  order,
  hotelId,
  onInvoiceCreated,
}) => {
  const [details, setDetails] = useState<OrderDetailsDto | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [disableForPrint, setDisableForPrint] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Hoa don ${order?.id?.slice(0, 8) ?? ""}`,
    onBeforePrint: async () => setDisableForPrint(true),
    onAfterPrint: () => setDisableForPrint(false),
  });

  useEffect(() => {
    const load = async () => {
      if (!open || !order?.id) return;
      try {
        const res = await ordersApi.getById(order.id);
        if (res.isSuccess) setDetails(res.data);
      } catch {}

      try {
        const list = await invoicesApi.list({
          orderId: order.id,
          page: 1,
          pageSize: 1,
        });
        const item = list?.data?.items?.[0];
        if (item) {
          const det = await invoicesApi.getById(item.id);
          if (det.isSuccess) setInvoice(det.data);
        } else {
          setInvoice(null);
        }
      } catch {}
    };
    load();
  }, [open, order?.id]);

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

  const totals = useMemo(() => {
    const subtotal = (details?.items || []).reduce(
      (acc, it) => acc + it.quantity * it.unitPrice,
      0
    );
    return { subtotal, total: subtotal };
  }, [details]);

  const onCreateInvoice = async () => {
    if (!order?.id) return;
    try {
      const res = await invoicesApi.createWalkIn({ orderId: order.id });
      if (res.isSuccess) {
        setInvoice(res.data);
        onInvoiceCreated?.(res.data);
        handlePrint?.();
      }
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Box ref={invoiceRef}>
        <DialogTitle
          sx={{
            fontSize: "1.3rem",
            fontWeight: 800,
            textAlign: "center",
            color: "#d32f2f",
          }}
        >
          HÓA ĐƠN THANH TOÁN
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
          <Stack spacing={2}>
            <Box sx={{ p: 2 }}>
              <Stack spacing={1}>
                {hotel && (
                  <Stack spacing={0.5}>
                    <Typography fontWeight={800}>{hotel.name}</Typography>
                    <Typography color="text.secondary">
                      {hotel.address}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography>ĐT: {hotel.phone || "—"}</Typography>
                      <Typography>Email: {hotel.email || "—"}</Typography>
                    </Stack>
                  </Stack>
                )}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack>
                    <Typography>
                      Ngày: {new Date().toLocaleDateString("vi-VN")} | Mã đơn: #
                      {order?.id?.slice(0, 8).toUpperCase()}
                    </Typography>
                    {invoice && (
                      <Typography>
                        Số hóa đơn: <b>{invoice.invoiceNumber}</b>
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={0.5}>
                  <Typography>
                    Khách hàng: {order?.customerName || "—"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {details && (
              <Box sx={{ p: 1 }}>
                <Table
                  size="small"
                  sx={{
                    border: "1px solid #d32f2f",
                    "& td, & th": { border: "1px dotted #d32f2f" },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">
                        <b>TT</b>
                      </TableCell>
                      <TableCell>
                        <b>Nội dung</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>SL</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Đơn giá</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Thành tiền</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(details.items || []).map((it, idx) => (
                      <TableRow key={it.id}>
                        <TableCell align="center">{idx + 1}</TableCell>
                        <TableCell>{it.menuItemName}</TableCell>
                        <TableCell align="right">
                          {currency(it.unitPrice)}
                        </TableCell>
                        <TableCell align="right">{it.quantity}</TableCell>
                        <TableCell align="right">
                          {currency(it.quantity * it.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Stack spacing={1.2} sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={700}>Tổng cộng</Typography>
                    <Typography fontWeight={800}>
                      {currency(totals.total)}
                    </Typography>
                  </Stack>
                  <Typography>Bằng chữ: ——</Typography>
                  <Typography>
                    Ngày {new Date().getDate()} tháng{" "}
                    {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={6}
                  justifyContent="space-between"
                >
                  <Typography>Khách hàng</Typography>
                  <Typography>Thu ngân</Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Box>

      {!disableForPrint && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Đóng</Button>
          {invoice ? (
            <Button variant="contained" onClick={() => handlePrint?.()}>
              In hóa đơn
            </Button>
          ) : (
            <Button variant="contained" onClick={onCreateInvoice}>
              Xuất hóa đơn
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default WalkInInvoiceDialog;
