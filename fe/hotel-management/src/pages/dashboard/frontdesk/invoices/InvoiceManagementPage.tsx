import {
  Alert,
  Box,
  Button,
  Chip,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import bookingsApi, {
  type BookingDetailsDto,
} from "../../../../api/bookingsApi";
import invoicesApi, { type InvoiceDto } from "../../../../api/invoicesApi";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import BookingInvoiceDialog from "../bookings/components/BookingInvoiceDialog";

type InvoiceRow = {
  id: string;
  invoiceNumber?: string;
  guestName?: string;
  roomNumber?: string;
  type: "Booking" | "Walk-in";
  totalAmount: number;
  status: string;
  createdAt: string;
  bookingId?: string;
  orderId?: string;
};

const InvoiceManagementPage: React.FC = () => {
  const { hotelId } = useStore() as StoreState;

  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({ open: false, severity: "success", message: "" });
  const [data, setData] = useState<BookingDetailsDto | null>(null);
  const [id, setId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [openBookingInvoice, setOpenBookingInvoice] = useState(false);
  const [openOrderInvoice, setOpenOrderInvoice] = useState(false);

  const columns: Column<InvoiceRow & { actions?: React.ReactNode }>[] = useMemo(
    () => [
      {
        id: "invoiceNumber",
        label: "Số hóa đơn",
        minWidth: 160,
        render: (row) => (
          <Typography fontWeight={600}>{row.invoiceNumber || "N/A"}</Typography>
        ),
      },
      { id: "guestName", label: "Khách", minWidth: 160 },
      { id: "type", label: "Loại", minWidth: 120 },
      {
        id: "totalAmount",
        label: "Tổng tiền",
        minWidth: 140,
        format: (v) => `${Number(v || 0).toLocaleString()} đ`,
      },

      {
        id: "createdAt",
        label: "Ngày tạo",
        minWidth: 160,
        format: (v) => {
          const s = v as string | undefined;
          return s ? new Date(s).toLocaleString() : "";
        },
      },
      { id: "actions", label: "Tác vụ", minWidth: 220, align: "center" },
    ],
    []
  );

  const fetchList = async (nextPage = 1) => {
    setLoading(true);
    try {
      const res = await invoicesApi.list({
        hotelId: hotelId || undefined,
        page: nextPage,
        pageSize,
      });

      const invRows: InvoiceRow[] = (res.data?.items || []).map(
        (i: InvoiceDto) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          guestName: i.guestId || "",
          roomNumber: i.bookingId ? "" : "",
          type: i.isWalkIn ? "Walk-in" : "Booking",
          totalAmount: i.totalAmount || 0,
          status: (i.statusName as string) || String(i.status),
          createdAt: i.createdAt,
          bookingId: i.bookingId,
          orderId: i.orderId,
        })
      );

      const combined = invRows.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRows(combined);
      setPage(nextPage);
      setTotal(res.data?.totalCount ?? combined.length);
    } catch (err: any) {
      setSnackbar({
        open: true,
        severity: "error",
        message: err?.message || "Không thể tải danh sách hóa đơn",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, [hotelId]);

  const onView = (row: InvoiceRow, type: InvoiceRow["type"]) => {
    setId(row.bookingId);
    setType(type);
  };

  const fetchBooking = async () => {
    if (!id) return;
    try {
      const res = await bookingsApi.getById(id);
      if (res.isSuccess && res.data) {
        setSnackbar({
          open: true,
          severity: "success",
          message: `Mở hóa đơn ${res.data.id || "N/A"}`,
        });
        setData(res.data);
        setOpenBookingInvoice(true);
      } else {
        setSnackbar({
          open: true,
          severity: "error",
          message: `Không tìm thấy hóa đơn`,
        });
      }
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: `Không tìm thấy hóa đơn`,
      });
    }
  };

  useEffect(() => {
    if (id) {
      if (type === "Booking") {
        fetchBooking();
      }
    }
  }, [id]);

  const onPrint = (row: InvoiceRow, type: InvoiceRow["type"]) => {
    setId(row.id);
    setType(type);
    setSnackbar({
      open: true,
      severity: "success",
      message: `Mở hóa đơn ${row.invoiceNumber}`,
    });
  };

  const tableData = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      actions: (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ flexWrap: "wrap" }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => onView(r, r.type)}
          >
            Xem
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => onPrint(r, r.type)}
          >
            In
          </Button>
        </Stack>
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  return (
    <Box>
      <PageTitle
        title="Hóa đơn"
        subtitle="Quản lý hóa đơn Walk-in và Booking"
      />

      <DataTable
        title="Danh sách hóa đơn"
        columns={columns}
        data={tableData}
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (p) => fetchList(p),
        }}
        onSearch={(text) => {
          setSearch(text);
          fetchList(1);
        }}
        actionColumn={false}
        getRowId={(r: any) => r.id}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <BookingInvoiceDialog
        open={openBookingInvoice}
        onClose={() => setOpenBookingInvoice(false)}
        booking={data as any}
        onRefreshBooking={fetchBooking}
      />
    </Box>
  );
};

export default InvoiceManagementPage;
