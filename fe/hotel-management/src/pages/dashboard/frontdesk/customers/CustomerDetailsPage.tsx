import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DataTable, { type Column } from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";
import customersApi, {
  type CustomerDetailsDto,
} from "../../../../api/customersApi";
import type { BookingSummaryDto } from "../../../../api/bookingsApi";
import type { OrderSummaryDto } from "../../../../api/ordersApi";

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CustomerDetailsDto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await customersApi.getDetails(id);
        if (res.isSuccess) {
          setData(res.data);
        } else {
          setError(res.message || "Không thể tải dữ liệu khách hàng");
        }
      } catch (e: any) {
        setError(
          e?.message || "Không thể tải dữ liệu khách hàng. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const bookingColumns: Column<BookingSummaryDto>[] = [
    { id: "id", label: "Mã", minWidth: 120 },
    {
      id: "roomNumber",
      label: "Phòng",
      minWidth: 100,
      format: (v) => v || "—",
    },
    {
      id: "roomTypeName",
      label: "Loại phòng",
      minWidth: 140,
      format: (v) => v || "—",
    },
    {
      id: "startDate",
      label: "Từ ngày",
      minWidth: 120,
      format: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—"),
    },
    {
      id: "endDate",
      label: "Đến ngày",
      minWidth: 120,
      format: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—"),
    },
    {
      id: "status",
      label: "Trạng thái",
      minWidth: 120,
      format: (v) => String(v),
    },
    {
      id: "depositAmount",
      label: "Tiền cọc",
      minWidth: 120,
      format: (v) =>
        typeof v === "number"
          ? new Intl.NumberFormat("vi-VN").format(v)
          : "—",
    },
  ];

  const orderColumns: Column<OrderSummaryDto>[] = [
    { id: "id", label: "Mã", minWidth: 120 },
    {
      id: "status",
      label: "Trạng thái",
      minWidth: 120,
      format: (v) => String(v),
    },
    {
      id: "itemsCount",
      label: "SL món",
      minWidth: 80,
      format: (v) => String(v ?? 0),
    },
    {
      id: "itemsTotal",
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
      minWidth: 140,
      format: (v) => (v ? new Date(v).toLocaleString("vi-VN") : "—"),
    },
    {
      id: "servingDate",
      label: "Ngày phục vụ",
      minWidth: 140,
      format: (v) => (v ? new Date(v).toLocaleString("vi-VN") : "—"),
    },
  ];

  const customer = data?.customer;

  return (
    <Box>
      <PageTitle title="Chi tiết khách hàng" subtitle="Thông tin, booking, order" />
      {error && (
        <Alert
          severity="error"
          sx={{ my: 2, color: "error.main", fontSize: 13 }}
        >
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Thông tin khách hàng
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            {!customer ? (
              <Typography color="text.secondary">
                {loading ? "Đang tải..." : "Không có dữ liệu khách hàng"}
              </Typography>
            ) : (
              <Stack
                spacing={1.5}
                direction={{ xs: "column", sm: "row" }}
                flexWrap="wrap"
              >
                <Chip
                  icon={<PersonIcon />}
                  label={customer.fullName || "—"}
                  variant="outlined"
                />
                <Chip
                  icon={<PhoneIcon />}
                  label={customer.phone || "—"}
                  variant="outlined"
                />
                <Chip
                  icon={<EmailIcon />}
                  label={customer.email || "—"}
                  variant="outlined"
                />
                <Chip
                  icon={<CreditCardIcon />}
                  label={customer.idCard || "—"}
                  variant="outlined"
                />
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Booking
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <DataTable<BookingSummaryDto>
              columns={bookingColumns}
              data={(data?.bookings || []).map((b) => ({
                ...b,
              }))}
              loading={loading}
              getRowId={(row) => row.id}
              actionColumn={false}
              borderRadius={2}
            />
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ReceiptLongIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Order
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <DataTable<OrderSummaryDto>
              columns={orderColumns}
              data={(data?.orders || []).map((o) => ({ ...o }))}
              loading={loading}
              getRowId={(row) => row.id}
              actionColumn={false}
              borderRadius={2}
            />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default CustomerDetailsPage;

