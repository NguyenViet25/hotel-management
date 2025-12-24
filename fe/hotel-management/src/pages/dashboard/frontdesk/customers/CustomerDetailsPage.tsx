import { ArrowBack, Email, Person, Phone } from "@mui/icons-material";
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
import { useNavigate, useParams } from "react-router-dom";
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

  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState<GuestDto | null>(null);
  const [bookings, setBookings] = useState<BookingDetailsDto[]>([]);
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);

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
        id: "totalAmount",
        label: "Tổng tiền",
        minWidth: 120,
        format: (v) =>
          typeof v === "number"
            ? new Intl.NumberFormat("vi-VN").format(v)
            : "—",
      },
      {
        id: "createdAt",
        label: "Tạo lúc",
        minWidth: 160,
        format: (v) => (v ? new Date(v).toLocaleString() : "—"),
      },
    ];
  }, []);

  const orderColumns = useMemo<Column<OrderSummaryDto>[]>(() => {
    return [
      { id: "id", label: "Mã", minWidth: 120 },
      { id: "customerName", label: "Khách", minWidth: 160 },
      { id: "customerPhone", label: "SĐT", minWidth: 120 },

      {
        id: "itemsTotal",
        label: "Tổng món",
        minWidth: 120,
        format: (v) =>
          typeof v === "number"
            ? new Intl.NumberFormat("vi-VN").format(v)
            : "—",
      },
      {
        id: "createdAt",
        label: "Tạo lúc",
        minWidth: 160,
        format: (v) => (v ? new Date(v).toLocaleString() : "—"),
      },
    ];
  }, []);

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
                data={bookings}
                title=""
                loading={loading}
                getRowId={(row) => row.id}
                actionColumn={false}
              />
            </Stack>
            <Stack sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Lịch sử đặt món
              </Typography>
              <DataTable<OrderSummaryDto>
                columns={orderColumns}
                data={orders}
                title=""
                loading={loading}
                getRowId={(row) => row.id}
                actionColumn={false}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CustomerDetailsPage;
