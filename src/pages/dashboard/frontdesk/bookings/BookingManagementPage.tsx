import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PageTitle from "../../../../components/common/PageTitle";
import DataTable, { type Column } from "../../../../components/common/DataTable";
import bookingsApi, {
  type BookingSummaryDto,
  type BookingDto,
  type BookingsQueryDto,
  type PaymentType,
} from "../../../../api/bookingsApi";
import roomsApi, { type RoomDto } from "../../../../api/roomsApi";
import roomTypesApi, { type RoomType } from "../../../../api/roomTypesApi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import BookingFormModal from "./components/BookingFormModal";
import EditBookingFormModal from "./components/EditBookingFormModal";
import CancelBookingModal from "./components/CancelBookingModal";
import CallLogModal from "./components/CallLogModal";
import RoomMapTimeline from "./components/RoomMapTimeline";

type StatusOption = { value: number | ""; label: string };

const STATUS_OPTIONS: StatusOption[] = [
  { value: "", label: "Tất cả" },
  { value: 0, label: "Chờ duyệt" },
  { value: 1, label: "Đã xác nhận" },
  { value: 2, label: "Đã nhận phòng" },
  { value: 3, label: "Hoàn tất" },
  { value: 4, label: "Đã hủy" },
];

const BookingManagementPage: React.FC = () => {
  // Data state
  const [rows, setRows] = useState<BookingSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filters
  const [hotelId, setHotelId] = useState<string>("");
  const [status, setStatus] = useState<number | "">("");
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [guestName, setGuestName] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [roomTypeId, setRoomTypeId] = useState<string>("");

  // Reference data for selects
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [refLoading, setRefLoading] = useState(false);

  // Modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openCallLog, setOpenCallLog] = useState(false);
  const [openRoomMap, setOpenRoomMap] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);

  // Notifications
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" | "warning" }>({ open: false, message: "", severity: "success" });

  const fetchRefs = useCallback(async () => {
    setRefLoading(true);
    try {
      const rtRes = await roomTypesApi.getRoomTypes({ hotelId: hotelId || undefined, page: 1, pageSize: 100 });
      if (rtRes.isSuccess) setRoomTypes(rtRes.data);
      const rRes = await roomsApi.getRooms({ hotelId: hotelId || undefined, page: 1, pageSize: 100 });
      if (rRes.isSuccess) setRooms(rRes.data);
    } catch (err) {
      setSnackbar({ open: true, message: "Không thể tải dữ liệu tham chiếu", severity: "error" });
    } finally {
      setRefLoading(false);
    }
  }, [hotelId]);

  const fetchList = useCallback(async (pageToLoad?: number) => {
    setLoading(true);
    try {
      const query: BookingsQueryDto = {
        hotelId: hotelId || undefined,
        status: status === "" ? undefined : (status as number),
        startDate: fromDate ? fromDate.toDate().toISOString() : undefined,
        endDate: toDate ? toDate.toDate().toISOString() : undefined,
        guestName: guestName || undefined,
        roomNumber: roomNumber || undefined,
        page: pageToLoad ?? page,
        pageSize,
        sortBy: "createdAt",
        sortDir: "desc",
      };
      const res = await bookingsApi.list(query);
      setRows(res.data || []);
      setTotal(res.meta?.total ?? 0);
      if (pageToLoad) setPage(pageToLoad);
    } catch (err) {
      setSnackbar({ open: true, message: "Không thể tải danh sách booking", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [hotelId, status, fromDate, toDate, guestName, roomNumber, page, pageSize]);

  useEffect(() => {
    fetchRefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fromDate, toDate, guestName, roomNumber, hotelId]);

  const openEditModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if (res.isSuccess && res.data) {
        setSelectedBooking(res.data);
        setOpenEdit(true);
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Không thể mở chi tiết booking", severity: "error" });
    }
  };

  const openCancelModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if (res.isSuccess && res.data) {
        setSelectedBooking(res.data);
        setOpenCancel(true);
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Không thể mở hủy booking", severity: "error" });
    }
  };

  const openCallLogModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if (res.isSuccess && res.data) {
        setSelectedBooking(res.data);
        setOpenCallLog(true);
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Không thể mở xác nhận cuộc gọi", severity: "error" });
    }
  };

  const columns: Column<BookingSummaryDto & { actions?: React.ReactNode }>[] = [
    { id: "id", label: "ID", minWidth: 140 },
    { id: "roomNumber", label: "Phòng", minWidth: 80 },
    { id: "roomTypeName", label: "Loại phòng", minWidth: 120 },
    {
      id: "startDate",
      label: "Từ",
      minWidth: 140,
      format: (v) => (v ? new Date(v).toLocaleString() : ""),
    },
    {
      id: "endDate",
      label: "Đến",
      minWidth: 140,
      format: (v) => (v ? new Date(v).toLocaleString() : ""),
    },
    {
      id: "status",
      label: "Trạng thái",
      minWidth: 120,
      format: (s) => {
        const mapping: Record<number, { label: string; color: "default" | "primary" | "success" | "warning" | "error" }> = {
          0: { label: "Chờ duyệt", color: "default" },
          1: { label: "Đã xác nhận", color: "primary" },
          2: { label: "Đã nhận phòng", color: "success" },
          3: { label: "Hoàn tất", color: "success" },
          4: { label: "Đã hủy", color: "error" },
        };
        const m = mapping[s as number] || { label: String(s), color: "default" };
        return <Chip label={m.label} color={m.color} size="small" />;
      },
    },
    {
      id: "depositAmount",
      label: "Cọc",
      minWidth: 80,
      format: (v) => (typeof v === "number" ? v.toLocaleString() : ""),
    },
    { id: "primaryGuestName", label: "Khách", minWidth: 160 },
    { id: "actions", label: "Tác vụ", minWidth: 220, align: "center" },
  ];

  const tableData = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      actions: (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button size="small" variant="text" onClick={() => openEditModal(r)}>Sửa</Button>
          <Button size="small" variant="text" color="error" onClick={() => openCancelModal(r)}>Hủy</Button>
          <Button size="small" variant="text" color="warning" onClick={() => openCallLogModal(r)}>Gọi xác nhận</Button>
        </Stack>
      ),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  return (
    <Box>
      <PageTitle title="Quản lý Bookings" subtitle="Tạo, chỉnh sửa, hủy, xác nhận cuộc gọi và xem sơ đồ phòng" />

      {/* Top bar: hotel scope & refresh */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField label="Hotel ID (tuỳ chọn)" value={hotelId} onChange={(e) => setHotelId(e.target.value)} sx={{ minWidth: 280 }} />
        <Button variant="outlined" onClick={() => fetchList(1)}>Làm mới</Button>
        <Button variant="contained" onClick={() => setOpenCreate(true)}>Thêm booking</Button>
        <Button variant="outlined" color="info" onClick={() => setOpenRoomMap(true)}>Xem sơ đồ phòng</Button>
      </Stack>

      {/* Filters */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={2}>
          <TextField select label="Trạng thái" value={status} onChange={(e) => setStatus((e.target.value as any) as number | "")} fullWidth>
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={String(opt.value)} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Từ ngày" value={fromDate} onChange={(v) => setFromDate(v)} slotProps={{ textField: { fullWidth: true } }} />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Đến ngày" value={toDate} onChange={(v) => setToDate(v)} slotProps={{ textField: { fullWidth: true } }} />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField label="Tên khách" value={guestName} onChange={(e) => setGuestName(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField label="Số phòng" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField select disabled={refLoading} label="Loại phòng" value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)} fullWidth>
            <MenuItem value="">Tất cả</MenuItem>
            {roomTypes.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={tableData}
        loading={loading}
        getRowId={(row) => (row as any).id}
        pagination={{ page, pageSize, total, onPageChange: (p) => fetchList(p) }}
      />

      {/* Create Booking */}
      <BookingFormModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        hotelId={hotelId}
        rooms={rooms}
        onSubmitted={() => fetchList(page)}
      />

      {/* Edit Booking */}
      <EditBookingFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        booking={selectedBooking}
        rooms={rooms}
        onSubmitted={() => fetchList(page)}
      />

      {/* Cancel Booking */}
      <CancelBookingModal
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        booking={selectedBooking}
        onSubmitted={() => fetchList(page)}
      />

      {/* Call Confirmation (UC-32) */}
      <CallLogModal
        open={openCallLog}
        onClose={() => setOpenCallLog(false)}
        booking={selectedBooking}
        onSubmitted={() => fetchList(page)}
      />

      {/* Room Map Timeline (UC-34) */}
      <RoomMapTimeline
        open={openRoomMap}
        onClose={() => setOpenRoomMap(false)}
        hotelId={hotelId}
        roomTypeId={roomTypeId || undefined}
      />

      {/* Snackbar notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingManagementPage;