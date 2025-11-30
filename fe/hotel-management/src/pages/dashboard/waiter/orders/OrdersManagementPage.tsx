import { Check, Close, Edit } from "@mui/icons-material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams } from "react-router-dom";
import ordersApi, {
  type OrderDetailsDto,
  type OrderStatus,
  type OrderSummaryDto,
} from "../../../../api/ordersApi";
import invoicesApi from "../../../../api/invoicesApi";
import ConfirmModal from "../../../../components/common/ConfirmModel";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import PromotionDialog from "../../frontdesk/invoices/components/PromotionDialog";
import OrderFormModal from "./components/OrderFormModal";
import OrdersTable from "./components/OrdersTable";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import menusApi, { type MenuItemDto } from "../../../../api/menusApi";

import PersonIcon from "@mui/icons-material/Person";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CalculateIcon from "@mui/icons-material/Calculate";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";

// Orders Management Page (UC-28, UC-29, UC-30)
// - Lists orders with filters (status/search)
// - Create walk-in orders and booking orders
// - Edit order (status/notes/discount)
// - Cancel order (set status to Cancelled)
const OrdersManagementPage: React.FC = () => {
  // Filters
  const [status, _] = useState<OrderStatus | undefined>("0");
  const [search, setSearch] = useState<string>("");
  const { hotelId, user } = useStore<StoreState>((state) => state);
  const [searchParams, setSearchParams] = useSearchParams();

  // Set a query param

  // Table data
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const walkInOrders = orders.filter((o) => o.isWalkIn);
  const bookingOrders = orders.filter((o) => o.isWalkIn === false);

  // Modals
  const [openOrder, setOpenOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsDto | null>(
    null
  );
  const [value, setValue] = React.useState(0);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  // Feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedForInvoice, setSelectedForInvoice] =
    useState<OrderSummaryDto | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsDto | null>(
    null
  );
  const [orderInvoiceMap, setOrderInvoiceMap] = useState<
    Record<string, { id: string; invoiceNumber?: string }>
  >({});
  const [disableForPrint, setDisableForPrint] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<
    Record<string, OrderDetailsDto["items"]>
  >({});

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Hoa don ${selectedForInvoice?.id?.slice(0, 8) ?? ""}`,
    onBeforePrint: () => {
      setDisableForPrint(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    },
    onAfterPrint: () => setDisableForPrint(false),
  });

  // Fetch orders based on filters and pagination
  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await ordersApi.listOrders({
        hotelId: hotelId || undefined,
        status,
        search: search || undefined,
        page: pageNum,
        pageSize,
      });
      if (res.isSuccess) {
        setOrders(res.data);
        setTotal(res.meta?.total ?? res.data.length);
        setPage(res.meta?.page ?? pageNum);
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: res.message || "Không thể tải danh sách order",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Đã xảy ra lỗi khi tải danh sách order",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, hotelId]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await menusApi.getMenuItems({
          isActive: true,
          page: 1,
          pageSize: 200,
        });
        if (res.isSuccess) setMenuItems(res.data || []);
      } catch {}
    };
    if (viewMode === "card") loadMenu();
  }, [viewMode]);

  useEffect(() => {
    const loadDetailsForPage = async () => {
      if (viewMode !== "card") return;
      if (!orders?.length) {
        setOrderItemsMap({});
        return;
      }
      try {
        const results = await Promise.all(
          orders.map((o) => ordersApi.getById(o.id))
        );
        const map: Record<string, OrderDetailsDto["items"]> = {};
        orders.forEach((o, idx) => {
          const d = results[idx];
          if (d?.isSuccess) map[o.id] = d.data.items || [];
        });
        setOrderItemsMap(map);
      } catch {}
    };
    loadDetailsForPage();
  }, [orders, viewMode]);

  const openEditModal = async (summary: OrderDetailsDto) => {
    setSelectedOrder(summary);
    setOpenOrder(true);
  };

  const cancelOrder = async (summary: OrderSummaryDto) => {
    try {
      await ordersApi.updateWalkIn(summary.id, {
        status: 3 as any,
        notes: `Hủy yêu cầu đặt món bởi ${user?.fullname || "hệ thống."}`,
        customerName: summary.customerName,
        customerPhone: summary.customerPhone,
        hotelId: hotelId,
        id: summary.id,
      });
      setSnackbar({ open: true, severity: "success", message: "Đã hủy order" });
      fetchOrders(page);
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Không thể hủy order",
      });
    }
  };

  const onCreateInvoice = async () => {
    if (!selectedForInvoice) return;
    try {
      const res = await invoicesApi.createWalkIn({
        orderId: selectedForInvoice.id,
        discountCode: discountCode || undefined,
      });
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          severity: "success",
          message: `Đã xuất hóa đơn khách vãng lai: ${
            res.data?.invoiceNumber || ""
          }`,
        });
        const created = res.data;
        if (created && selectedForInvoice) {
          setOrderInvoiceMap((m) => ({
            ...m,
            [selectedForInvoice.id]: {
              id: created.id,
              invoiceNumber: created.invoiceNumber,
            },
          }));
        }
        setDiscountCode("");
        fetchOrders(page);
        handlePrint?.();
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: res.message || "Không thể xuất hóa đơn",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Không thể xuất hóa đơn",
      });
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!invoiceOpen || !selectedForInvoice) return;
      try {
        const res = await ordersApi.getById(selectedForInvoice.id);
        if (res.isSuccess) setOrderDetails(res.data);
      } catch {}
    };
    load();
  }, [invoiceOpen, selectedForInvoice]);

  useEffect(() => {
    const run = async () => {
      if (!orders?.length) {
        setOrderInvoiceMap({});
        return;
      }
      const candidates = orders.filter((o) => o.isWalkIn);
      try {
        const results = await Promise.all(
          candidates.map((o) =>
            invoicesApi.list({
              hotelId: hotelId || undefined,
              orderId: o.id,
              page: 1,
              pageSize: 1,
            })
          )
        );
        const map: Record<string, { id: string; invoiceNumber?: string }> = {};
        candidates.forEach((o, idx) => {
          const item = results[idx]?.data?.items?.[0];
          if (item)
            map[o.id] = { id: item.id, invoiceNumber: item.invoiceNumber };
        });
        setOrderInvoiceMap(map);
      } catch {}
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, hotelId]);

  useEffect(() => {
    setSearchParams({ tabValue: value.toString() });
  }, [value]);

  useLayoutEffect(() => {
    const tabValue = searchParams.get("tabValue");
    if (tabValue !== null) {
      setValue(Number(tabValue));
    }
  }, []);

  return (
    <Box>
      <PageTitle
        title="Quản lý yêu cầu đặt món"
        subtitle="Tạo yêu cầu đặt món khách vãng lai, khách đặt phòng, xem danh sách đang phục vụ/đã thanh toán"
      />
      <Box
        sx={{
          backgroundColor: "#fff",
          width: "100%",
          borderRadius: 2,
          borderEndEndRadius: 0,
          borderEndStartRadius: 0,
          border: "1px solid #e0e0e0",
          borderBottom: "none",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          TabIndicatorProps={{
            style: {
              backgroundColor: "#1976d2",
              height: 3,
              borderRadius: 3,
            },
          }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minHeight: 48,
              color: "#555",
              transition: "all 0.3s ease",
            },
            "& .MuiTab-root:hover": {
              backgroundColor: "#f5f5f5",
            },
            "& .Mui-selected": {
              color: "#1976d2",
              backgroundColor: "#E3F2FD",
            },
          }}
        >
          <Tab
            label="Khách vãng lai"
            sx={{
              borderRadius: 2,
              borderEndEndRadius: 0,
              borderEndStartRadius: 0,
              borderStartEndRadius: 0,
            }}
          />
          <Tab
            label="Khách đặt phòng"
            sx={{
              borderRadius: 2,
              borderEndEndRadius: 0,
              borderEndStartRadius: 0,
              borderStartStartRadius: 0,
            }}
          />
        </Tabs>
      </Box>

      {viewMode === "table" ? (
        <OrdersTable
          data={value === 1 ? bookingOrders : walkInOrders}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => fetchOrders(p)}
          onAddOrder={() => setOpenOrder(true)}
          onEdit={(o) => openEditModal(o as any)}
          onCancel={(o) => {
            setSelectedOrder(o as any);
            setConfirmOpen(true);
          }}
          onSearch={(e) => setSearch(e)}
          onCreateInvoice={(row) => {
            setSelectedForInvoice(row);
            setInvoiceOpen(true);
          }}
          onSelectPromotion={(row) => {
            setSelectedForInvoice(row);
            setPromoOpen(true);
          }}
          invoiceMap={orderInvoiceMap}
          onPrintInvoice={(row) => {
            setSelectedForInvoice(row);
            setInvoiceOpen(true);
          }}
        />
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {(value === 1 ? bookingOrders : walkInOrders).map((o) => {
            const items = orderItemsMap[o.id] || [];
            const foods = items.filter((it) => {
              const mi = menuItems.find((m) => m.id === it.menuItemId);
              return (mi?.category || "").trim() !== "Set";
            });
            const sets = items.filter((it) => {
              const mi = menuItems.find((m) => m.id === it.menuItemId);
              return (mi?.category || "").trim() === "Set";
            });
            return (
              <Card key={o.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ReceiptIcon color="primary" />
                        <Typography fontWeight={700}>
                          #{String(o.id).slice(0, 8).toUpperCase()}
                        </Typography>
                        <Chip
                          label={o.isWalkIn ? "Vãng lai" : "Đặt phòng"}
                          size="small"
                        />
                        <Chip label={`SL: ${o.itemsCount}`} size="small" />
                        <Chip
                          label={`${o.itemsTotal.toLocaleString()} đ`}
                          size="small"
                          color="primary"
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography color="text.secondary">
                          {new Date(o.createdAt).toLocaleString()}
                        </Typography>
                        <Chip
                          color={
                            o.status === "2"
                              ? "success"
                              : o.status === "3"
                              ? "error"
                              : "default"
                          }
                          label={
                            o.status === "2"
                              ? "Đã thanh toán"
                              : o.status === "3"
                              ? "Đã hủy"
                              : "Đang xử lý"
                          }
                        />
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PersonIcon color="action" />
                          <Typography>{o.customerName || "—"}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PhoneIphoneIcon color="action" />
                          <Typography>{o.customerPhone || "—"}</Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {orderInvoiceMap[o.id] && (
                          <Chip
                            label={`HĐ: ${
                              orderInvoiceMap[o.id].invoiceNumber || "đã tạo"
                            }`}
                            color="default"
                          />
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => openEditModal(o as any)}
                        >
                          Sửa
                        </Button>
                        {o.isWalkIn && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ReceiptLongIcon />}
                            disabled={o.status === "2" || o.status === "3"}
                            onClick={() => {
                              setSelectedForInvoice(o);
                              setInvoiceOpen(true);
                            }}
                          >
                            Xuất hóa đơn
                          </Button>
                        )}
                      </Stack>
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Món ăn
                      </Typography>
                      {foods.length === 0 ? (
                        <Typography color="text.secondary">
                          Không có món
                        </Typography>
                      ) : (
                        foods.map((it) => {
                          const mi = menuItems.find(
                            (m) => m.id === it.menuItemId
                          );
                          return (
                            <Stack
                              key={it.id}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <img
                                src={mi?.imageUrl || "/assets/logo.png"}
                                alt={mi?.name || it.menuItemName}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 6,
                                  objectFit: "cover",
                                  border: "1px solid #eee",
                                }}
                              />
                              <Stack sx={{ flexGrow: 1 }}>
                                <Typography>{it.menuItemName}</Typography>
                                <Typography color="text.secondary">
                                  {it.unitPrice.toLocaleString()} đ
                                </Typography>
                              </Stack>
                              <Chip label={`x${it.quantity}`} />
                              <Typography fontWeight={700}>
                                {(it.quantity * it.unitPrice).toLocaleString()}{" "}
                                đ
                              </Typography>
                            </Stack>
                          );
                        })
                      )}
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Set
                      </Typography>
                      {sets.length === 0 ? (
                        <Typography color="text.secondary">
                          Không có set
                        </Typography>
                      ) : (
                        sets.map((it) => {
                          const mi = menuItems.find(
                            (m) => m.id === it.menuItemId
                          );
                          return (
                            <Stack
                              key={it.id}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <img
                                src={mi?.imageUrl || "/assets/logo.png"}
                                alt={mi?.name || it.menuItemName}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 6,
                                  objectFit: "contain",
                                  border: "1px solid #eee",
                                }}
                              />
                              <Stack sx={{ flexGrow: 1 }}>
                                <Typography>{it.menuItemName}</Typography>
                                <Typography color="text.secondary">
                                  {it.unitPrice.toLocaleString()} đ
                                </Typography>
                              </Stack>
                              <Chip label={`x${it.quantity}`} />
                              <Typography fontWeight={700}>
                                {(it.quantity * it.unitPrice).toLocaleString()}{" "}
                                đ
                              </Typography>
                            </Stack>
                          );
                        })
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
      <OrderFormModal
        open={openOrder}
        onClose={() => setOpenOrder(false)}
        hotelId={hotelId}
        onSubmitted={() => fetchOrders(page)}
        initialValues={selectedOrder}
        isWalkIn={value === 0}
      />
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (selectedOrder) {
            cancelOrder(selectedOrder);
          }
          setConfirmOpen(false);
        }}
        title="Xác nhận hủy order"
        message={`Bạn có chắc chắn muốn hủy order được chọn không?`}
        confirmIcon={<Check />}
        cancelIcon={<Close />}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      <Dialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        fullWidth
        maxWidth="md"
      >
        {/* ========================= HEADER ========================= */}
        <Box ref={invoiceRef}>
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontWeight: "bold",
              fontSize: "1.35rem",
              py: 1.5,
            }}
          >
            <ReceiptLongIcon color="primary" sx={{ fontSize: 32 }} />
            {selectedForInvoice && orderInvoiceMap[selectedForInvoice.id]
              ? "Hóa đơn Khách vãng lai"
              : "Xuất hóa đơn Khách vãng lai"}
          </DialogTitle>

          <DialogContent>
            <Box>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {/* ============================================================
          SECTION 1 — CUSTOMER INFO + PROMOTION
      ============================================================ */}
                <Card
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 2,
                    borderLeft: "5px solid #1976d2",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <PersonIcon color="primary" />
                      Thông tin khách hàng
                    </Typography>

                    {/* Order ID */}
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Mã đơn
                      </Typography>
                      <Typography fontWeight={700} color="primary">
                        {selectedForInvoice?.id
                          ? String(selectedForInvoice.id)
                              .slice(0, 8)
                              .toUpperCase()
                          : ""}
                      </Typography>
                    </Box>

                    {/* Customer name */}
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Khách hàng
                      </Typography>
                      <Typography fontWeight={600}>
                        {selectedForInvoice?.customerName || "—"}
                      </Typography>
                    </Box>

                    {/* Phone */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Số điện thoại
                      </Typography>
                      <Typography
                        fontWeight={600}
                        sx={{ display: "flex", gap: 1 }}
                      >
                        <PhoneIphoneIcon fontSize="small" color="action" />
                        {selectedForInvoice?.customerPhone || "—"}
                      </Typography>
                    </Box>

                    {/* Promotion Button */}
                    <Divider sx={{ my: 1 }} />

                    {!(
                      selectedForInvoice &&
                      orderInvoiceMap[selectedForInvoice.id]
                    ) && (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <LocalOfferIcon color="success" />
                          Khuyến mãi
                        </Typography>
                        <Stack spacing={2}>
                          <Button
                            startIcon={<SearchIcon />}
                            variant="contained"
                            color="success"
                            sx={{ width: 220 }}
                            size="small"
                            onClick={() => setPromoOpen(true)}
                          >
                            Chọn mã khuyến mãi
                          </Button>
                          {discountCode && (
                            <Chip
                              label={`Áp dụng: ${discountCode} - giảm giá ${discountPercent}%`}
                              color="default"
                              icon={<LocalOfferIcon />}
                              sx={{ mt: 1, px: 2, fontWeight: 600 }}
                            />
                          )}
                        </Stack>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* ============================================================
          SECTION 2 — ORDER ITEMS + TOTAL SUMMARY
      ============================================================ */}
                {orderDetails && (
                  <Card
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                      borderLeft: "5px solid #009688",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Title */}
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <ShoppingBagIcon color="primary" />
                        Chi tiết đơn hàng
                      </Typography>

                      {/* Table */}
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: "#f1f4ff" }}>
                            <TableCell>
                              <b>Tên món</b>
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
                          {(orderDetails.items || []).map((it) => (
                            <TableRow key={it.id}>
                              <TableCell>{it.menuItemName}</TableCell>
                              <TableCell align="right">{it.quantity}</TableCell>
                              <TableCell align="right">
                                {it.unitPrice.toLocaleString()} đ
                              </TableCell>
                              <TableCell align="right">
                                {(it.quantity * it.unitPrice).toLocaleString()}{" "}
                                đ
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* ================= SUMMARY CARD ================= */}
                      {(() => {
                        const subtotal = (orderDetails.items || []).reduce(
                          (acc, it) => acc + it.quantity * it.unitPrice,
                          0
                        );
                        const discountAmt = Math.round(
                          (subtotal * (discountPercent || 0)) / 100
                        );
                        const afterDiscount = subtotal - discountAmt;

                        return (
                          <Card
                            sx={{
                              mt: 2,
                              p: 2,
                              borderRadius: 2,
                              background: "#f1faf6",
                              border: "1px solid #b7e2cd",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <CalculateIcon color="success" />
                              Tổng kết hóa đơn
                            </Typography>

                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography>Tạm tính</Typography>
                                <Typography fontWeight={700}>
                                  {subtotal.toLocaleString()} đ
                                </Typography>
                              </Stack>

                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography>
                                  Giảm giá
                                  {discountPercent
                                    ? ` (${discountPercent}%)`
                                    : ""}
                                </Typography>
                                <Typography fontWeight={700} color="error">
                                  -{discountAmt.toLocaleString()} đ
                                </Typography>
                              </Stack>

                              <Divider />

                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography variant="h6">Tổng cộng</Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight={800}
                                  color="primary"
                                >
                                  {afterDiscount.toLocaleString()} đ
                                </Typography>
                              </Stack>
                            </Stack>
                          </Card>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Box>
          </DialogContent>
        </Box>

        {/* ========================= FOOTER ========================= */}
        {!disableForPrint && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setInvoiceOpen(false)}>Đóng</Button>
            {selectedForInvoice && orderInvoiceMap[selectedForInvoice.id] ? (
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                onClick={() => handlePrint?.()}
                sx={{ px: 3, py: 1 }}
              >
                In hóa đơn
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                onClick={onCreateInvoice}
                sx={{ px: 3, py: 1 }}
              >
                Xuất hóa đơn
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>

      <PromotionDialog
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        allowedScope={"food"}
        onApply={(code) => {
          setDiscountCode(code.code);
          setDiscountPercent(code.value);
          setPromoOpen(false);
        }}
      />
    </Box>
  );
};

export default OrdersManagementPage;
