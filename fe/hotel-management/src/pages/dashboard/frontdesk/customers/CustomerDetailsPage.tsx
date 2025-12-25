import { ArrowBack, Email, Person, Phone, Info } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../../components/common/PageTitle";
import guestsApi, { type GuestDto } from "../../../../api/guestsApi";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingSummaryDto,
} from "../../../../api/bookingsApi";
import ordersApi, {
  type OrderSummaryDto,
  type ListResponse,
} from "../../../../api/ordersApi";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import { useStore, type StoreState } from "../../../../hooks/useStore";

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useStore<StoreState>((s) => s);
  const hotelId = user?.hotelId || "";
  const navigate = useNavigate();
  const location = useLocation();
  const base = location.pathname.startsWith("/manager")
    ? "/manager"
    : "/frontdesk";

  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState<GuestDetailsDto | null>(null);
  const [roomStays, setRoomStays] = useState<GuestRoomStayDto[]>([]);
  const [orders, setOrders] = useState<GuestOrderDto[]>([]);
  const [bookingPage, setBookingPage] = useState(1);
  const bookingPageSize = 5;
  const pagedRoomStays = useMemo(() => {
    const start = (bookingPage - 1) * bookingPageSize;
    return roomStays.slice(start, start + bookingPageSize);
  }, [roomStays, bookingPage]);
  const [orderPage, setOrderPage] = useState(1);
  const orderPageSize = 5;
  const pagedOrders = useMemo(() => {
    const start = (orderPage - 1) * orderPageSize;
    return orders.slice(start, start + orderPageSize);
  }, [orders, orderPage]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const gi = await guestsApi.getById(id);
        const g = gi.data;
        setGuest(g);

        const allBookings = await bookingsApi.getAll({ hotelId });
        const filteredBookings =
          allBookings.filter(
            (b) =>
              (b.phoneNumber && g.phone && b.phoneNumber === g.phone) ||
              (b.primaryGuestName &&
                g.fullName &&
                b.primaryGuestName.toLowerCase() === g.fullName.toLowerCase())
          ) || [];
        setBookings(filteredBookings);

        const or: ListResponse<OrderSummaryDto> = await ordersApi.listOrders({
          hotelId,
          search: g.phone || g.fullName,
          page: 1,
          pageSize: 50,
        });
        setOrders(or.data || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, hotelId]);

  const bookingColumns = useMemo<Column<BookingDetailsDto>[]>(() => {
    return [
      { id: "id", label: "Mã", minWidth: 120 },
      {
        id: "primaryGuestName",
        label: "Khách",
        minWidth: 160,
      },
      {
        id: "phoneNumber",
        label: "SĐT",
        minWidth: 120,
      },

      {
        id: "startDate",
        label: "Bắt đầu",
        minWidth: 160,
        format: (v) => (v ? new Date(v).toLocaleString("vi-VN") : "—"),
      },
      {
        id: "createdAt",
        label: "Tạo lúc",
        minWidth: 160,
        format: (v) => (v ? new Date(v).toLocaleString("vi-VN") : "—"),
      },
      {
        id: "status",
        label: "Trạng thái",
        minWidth: 140,
        format: (v) => {
          const map: Record<number, string> = {
            0: "Chờ xác nhận",
            1: "Đã xác nhận",
            2: "Đã nhận phòng",
            3: "Đã trả phòng",
            4: "Đã hủy",
          };
          return map[v as number] ?? String(v ?? "—");
        },
      },
      {
        id: "actions",
        label: "Hành động",
        align: "center",
        minWidth: 120,
        render: (row) => (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Info fontSize="small" />}
            onClick={() => navigate(`${base}/bookings/${row.bookingId}`)}
          >
            Xem chi tiết
          </Button>
        ),
      },
    ];
  }, [id]);

  const orderColumns = useMemo<Column<OrderSummaryDto>[]>(() => {
    return [
      { id: "orderId", label: "Mã đơn", minWidth: 120 },
      { id: "bookingId", minWidth: 120 },

      {
        id: "orderId",
        label: "Tổng tiền ",
        minWidth: 120,
        format: (v) =>
          typeof v === "number"
            ? new Intl.NumberFormat("vi-VN").format(v)
            : "—",
      },
      {
        id: "createdAt",
        label: "Thời gian phục vụ",
        minWidth: 160,
        format: (v) => (v ? new Date(v).toLocaleString("vi-VN") : "—"),
      },
      {
        id: "status",
        label: "Trạng thái",
        minWidth: 140,
        format: (v) => {
          const map: Record<number, string> = {
            0: "Nháp",
            1: "Cần xác nhận",
            2: "Đã xác nhận",
            3: "Đang xử lý",
            4: "Sẵn sàng",
            5: "Hoàn tất",
            6: "Đã hủy",
          };
          return map[v as number] ?? String(v ?? "—");
        },
      },
      {
        id: "actions",
        label: "Hành động",
        align: "center",
        minWidth: 120,
        render: (row) => (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Info fontSize="small" />}
            onClick={() => navigate(`${base}/orders/${row.orderId}`)}
          >
            Xem chi tiết
          </Button>
        ),
      },
    ];
  }, [id]);

  const header = (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Person color="primary" />
        <Typography variant="subtitle1" fontWeight={700}>
          {guest?.fullName || "Khách hàng"}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Phone fontSize="small" color="action" />
          <Typography variant="body2">{guest?.phone || "—"}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Email fontSize="small" color="action" />
          <Typography variant="body2">{guest?.email || "—"}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <PageTitle
        title="Chi tiết khách hàng"
        subtitle="Thông tin cơ bản, lịch sử đặt phòng và đặt món"
      />
      <Stack direction="row" spacing={1} alignItems="center">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Quay lại danh sách
        </Button>
      </Stack>
      <Card variant="outlined">
        <CardHeader title={header} />
        <CardContent>
          <Stack spacing={2}>
            <Stack sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Lịch sử đặt phòng
              </Typography>
              <DataTable<BookingDetailsDto>
                columns={bookingColumns}
                data={pagedRoomStays}
                title=""
                loading={loading}
                getRowId={(row) => row.id}
                actionColumn={false}
                pagination={{
                  page: bookingPage,
                  pageSize: bookingPageSize,
                  total: roomStays.length,
                  onPageChange: (p) => setBookingPage(p),
                }}
              />
            </Stack>
            <Stack sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Lịch sử đặt món
              </Typography>
              <DataTable<OrderSummaryDto>
                columns={orderColumns}
                data={pagedOrders}
                title=""
                loading={loading}
                getRowId={(row) => row.id}
                actionColumn={false}
                pagination={{
                  page: orderPage,
                  pageSize: orderPageSize,
                  total: orders.length,
                  onPageChange: (p) => setOrderPage(p),
                }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CustomerDetailsPage;
