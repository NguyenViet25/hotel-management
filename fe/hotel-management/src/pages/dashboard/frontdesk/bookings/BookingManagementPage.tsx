import { Alert, Box, Chip, Snackbar, Stack, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import bookingsApi, {
  type BookingDto,
  type BookingsQueryDto,
  type BookingStatus,
  type BookingSummaryDto,
} from "../../../../api/bookingsApi";
import roomTypesApi, { type RoomType } from "../../../../api/roomTypesApi";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";
import ActionsCell from "./components/ActionsCell";
import BookingFormModal from "./components/BookingFormModal";
import CallLogModal from "./components/CallLogModal";
import CancelBookingModal from "./components/CancelBookingModal";
import ChangeRoomModal from "./components/ChangeRoomModal";
import CheckInModal from "./components/CheckInModal";
import CheckoutModal from "./components/CheckoutModal";
import EditBookingFormModal from "./components/EditBookingFormModal";
import ExtendStayModal from "./components/ExtendStayModal";
import FiltersBar, {
  type StatusOption as FiltersStatusOption,
} from "./components/FiltersBar";
import RoomMapDialog from "./components/RoomMapDialog";
import TopBarControls from "./components/TopBarControls";
import { useStore, type StoreState } from "../../../../hooks/useStore";

type StatusOption = { value: BookingStatus | ""; label: string };

const STATUS_OPTIONS: StatusOption[] = [
  { value: "", label: "Tất cả" },
  { value: 0 as BookingStatus, label: "Chờ duyệt" },
  { value: 1 as BookingStatus, label: "Đã xác nhận" },
  { value: 2 as BookingStatus, label: "Đã nhận phòng" },
  { value: 3 as BookingStatus, label: "Hoàn tất" },
  { value: 4 as BookingStatus, label: "Đã hủy" },
];

const BookingManagementPage: React.FC = () => {
  // Data state
  const [rows, setRows] = useState<BookingSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filters
  const { user } = useStore<StoreState>((state) => state);
  const hotelId = user?.hotelId || "";
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [guestName, setGuestName] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [roomTypeId, setRoomTypeId] = useState<string>("");

  // Reference data for selects
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
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
      console.log("rtRes", rtRes);
      const rtItems = (rtRes as any).items || rtRes.data || [];
      setRoomTypes(rtItems);
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
        const baseQuery: BookingsQueryDto = {
          hotelId: hotelId || undefined,
          status: status === "" ? undefined : (status as BookingStatus),
          startDate: fromDate ? fromDate.toDate().toISOString() : undefined,
          endDate: toDate ? toDate.toDate().toISOString() : undefined,
          guestName: guestName || undefined,
          roomNumber: roomNumber || undefined,
          sortBy: "createdAt",
          sortDir: "desc",
        } as any;

        const noFilters =
          !baseQuery.status &&
          !baseQuery.startDate &&
          !baseQuery.endDate &&
          !baseQuery.guestName &&
          !baseQuery.roomNumber;

        if (noFilters) {
          // Fetch all bookings at once for initial view
          const all = await bookingsApi.getAll(baseQuery);
          setRows(all as any);
          setTotal(all.length);
          setPage(1);
        } else {
          const query = {
            ...baseQuery,
            page: pageToLoad ?? page,
            pageSize,
          } as BookingsQueryDto;
          const res = await bookingsApi.list(query);
          const data = (res as any).data || (res as any).items || [];
          const meta = (res as any).meta || {};
          setRows(data);
          setTotal(meta.total ?? data.length ?? 0);
          if (pageToLoad) setPage(pageToLoad);
        }
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

  const openCheckInModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if ((res as any)?.isSuccess && (res as any)?.data) {
        setSelectedBooking((res as any).data);
        setOpenCheckIn(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể mở check-in",
        severity: "error",
      });
    }
  };

  const openChangeRoomModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if ((res as any)?.isSuccess && (res as any)?.data) {
        setSelectedBooking((res as any).data);
        setOpenChangeRoom(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể mở đổi phòng",
        severity: "error",
      });
    }
  };

  const openExtendStayModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if ((res as any)?.isSuccess && (res as any)?.data) {
        setSelectedBooking((res as any).data);
        setOpenExtendStay(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể mở gia hạn",
        severity: "error",
      });
    }
  };

  const openCheckoutModal = async (summary: BookingSummaryDto) => {
    try {
      const res = await bookingsApi.getById(summary.id);
      if ((res as any)?.isSuccess && (res as any)?.data) {
        setSelectedBooking((res as any).data);
        setOpenCheckout(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Không thể mở check-out",
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
        <ActionsCell
          summary={r}
          onEdit={openEditModal}
          onCancel={openCancelModal}
          onCallLog={openCallLogModal}
          onCheckIn={openCheckInModal}
          onChangeRoom={openChangeRoomModal}
          onExtendStay={openExtendStayModal}
          onCheckout={openCheckoutModal}
        />
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent={"space-between"}
        spacing={2}
        mb={2}
      >
        <PageTitle
          title="Quản lý yêu cầu đặt phòng"
          subtitle="Tạo, chỉnh sửa, hủy, xác nhận yêu cầu và xem sơ đồ phòng"
        />

        {/* Top bar: hotel scope & refresh */}
        <TopBarControls
          onAddBooking={() => setOpenCreate(true)}
          onOpenRoomMap={() => setOpenRoomMap(true)}
        />
      </Stack>

      {/* Filters */}
      <FiltersBar
        status={status}
        onStatusChange={setStatus}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        guestName={guestName}
        roomNumber={roomNumber}
        onGuestNameChange={setGuestName}
        onRoomNumberChange={setRoomNumber}
        roomTypeId={roomTypeId}
        onRoomTypeIdChange={setRoomTypeId}
        roomTypes={roomTypes}
        statusOptions={STATUS_OPTIONS as FiltersStatusOption[]}
      />

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
        getRowId={(r: any) => r.id}
      />

      {/* Create */}
      <BookingFormModal
        open={openCreate}
        hotelId={hotelId}
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
          setSnackbar({
            open: true,
            message: "Đã check-in",
            severity: "success",
          });
          fetchList();
        }}
      />

      {/* Change Room */}
      <ChangeRoomModal
        open={openChangeRoom}
        onClose={() => setOpenChangeRoom(false)}
        booking={selectedBooking}
        onSubmitted={() => {
          setSnackbar({
            open: true,
            message: "Đã đổi phòng",
            severity: "success",
          });
          fetchList();
        }}
      />

      {/* Extend Stay */}
      <ExtendStayModal
        open={openExtendStay}
        onClose={() => setOpenExtendStay(false)}
        booking={selectedBooking}
        onSubmitted={() => {
          setSnackbar({
            open: true,
            message: "Đã gia hạn",
            severity: "success",
          });
          fetchList();
        }}
      />

      {/* Checkout */}
      <CheckoutModal
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        booking={selectedBooking}
        onSubmitted={(summary) => {
          setSnackbar({
            open: true,
            message: summary || "Đã check-out",
            severity: "success",
          });
          fetchList();
        }}
      />

      {/* Room map timeline dialog */}
      <RoomMapDialog
        open={openRoomMap}
        onClose={() => setOpenRoomMap(false)}
        from={fromDate}
        to={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        roomTypeId={roomTypeId}
        onRoomTypeIdChange={setRoomTypeId}
        roomTypes={roomTypes}
        onSelectBooking={(bid) => {
          setOpenRoomMap(false);
          bookingsApi.getById(bid).then((res: any) => {
            if (res?.isSuccess && res.data) {
              setSelectedBooking(res.data);
              setOpenEdit(true);
            }
          });
        }}
      />

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
