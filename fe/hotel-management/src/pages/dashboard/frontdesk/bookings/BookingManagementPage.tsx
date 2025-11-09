import {
  Alert,
  Box,
  Chip,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import { Dayjs } from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingRoomTypeDto,
  type BookingsQueryDto,
  type BookingStatus,
  type BookingSummaryDto,
} from "../../../../api/bookingsApi";
import roomTypesApi, { type RoomType } from "../../../../api/roomTypesApi";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import BookingFormModal from "./components/BookingFormModal";
import CallLogModal from "./components/CallLogModal";
import CancelBookingModal from "./components/CancelBookingModal";

import { Edit, RemoveRedEye } from "@mui/icons-material";
import FiltersBar, {
  type StatusOption as FiltersStatusOption,
} from "./components/FiltersBar";
import RoomMapDialog from "./components/RoomMapDialog";
import TopBarControls from "./components/TopBarControls";

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
  const [rows, setRows] = useState<BookingDetailsDto[]>([]);
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
  const [selectedBooking, setSelectedBooking] =
    useState<BookingDetailsDto | null>(null);

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
          console.log("all", all);
          setRows(all);
          setTotal(all.length);
          setPage(1);
        } else {
          const query = {
            ...baseQuery,
            page: pageToLoad ?? page,
            pageSize,
          } as BookingsQueryDto;
          const res = await bookingsApi.list(query);
          const data = ((res as any).data ||
            (res as any).items ||
            []) as BookingDetailsDto[];
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

  const columns: Column<BookingDetailsDto & { actions?: React.ReactNode }>[] = [
    {
      id: "createdAt",
      label: "Ngày đặt",
      minWidth: 120,
      format: (s) => {
        return s ? new Date(s).toLocaleDateString() : "";
      },
    },
    { id: "primaryGuestName", label: "Khách", minWidth: 120 },
    { id: "phoneNumber", label: "Số điện thoại", minWidth: 120 },
    {
      id: "bookingRoomTypes",
      label: "Loại phòng ",
      format: (s) => {
        return s?.map((t: BookingRoomTypeDto) => t.roomTypeName).join(", ");
      },
      minWidth: 160,
    },
    {
      id: "totalAmount",
      label: "Tổng cộng",
      minWidth: 120,
      format: (v) => (typeof v === "number" ? v.toLocaleString() : ""),
    },
    {
      id: "discountAmount",
      label: "Giảm giá",
      minWidth: 120,
      format: (v) => (typeof v === "number" ? v.toLocaleString() : ""),
    },
    {
      id: "depositAmount",
      label: "Cọc",
      minWidth: 120,
      format: (v) => (typeof v === "number" ? v.toLocaleString() : ""),
    },
    {
      id: "leftAmount",
      label: "Còn lại",
      minWidth: 120,
      format: (v) => (typeof v === "number" ? v.toLocaleString() : ""),
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

    { id: "actions", label: "Tác vụ", minWidth: 100, align: "center" },
  ];

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
          <Tooltip title="Xem chi tiết">
            <IconButton onClick={() => {}}>
              <RemoveRedEye />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton onClick={() => {}}>
              <Edit />
            </IconButton>
          </Tooltip>
        </Stack>
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
        columns={columns}
        data={tableData}
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
