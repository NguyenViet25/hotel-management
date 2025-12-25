import { ArrowBack, Email, Person, Phone } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../../components/common/PageTitle";
import guestsApi, {
  type GuestDetailsDto,
  type GuestOrderDto,
  type GuestRoomStayDto,
} from "../../../../api/guestsApi";
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
  const [guest, setGuest] = useState<GuestDetailsDto | null>(null);
  const [roomStays, setRoomStays] = useState<GuestRoomStayDto[]>([]);
  const [orders, setOrders] = useState<GuestOrderDto[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const resp = await guestsApi.getById(id);
        const g = resp.data;
        setGuest(g || null);
        setRoomStays(g?.rooms || []);
        setOrders(g?.orders || []);
      } catch {
        void 0;
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, hotelId]);

  const formatMoney = (v?: number) =>
    typeof v === "number" ? new Intl.NumberFormat("vi-VN").format(v) : "—";

  const bookingColumns = useMemo<Column<GuestRoomStayDto>[]>(() => {
    return [
      { id: "bookingId", label: "Mã booking", minWidth: 120 },
      {
        id: "roomNumber",
        label: "Phòng",
        minWidth: 120,
      },
      {
        id: "startDate",
        label: "Bắt đầu",
        minWidth: 160,
        format: (v) => (v ? new Date(v).toLocaleString() : "—"),
      },
      {
        id: "endDate",
        label: "Kết thúc",
        minWidth: 160,
        format: (v) => (v ? new Date(v).toLocaleString() : "—"),
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
    ];
  }, []);

  const orderColumns = useMemo<Column<GuestOrderDto>[]>(() => {
    return [
      { id: "orderId", label: "Mã đơn", minWidth: 120 },
      { id: "bookingId", label: "Mã booking", minWidth: 120 },

      {
        id: "orderId",
        label: "Tổng tiền món",
        minWidth: 120,
        render: (row) => {
          const total = (row.items || []).reduce(
            (sum, i) => sum + i.quantity * i.unitPrice,
            0
          );
          return formatMoney(total);
        },
      },
      {
        id: "createdAt",
        label: "Tạo lúc",
        minWidth: 160,
        format: (v) => (v ? new Date(v).toLocaleString() : "—"),
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
              <DataTable<GuestRoomStayDto>
                columns={bookingColumns}
                data={roomStays}
                title=""
                loading={loading}
                getRowId={(row) => row.bookingRoomId}
                actionColumn={false}
              />
            </Stack>
            <Stack sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Lịch sử đặt món
              </Typography>
              <DataTable<GuestOrderDto>
                columns={orderColumns}
                data={orders}
                title=""
                loading={loading}
                getRowId={(row) => row.orderId}
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
