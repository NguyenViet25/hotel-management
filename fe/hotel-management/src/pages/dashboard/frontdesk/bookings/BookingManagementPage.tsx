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
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import PageTitle from "../../../../components/common/PageTitle";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import bookingsApi, {
  type BookingSummaryDto,
  type BookingDto,
  type BookingsQueryDto,
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
import CheckInModal from "./components/CheckInModal";
import ChangeRoomModal from "./components/ChangeRoomModal";
import ExtendStayModal from "./components/ExtendStayModal";
import CheckoutModal from "./components/CheckoutModal";

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
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openChangeRoom, setOpenChangeRoom] = useState(false);
  const [openExtendStay, setOpenExtendStay] = useState(false);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(
    null
  );

  // Notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const fetchRefs = useCallback(async () => {
    setRefLoading(true);
    try {
      const rtRes = await roomTypesApi.getRoomTypes({
        hotelId: hotelId || undefined,
        page: 1,
        pageSize: 100,
      });
      const rtItems = (rtRes as any).items || rtRes.data || [];
      setRoomTypes(rtItems);
      const rRes = await roomsApi.getRooms({
        hotelId: hotelId || undefined,
        page: 1,
        pageSize: 100,
      });
      const rItems = (rRes as any).items || rRes.data || [];
      setRooms(rItems);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể tải dữ liệu tham chiếu",
        severity: "error",
      });
    } finally {
      setRefLoading(false);
    }
  }, [hotelId]);

  const fetchList = useCallback(
    async (pageToLoad?: number) => {
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
        const data = (res as any).data || (res as any).items || [];
        const meta = (res as any).meta || {};
        setRows(data);
        setTotal(meta.total ?? data.length ?? 0);
        if (pageToLoad) setPage(pageToLoad);
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Không thể tải danh sách booking",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [hotelId, status, fromDate, toDate, guestName, roomNumber, page, pageSize]
  );

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
      if ((res as any).isSuccess && (res as any).data) {
        setSelectedBooking((res as any).data);
        setOpenEdit(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể mở chi tiết booking",
        severity: "error",
      });
    }
  };

  const openCancelModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if ((res as any).isSuccess && (res as any).data) {
        setSelectedBooking((res as any).data);
        setOpenCancel(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể mở hủy booking",
        severity: "error",
      });
    }
  };

  const openCallLogModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if ((res as any).isSuccess && (res as any).data) {
        setSelectedBooking((res as any).data);
        setOpenCallLog(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể mở xác nhận cuộc gọi",
        severity: "error",
      });
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
        const mapping: Record<
          number,
          {
            label: string;
            color: "default" | "primary" | "success" | "warning" | "error";
          }
        > = {
          0: { label: "Chờ duyệt", color: "default" },
          1: { label: "Đã xác nhận", color: "primary" },
          2: { label: "Đã nhận phòng", color: "success" },
          3: { label: "Hoàn tất", color: "success" },
          4: { label: "Đã hủy", color: "error" },
        };
        const m = mapping[s as number] || {
          label: String(s),
          color: "default",
        };
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
    { id: "actions", label: "Tác vụ", minWidth: 520, align: "center" },
  ];

  const tableData = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      actions: (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: "wrap" }}>
          <Button size="small" variant="text" onClick={() => openEditModal(r)}>
            Sửa
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={() => openCancelModal(r)}
          >
            Hủy
          </Button>
          <Button
            size="small"
            variant="text"
            color="warning"
            onClick={() => openCallLogModal(r)}
          >
            Gọi xác nhận
          </Button>
          <Button
            size="small"
            variant="text"
            color="success"
            onClick={async () => {
              const res = await bookingsApi.getById(r.id);
              if ((res as any)?.isSuccess && (res as any)?.data) {
                setSelectedBooking((res as any).data);
                setOpenCheckIn(true);
              }
            }}
          >
            Nhận phòng
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={async () => {
              const res = await bookingsApi.getById(r.id);
              if ((res as any)?.isSuccess && (res as any)?.data) {
                setSelectedBooking((res as any).data);
                setOpenChangeRoom(true);
              }
            }}
          >
            Đổi phòng
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={async () => {
              const res = await bookingsApi.getById(r.id);
              if ((res as any)?.isSuccess && (res as any)?.data) {
                setSelectedBooking((res as any).data);
                setOpenExtendStay(true);
              }
            }}
          >
            Gia hạn
          </Button>
          <Button
            size="small"
            variant="text"
            color="primary"
            onClick={async () => {
              const res = await bookingsApi.getById(r.id);
              if ((res as any)?.isSuccess && (res as any)?.data) {
                setSelectedBooking((res as any).data);
                setOpenCheckout(true);
              }
            }}
          >
            Check-out
          </Button>
        </Stack>
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  return (
    <Box>
      <PageTitle
        title="Quản lý Bookings"
        subtitle="Tạo, chỉnh sửa, hủy, xác nhận cuộc gọi và xem sơ đồ phòng"
      />

      {/* Top bar: hotel scope & refresh */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <TextField
          label="Hotel ID (tuỳ chọn)"
          value={hotelId}
          onChange={(e) => setHotelId(e.target.value)}
          sx={{ minWidth: 280 }}
        />
        <Button variant="outlined" onClick={() => fetchList(1)}>
          Làm mới
        </Button>
        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          Thêm booking
        </Button>
        <Button
          variant="outlined"
          color="info"
          onClick={() => setOpenRoomMap(true)}
        >
          Xem sơ đồ phòng
        </Button>
      </Stack>

      {/* Filters */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={2}>
          <TextField
            select
            label="Trạng thái"
            value={status}
            onChange={(e) => setStatus(e.target.value as any as number | "")}
            fullWidth
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={String(opt.value)} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={(v) => setFromDate(v)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={(v) => setToDate(v)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            label="Tên khách"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            label="Số phòng"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            select
            label="Loại phòng"
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Tất cả</MenuItem>
            {roomTypes.map((rt) => (
              <MenuItem key={rt.id} value={rt.id}>
                {rt.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Table */}
      <DataTable
        title="Danh sách booking"
        columns={columns as any}
        data={tableData as any}
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (p) => fetchList(p),
        }}
        onAdd={() => setOpenCreate(true)}
        getRowId={(r: any) => r.id}
      />

      {/* Create */}
      <BookingFormModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmitted={() => {
          setSnackbar({
            open: true,
            message: "Tạo booking thành công",
            severity: "success",
          });
          fetchList(1);
        }}
      />

      {/* Edit */}
      <EditBookingFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        booking={selectedBooking}
        onSubmitted={() => {
          setSnackbar({
            open: true,
            message: "Cập nhật booking thành công",
            severity: "success",
          });
          fetchList();
        }}
      />

      {/* Cancel */}
      <CancelBookingModal
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        booking={selectedBooking}
        onSubmitted={() => {
          setSnackbar({
            open: true,
            message: "Đã hủy booking",
            severity: "success",
          });
          fetchList();
        }}
      />

      {/* Call log */}
      <CallLogModal
        open={openCallLog}
        onClose={() => setOpenCallLog(false)}
        booking={selectedBooking}
        onSubmitted={() => {
          setSnackbar({
            open: true,
            message: "Đã ghi nhận cuộc gọi",
            severity: "success",
          });
          fetchList();
        }}
      />

      {/* Check-in */}
      <CheckInModal
        open={openCheckIn}
        onClose={() => setOpenCheckIn(false)}
        booking={selectedBooking}
        onSubmitted={() => {
          setSnackbar({ open: true, message: "Đã check-in", severity: "success" });
          fetchList();
        }}
      />

      {/* Change Room */}
      <ChangeRoomModal
        open={openChangeRoom}
        onClose={() => setOpenChangeRoom(false)}
        booking={selectedBooking}
        onSubmitted={() => {
          setSnackbar({ open: true, message: "Đã đổi phòng", severity: "success" });
          fetchList();
        }}
      />

      {/* Extend Stay */}
      <ExtendStayModal
        open={openExtendStay}
        onClose={() => setOpenExtendStay(false)}
        booking={selectedBooking}
        onSubmitted={() => {
          setSnackbar({ open: true, message: "Đã gia hạn", severity: "success" });
          fetchList();
        }}
      />

      {/* Checkout */}
      <CheckoutModal
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        booking={selectedBooking}
        onSubmitted={(summary) => {
          setSnackbar({ open: true, message: summary || "Đã check-out", severity: "success" });
          fetchList();
        }}
      />

      {/* Room map timeline dialog */}
      <Dialog
        open={openRoomMap}
        onClose={() => setOpenRoomMap(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Sơ đồ phòng</DialogTitle>
        <DialogContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Từ ngày"
                value={fromDate ?? dayjs()}
                onChange={(v) => setFromDate(v)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Đến ngày"
                value={toDate ?? dayjs().add(3, "day")}
                onChange={(v) => setToDate(v)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <TextField
              select
              label="Loại phòng"
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {roomTypes.map((rt) => (
                <MenuItem key={rt.id} value={rt.id}>
                  {rt.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {fromDate && toDate ? (
            <RoomMapTimeline
              from={fromDate}
              to={toDate}
              roomTypeId={roomTypeId || undefined}
              onSelectBooking={(bid) => {
                setOpenRoomMap(false);
                // Open edit modal for booking
                bookingsApi.getById(bid).then((res: any) => {
                  if (res?.isSuccess && res.data) {
                    setSelectedBooking(res.data);
                    setOpenEdit(true);
                  }
                });
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Chọn khoảng ngày để xem timeline.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingManagementPage;
