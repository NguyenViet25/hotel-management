import {
  Add,
  Check,
  Close,
  Edit,
  Event,
  Info,
  People,
  Phone,
  Restaurant,
} from "@mui/icons-material";
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import menusApi, { type MenuItemDto } from "../../../../api/menusApi";
import ordersApi, {
  EOrderStatus,
  type OrderDetailsDto,
  type OrderSummaryDto,
} from "../../../../api/ordersApi";
import ConfirmModal from "../../../../components/common/ConfirmModel";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import OrderFormModal from "./components/OrderFormModal";
import WalkInInvoiceDialog from "./components/WalkInInvoiceDialog";

import PersonIcon from "@mui/icons-material/Person";
import { toast } from "react-toastify";
import CustomSelect from "../../../../components/common/CustomSelect";
import EmptyState from "../../../../components/common/EmptyState";

const getOrderPhase = (status: number): string => {
  if (status === EOrderStatus.Draft) return "Mới";
  if (status === EOrderStatus.NeedConfirmed) return "Chờ xác nhận";
  if (status === EOrderStatus.Confirmed) return "Đã xác nhận";
  if (status === EOrderStatus.InProgress) return "Đang nấu";
  if (status === EOrderStatus.Ready) return "Sẵn sàng";
  if (status === EOrderStatus.Completed) return "Đã phục vụ";
  if (status === EOrderStatus.Cancelled) return "Đã hủy";
  return "Mới";
};

