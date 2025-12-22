import { Check, Close, Restaurant, ArrowBack } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Snackbar,
  Stack,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ordersApi, {
  EOrderStatus,
  type OrderDetailsDto,
} from "../../../../api/ordersApi";
import PageTitle from "../../../../components/common/PageTitle";
import menusApi, { type MenuItemDto } from "../../../../api/menusApi";

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

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<OrderDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const menuMap = React.useMemo(
    () =>
      Object.fromEntries((menuItems || []).map((m) => [m.id, m])) as Record<
        string,
        MenuItemDto
      >,
    [menuItems]
  );

  const fetch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await ordersApi.getById(id);
      if (res.isSuccess) setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [id]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await menusApi.getMenuItems({
          isActive: true,
          page: 1,
          pageSize: 200,
        });
        if (res.isSuccess) setMenuItems(res.data || []);
      } catch {}
    };
    run();
  }, []);

  const confirmOrder = async () => {
    if (!id) return;
    try {
      const res = await ordersApi.updateStatus(id, {
        status: EOrderStatus.Confirmed as any,
      });
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã xác nhận order",
          severity: "success",
        });
        fetch();
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Xác nhận thất bại",
        severity: "error",
      });
    }
  };

  const cancelOrder = async () => {
    if (!id) return;
    try {
      const res = await ordersApi.updateStatus(id, {
        status: EOrderStatus.Cancelled as any,
      });
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Đã hủy order",
          severity: "success",
        });
        fetch();
      }
    } catch {
      setSnackbar({ open: true, message: "Hủy thất bại", severity: "error" });
    }
  };

  return (
    <Box>
      <PageTitle
        title="Chi tiết Order"
        subtitle="Xem và quyết định trạng thái order"
      />
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/frontdesk/orders")}
            >
              Quay lại danh sách
            </Button>
          </Stack>
          {data && (
            <Stack direction="row" spacing={1} alignItems="center">
              {Number(data.status) === EOrderStatus.NeedConfirmed && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Check />}
                  onClick={confirmOrder}
                >
                  Xác nhận
                </Button>
              )}
              {[EOrderStatus.Draft, EOrderStatus.NeedConfirmed].includes(
                Number(data.status)
              ) && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Close />}
                  onClick={cancelOrder}
                >
                  Hủy
                </Button>
              )}
            </Stack>
          )}
        </Stack>
        {data ? (
          <>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, overflow: "hidden" }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Restaurant color="primary" />
                    <Typography fontWeight={800}>
                      Yêu cầu đặt món
                    </Typography>{" "}
                    <Chip
                      size="small"
                      label={
                        data.isWalkIn ? "Khách vãng lai" : "Khách đặt phòng"
                      }
                      color={data.isWalkIn ? "default" : "primary"}
                    />
                  </Stack>
                  <Chip
                    color={
                      data.status === EOrderStatus.NeedConfirmed
                        ? "default"
                        : data.status === EOrderStatus.Confirmed
                        ? "primary"
                        : data.status === EOrderStatus.InProgress
                        ? "primary"
                        : data.status === EOrderStatus.Ready
                        ? "primary"
                        : data.status === EOrderStatus.Completed
                        ? "success"
                        : data.status === EOrderStatus.Cancelled
                        ? "error"
                        : "default"
                    }
                    label={getOrderPhase(Number(data.status))}
                    sx={{ minWidth: 140 }}
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems="center"
                  sx={{ px: 1, mb: 2 }}
                >
                  <Typography variant="body2">
                    Họ tên: {data.customerName || "—"}
                  </Typography>
                  <Typography variant="body2">
                    SĐT: {data.customerPhone || "—"}
                  </Typography>
                  {data.guests !== undefined && (
                    <Typography variant="body2">
                      Số khách: {data.guests}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    Ghi chú: {data.notes || "—"}
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Món ăn
                  </Typography>
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Ảnh</TableCell>
                          <TableCell>Tên món</TableCell>
                          <TableCell align="right">SL</TableCell>
                          <TableCell align="right">Đơn giá</TableCell>
                          <TableCell align="right">Thành tiền</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.items.map((it) => {
                          const mi = menuMap[it.menuItemId];
                          const img = mi?.imageUrl;
                          const total = it.quantity * it.unitPrice;
                          return (
                            <TableRow key={it.id} hover>
                              <TableCell>
                                {img ? (
                                  <CardMedia
                                    component="img"
                                    image={img}
                                    alt={it.menuItemName}
                                    sx={{
                                      width: 64,
                                      height: 48,
                                      objectFit: "cover",
                                      borderRadius: 1,
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 64,
                                      height: 48,
                                      borderRadius: 1,
                                      bgcolor: "action.hover",
                                    }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography fontWeight={600}>
                                  {it.menuItemName}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Chip label={`x${it.quantity}`} size="small" />
                              </TableCell>
                              <TableCell align="right">
                                {(it.unitPrice || 0).toLocaleString()} đ
                              </TableCell>
                              <TableCell align="right">
                                {total.toLocaleString()} đ
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                    <Stack spacing={0.5} sx={{ minWidth: 260 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary">Tạm tính</Typography>
                        <Typography>
                          {(data.itemsTotal || 0).toLocaleString()} đ
                        </Typography>
                      </Stack>
                      {data.promotionValue ? (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary">
                            Giảm giá
                          </Typography>
                          <Typography>
                            {(
                              ((data.itemsTotal || 0) *
                                (data.promotionValue || 0)) /
                              100
                            ).toLocaleString()}{" "}
                            đ
                          </Typography>
                        </Stack>
                      ) : null}
                      <Divider sx={{ my: 0.5 }} />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={700}>Tổng cộng</Typography>
                        <Typography fontWeight={700}>
                          {(
                            (data.itemsTotal || 0) -
                            ((data.itemsTotal || 0) *
                              (data.promotionValue || 0)) /
                              100
                          ).toLocaleString()}{" "}
                          đ
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </>
        ) : (
          <Typography color="text.secondary">
            {loading ? "Đang tải..." : "Không tìm thấy order"}
          </Typography>
        )}
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderDetailsPage;
