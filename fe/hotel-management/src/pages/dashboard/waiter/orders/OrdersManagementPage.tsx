import { Add, Check, Close, Edit, LocalOffer } from "@mui/icons-material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import PromotionDialog from "../../frontdesk/invoices/components/PromotionDialog";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import invoicesApi from "../../../../api/invoicesApi";
import menusApi, { type MenuItemDto } from "../../../../api/menusApi";
import ordersApi, {
  type OrderDetailsDto,
  type OrderStatus,
  type OrderSummaryDto,
} from "../../../../api/ordersApi";
import ConfirmModal from "../../../../components/common/ConfirmModel";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import OrderFormModal from "./components/OrderFormModal";
import OrdersTable from "./components/OrdersTable";
import WalkInInvoiceDialog from "./components/WalkInInvoiceDialog";

import PersonIcon from "@mui/icons-material/Person";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CustomSelect from "../../../../components/common/CustomSelect";
import EmptyState from "../../../../components/common/EmptyState";

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

  // Feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(
    "0"
  );

  const statusOptions = [
    { value: "0", label: "Tất cả" },
    { value: "1", label: "Đang chờ" },
    { value: "2", label: "Đã thanh toán" },
    { value: "3", label: "Đã hủy" },
  ];
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedForInvoice, setSelectedForInvoice] =
    useState<OrderSummaryDto | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsDto | null>(
    null
  );
  const [orderInvoiceMap, setOrderInvoiceMap] = useState<
    Record<string, { id: string; invoiceNumber?: string }>
  >({});
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<
    Record<string, OrderDetailsDto["items"]>
  >({});

  // Promotion dialog state
  const [promoOpen, setPromoOpen] = useState(false);
  const [selectedForPromo, setSelectedForPromo] =
    useState<OrderSummaryDto | null>(null);

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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ my: 1 }}
        spacing={1}
        justifyContent={"space-between"}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Box sx={{ width: { xs: "100%", lg: 200 } }}>
            <CustomSelect
              name="orderType"
              value={String(value)}
              onChange={(e) => setValue(Number(e.target.value))}
              label="Loại yêu cầu"
              options={[
                { value: "0", label: "Khách vãng lai" },
                { value: "1", label: "Khách đặt phòng" },
              ]}
              placeholder="Chọn loại"
              size="small"
            />
          </Box>
          <Box sx={{ width: { xs: "100%", lg: 200 } }}>
            <CustomSelect
              name="orderStatus"
              value={(selectedStatus as any) ?? "all"}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedStatus(v === "all" ? undefined : (v as OrderStatus));
              }}
              label="Lọc trạng thái"
              options={statusOptions}
              placeholder="Chọn trạng thái"
              size="small"
            />
          </Box>
        </Stack>
        <Button
          startIcon={<Add />}
          variant="contained"
          color="primary"
          onClick={() => {
            setOpenOrder(true);
          }}
        >
          Thêm yêu cầu
        </Button>
      </Stack>

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
          }}
          invoiceMap={orderInvoiceMap}
          onPrintInvoice={(row) => {
            setSelectedForInvoice(row);
            setInvoiceOpen(true);
          }}
        />
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {(() => {
            const listData = value === 1 ? bookingOrders : walkInOrders;
            if (!loading && listData.length === 0) {
              return (
                <EmptyState
                  title="Không có yêu cầu"
                  description="Chưa có yêu cầu đặt món. Hãy thêm yêu cầu mới."
                  actions={
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button
                        startIcon={<Add />}
                        variant="contained"
                        onClick={() => {
                          setOpenOrder(true);
                        }}
                      >
                        Thêm yêu cầu
                      </Button>
                    </Stack>
                  }
                />
              );
            }
            return listData.map((o, number) => {
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
                            {/* Yêu cầu: #{String(o.id).slice(0, 8).toUpperCase()} */}
                            Yêu cầu: #{String(number + 1).toUpperCase()}
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
                        direction={{ xs: "column", lg: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ width: "100%" }}
                      >
                        <Stack
                          direction={{ xs: "column", lg: "row" }}
                          spacing={2}
                        >
                          <Stack
                            direction={{ xs: "row" }}
                            spacing={1}
                            alignItems="center"
                          >
                            <PersonIcon color="action" />
                            <Typography>{o.customerName || "—"}</Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <PhoneIphoneIcon color="action" />
                            <Typography>{o.customerPhone || "—"}</Typography>
                          </Stack>
                        </Stack>
                        <Stack
                          direction={{ xs: "column", lg: "row" }}
                          spacing={1}
                        >
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
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<LocalOffer />}
                            disabled={o.status === "2" || o.status === "3"}
                            onClick={() => {
                              setSelectedForPromo(o);
                              setPromoOpen(true);
                            }}
                          >
                            Áp dụng khuyến mãi
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
                                  {(
                                    it.quantity * it.unitPrice
                                  ).toLocaleString()}{" "}
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
                                  {(
                                    it.quantity * it.unitPrice
                                  ).toLocaleString()}{" "}
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
            });
          })()}
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
      <PromotionDialog
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        allowedScope="food"
        onApply={async (c) => {
          if (!selectedForPromo) return;
          try {
            const res = await ordersApi.applyDiscount(selectedForPromo.id, {
              code: c.code,
            });
            if (res.isSuccess) {
              setSnackbar({
                open: true,
                severity: "success",
                message: "Áp dụng khuyến mãi thành công",
              });
              fetchOrders(page);
            } else {
              setSnackbar({
                open: true,
                severity: "error",
                message: res.message || "Không thể áp dụng khuyến mãi",
              });
            }
          } catch {
            setSnackbar({
              open: true,
              severity: "error",
              message: "Đã xảy ra lỗi khi áp dụng khuyến mãi",
            });
          } finally {
            setPromoOpen(false);
          }
        }}
      />
      <WalkInInvoiceDialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        order={selectedForInvoice}
        onInvoiceCreated={(inv) => {
          if (selectedForInvoice)
            setOrderInvoiceMap((m) => ({
              ...m,
              [selectedForInvoice.id]: {
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
              },
            }));
          fetchOrders(page);
        }}
      />
    </Box>
  );
};

export default OrdersManagementPage;