const OrdersManagementPage: React.FC = () => {
  // Filters
  const { hotelId, user } = useStore<StoreState>((state) => state);
  const [searchParams, setSearchParams] = useSearchParams();

  // Table data
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false);

  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const created = dayjs(o.createdAt);
      return (
        created.isAfter(startDate.startOf("day").subtract(1, "millisecond")) &&
        created.isBefore(endDate.endOf("day").add(1, "millisecond"))
      );
    });
  }, [orders, startDate, endDate]);

  const walkInOrders = filteredOrders.filter((o) => o.isWalkIn);
  const bookingOrders = filteredOrders.filter((o) => o.isWalkIn === false);

  // Modals
  const [openOrder, setOpenOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsDto | null>(
    null
  );
  const [value, setValue] = React.useState(0);

  // Feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [selectedStatus, setSelectedStatus] = useState<number | " ">(
    EOrderStatus.NeedConfirmed
  );

  const statusOptions = [
    { value: " ", label: "Tất cả" },
    { value: EOrderStatus.NeedConfirmed, label: "Chờ xác nhận" },
    { value: EOrderStatus.Confirmed, label: "Đã xác nhận" },
    { value: EOrderStatus.InProgress, label: "Đang nấu" },
    { value: EOrderStatus.Ready, label: "Sẵn sàng" },
    { value: EOrderStatus.Completed, label: "Đã phục vụ" },
    { value: EOrderStatus.Cancelled, label: "Đã hủy" },
  ];
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedForInvoice, setSelectedForInvoice] =
    useState<OrderSummaryDto | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<
    Record<string, OrderDetailsDto["items"]>
  >({});

  // Fetch orders based on filters and pagination
  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await ordersApi.listOrders({
        hotelId: hotelId || undefined,
        status: selectedStatus === " " ? undefined : selectedStatus,
        search: undefined,
        page: pageNum,
        pageSize: 200,
      });
      if (res.isSuccess) {
        setOrders(res.data);
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
  }, [selectedStatus, hotelId]);

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
    loadMenu();
  }, []);

  useEffect(() => {
    const loadDetailsForPage = async () => {
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
  }, [orders]);

  const openEditModal = async (summary: OrderDetailsDto) => {
    setSelectedOrder(summary);
    setOpenOrder(true);
  };

  const cancelOrder = async (summary: OrderSummaryDto) => {
    try {
      await ordersApi.updateStatus(summary.id, {
        status: EOrderStatus.Cancelled as any,
        notes: `Hủy yêu cầu đặt món bởi ${user?.fullname || "hệ thống."}`,
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

  const confirmOrder = async (summary: OrderSummaryDto) => {
    try {
      await ordersApi.updateStatus(summary.id, {
        status: EOrderStatus.Confirmed as any,
      });

      fetchOrders(page);
      toast.success("Đã xác nhận order");
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Không thể xác nhận order",
      });
    }
  };

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
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
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
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
              <DatePicker
                label="Từ ngày"
                value={startDate}
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
                onChange={(v) => setStartDate(v ?? dayjs())}
              />
              <DatePicker
                label="Đến ngày"
                value={endDate}
                minDate={startDate}
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
                onChange={(v) => setEndDate(v ?? dayjs())}
              />
            </Stack>
          </LocalizationProvider>
          <Box sx={{ width: { xs: "100%", lg: 200 }, minWidth: 200 }}>
            <CustomSelect
              name="orderStatus"
              value={(selectedStatus as any) ?? "all"}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedStatus(v === " " ? v : (v as number));
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
            setSelectedOrder(null);
          }}
        >
          Thêm yêu cầu
        </Button>
      </Stack>

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

            const discount = (o.itemsTotal * (o.promotionValue || 0)) / 100;
            const total = o.itemsTotal - discount;
            const servingDateText = (() => {
              if (o.servingDate) return dayjs(o.servingDate).format("D/M/YYYY");
              const lines = (o.notes || "").split(/\n/);
              const target = lines.find((ln) =>
                ln.trim().toLowerCase().startsWith("ngày yêu cầu")
              );
              if (!target) return null;
              const idx = target.indexOf(":");
              const raw = idx >= 0 ? target.slice(idx + 1) : target;
              const txt = raw.trim();
              return txt.length ? txt : null;
            })();
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
                        <Restaurant color="primary" />
                        <Typography fontWeight={700}>
                          {/* Yêu cầu: #{String(o.id).slice(0, 8).toUpperCase()} */}
                          Yêu cầu đặt món: #{String(number + 1).toUpperCase()}
                        </Typography>
                        <Chip
                          label={o.isWalkIn ? "Vãng lai" : "Đặt phòng"}
                          size="small"
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography color="text.secondary">
                          {new Date(o.createdAt).toLocaleString()}
                        </Typography>

                        <Chip
                          color={
                            o.status === EOrderStatus.NeedConfirmed
                              ? "default"
                              : o.status === EOrderStatus.Confirmed
                              ? "success"
                              : o.status === EOrderStatus.InProgress
                              ? "primary"
                              : o.status === EOrderStatus.InProgress
                              ? "primary"
                              : o.status === EOrderStatus.Completed
                              ? "success"
                              : o.status === EOrderStatus.Cancelled
                              ? "error"
                              : "default"
                          }
                          label={getOrderPhase(o.status)}
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
                          <Typography>
                            Họ và tên: {o.customerName || "—"}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Phone color="action" />
                          <Typography>SĐT: {o.customerPhone || "—"}</Typography>
                        </Stack>
                        <Stack
                          direction={{ xs: "row" }}
                          spacing={1}
                          alignItems="center"
                        >
                          <People color="action" />
                          <Typography>
                            Số lượng khách: {o.guests || 1}
                          </Typography>
                        </Stack>
                        {servingDateText && (
                          <Stack
                            direction={{ xs: "row" }}
                            spacing={1}
                            alignItems="center"
                          >
                            <Event color="action" />
                            <Typography>
                              Ngày phục vụ: {servingDateText}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      <Stack
                        direction={{ xs: "column", lg: "row" }}
                        spacing={1}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => openEditModal(o as any)}
                        >
                          Sửa
                        </Button>

                        {Number(o.status) !== EOrderStatus.Cancelled && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ReceiptLongIcon />}
                            onClick={() => {
                              setSelectedForInvoice(o);
                              setInvoiceOpen(true);
                            }}
                          >
                            Xuất hóa đơn
                          </Button>
                        )}
                        {Number(o.status) === EOrderStatus.NeedConfirmed && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Check />}
                            onClick={() => {
                              setSelectedOrder(o as any);
                              setConfirmOrderOpen(true);
                            }}
                          >
                            Xác nhận đơn
                          </Button>
                        )}
                        {[
                          EOrderStatus.Draft,
                          EOrderStatus.NeedConfirmed,
                        ].includes(Number(o.status)) && (
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Close />}
                            onClick={() => {
                              setSelectedOrder(o as any);
                              setConfirmOpen(true);
                            }}
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                    <Stack
                      direction={{ xs: "row" }}
                      spacing={1}
                      alignItems="center"
                      sx={{
                        border: "1px dashed",
                        borderRadius: 3,
                        p: 1,
                        backgroundColor: "yellow",
                      }}
                    >
                      <Info color="action" />
                      <Typography>Ghi chú: {o.notes || "—"}</Typography>
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
                    {sets.length === 0
                      ? null
                      : sets.map((it) => {
                          const mi = menuItems.find(
                            (m) => m.id === it.menuItemId
                          );
                          return (
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" fontWeight={700}>
                                Set
                              </Typography>
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
                              <Divider />
                            </Stack>
                          );
                        })}

                    <Stack alignItems="flex-end">
                      <Stack
                        direction={{ xs: "column", lg: "row" }}
                        spacing={2}
                        alignItems={{ xs: "flex-end", sm: "flex-end" }}
                      >
                        <Stack alignItems="flex-end">
                          <Typography color="text.secondary">
                            Tổng cộng
                          </Typography>
                          <Typography fontWeight={700}>
                            {(o.itemsTotal || 0).toLocaleString()} đ
                          </Typography>
                        </Stack>

                        <Stack alignItems="flex-end">
                          <Typography color="red">Giảm giá</Typography>
                          <Typography color="red" fontWeight={"bold"}>
                            - {(discount || 0).toLocaleString()} đ
                          </Typography>
                        </Stack>
                        <Stack alignItems="flex-end">
                          <Typography color="text.secondary">
                            Còn lại
                          </Typography>
                          <Typography fontWeight={"bold"}>
                            {" "}
                            {(total || 0).toLocaleString()} đ
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          });
        })()}
      </Stack>
      <OrderFormModal
        open={openOrder}
        onClose={() => {
          setOpenOrder(false);
          setSelectedOrder(null);
        }}
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
      <ConfirmModal
        open={confirmOrderOpen}
        onClose={() => setConfirmOrderOpen(false)}
        onConfirm={() => {
          if (selectedOrder) {
            confirmOrder(selectedOrder);
          }
          setConfirmOrderOpen(false);
        }}
        title="Xác nhận đơn"
        message={`Bạn có muốn xác nhận đơn đã chọn?`}
        confirmIcon={<Check />}
        cancelIcon={<Close />}
        confirmColor="primary"
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <WalkInInvoiceDialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        order={selectedForInvoice}
        onInvoiceCreated={() => {
          fetchOrders(page);
        }}
      />
    </Box>
  );
};

export default OrdersManagementPage;
