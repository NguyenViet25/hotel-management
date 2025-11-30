import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  capitalize,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
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
import {
  moneyToVietnameseWords,
  formatDateVN,
} from "../../../../../utils/money-to-words";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import { Close, Print } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderSummaryDto | null;
  onInvoiceCreated?: (invoice: InvoiceDto) => void;
};

const currency = (v: number) => `${v.toLocaleString()} đ`;

const WalkInInvoiceDialog: React.FC<Props> = ({
  open,
  onClose,
  order,
  onInvoiceCreated,
}) => {
  const [details, setDetails] = useState<OrderDetailsDto | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [disableForPrint, setDisableForPrint] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { user, hotelId } = useStore<StoreState>((state) => state);

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
        <DialogContent
          sx={{
            pb: 1,
          }}
        >
          <Stack spacing={1.5}>
            <Stack>
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
              <Stack
                direction={{ sm: "row" }}
                alignItems="center"
                justifyContent="center"
              >
                {invoice && (
                  <Typography sx={{ fontSize: "0.8rem" }}>
                    Số hóa đơn: <b>{invoice.invoiceNumber}</b>
                  </Typography>
                )}
              </Stack>
            </Stack>
            <Stack spacing={1}>
              {hotel && (
                <Stack spacing={0.2} sx={{ color: "#c62828" }}>
                  <Typography fontWeight={800}>{hotel.name}</Typography>
                  <Typography>ĐC: {hotel.address || "—"}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Typography>ĐT: {hotel.phone || "—"}</Typography>
                    <Typography>Email: {hotel.email || "—"}</Typography>
                  </Stack>
                </Stack>
              )}

              <Stack
                direction={{ sx: "column", lg: "row" }}
                spacing={1}
                justifyContent={"space-between"}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ color: "#c62828" }}
                >
                  <Typography>Tên khách hàng:</Typography>
                  <Typography sx={{ ml: 1, color: "text.primary" }}>
                    {order?.customerName || "—"}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ color: "#c62828" }}
                >
                  <Typography>SĐT:</Typography>
                  <Typography sx={{ ml: 1, color: "text.primary" }}>
                    {order?.customerPhone || "—"}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {details && (
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
                      <TableCell sx={{ width: "52%" }}>
                        <b>Nội dung</b>
                      </TableCell>
                      <TableCell align="right" sx={{ width: "10%" }}>
                        <b>SL</b>
                      </TableCell>
                      <TableCell align="right" sx={{ width: "15%" }}>
                        <b>Đơn giá</b>
                      </TableCell>
                      <TableCell align="right" sx={{ width: "15%" }}>
                        <b>Thành tiền</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(details.items || []).map((it, idx) => (
                      <TableRow key={it.id}>
                        <TableCell align="center">{idx + 1}</TableCell>
                        <TableCell>{it.menuItemName}</TableCell>
                        <TableCell align="right">{it.quantity}</TableCell>
                        <TableCell align="right">
                          {currency(it.unitPrice)}
                        </TableCell>
                        <TableCell align="right">
                          {currency(it.quantity * it.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell align="center"></TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tổng cộng</TableCell>
                      <TableCell align="right"></TableCell>
                      <TableCell align="right"></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {currency(totals.total)}
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
                      {capitalize(moneyToVietnameseWords(totals.total))}
                    </Typography>
                  </Stack>
                </Stack>
                <Grid container mt={1}>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Stack justifyContent={"center"} alignItems="center">
                      <Typography sx={{ color: "#c62828", opacity: 0 }}>
                        Khách hàng
                      </Typography>
                      <Typography sx={{ color: "#c62828" }}>
                        Khách hàng
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Stack justifyContent={"center"} alignItems="center">
                      <Typography
                        sx={{
                          fontStyle: "italic",
                          color: "#c62828",
                        }}
                      >
                        {formatDateVN(new Date())}
                      </Typography>
                      <Typography sx={{ color: "#c62828" }}>Lễ tân</Typography>
                      <Typography>{user?.fullname || "—"} </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}
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
          {invoice ? (
            <Button
              startIcon={<Print />}
              variant="contained"
              onClick={() => handlePrint?.()}
            >
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
