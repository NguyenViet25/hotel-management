import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Dayjs } from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import CustomSelect from "../../../../components/common/CustomSelect";
import EmptyState from "../../../../components/common/EmptyState";
import BookingFormModal from "./components/BookingFormModal";
import CallLogModal from "./components/CallLogModal";
import CancelBookingModal from "./components/CancelBookingModal";

import { Edit, RemoveRedEye } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ReceiptIcon from "@mui/icons-material/Receipt";
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
  { value: 4 as BookingStatus, label: "Đã hủy" },
];

const BookingManagementPage: React.FC = () => {
  const navigate = useNavigate();
  // Data state
  const [rows, setRows] = useState<BookingDetailsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");

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

  const openEditModal = async (summary: BookingDetailsDto) => {
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
        return s?.map((t: BookingRoomTypeDto) => (
          <Stack key={t.roomTypeId} gap={1}>
            <Typography variant="body2">
              {t.totalRoom} {t.roomTypeName}
            </Typography>
          </Stack>
        ));
      },
      minWidth: 160,
    },
    {
      id: "totalAmount",
      label: "Tổng cộng",
      minWidth: 120,
      format: (v) => (typeof v === "number" ? `${v.toLocaleString()} đ` : ""),
    },
    {
      id: "discountAmount",
      label: "Giảm giá",
      minWidth: 120,
      format: (v) => (typeof v === "number" ? `${v.toLocaleString()} đ` : ""),
    },
    {
      id: "depositAmount",
      label: "Cọc",
      minWidth: 120,
      format: (v) => (typeof v === "number" ? `${v.toLocaleString()} đ` : ""),
    },
    {
      id: "leftAmount",
      label: "Còn lại",
      minWidth: 120,
      format: (v) => (typeof v === "number" ? `${v.toLocaleString()} đ` : ""),
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
            <IconButton onClick={() => navigate(`/frontdesk/bookings/${r.id}`)}>
              <RemoveRedEye />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton onClick={() => openEditModal(r)}>
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
        statusOptions={STATUS_OPTIONS as FiltersStatusOption[]}
      />

      {viewMode === "table" ? (
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
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {(() => {
            const listData = rows;
            if (!loading && listData.length === 0) {
              return (
                <EmptyState
                  title="Không có booking"
                  description="Chưa có yêu cầu đặt phòng. Hãy thêm yêu cầu mới."
                  actions={
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setOpenCreate(true);
                        }}
                      >
                        Thêm booking
                      </Button>
                    </Stack>
                  }
                />
              );
            }
            return listData.map((b, idx) => {
              const totalRooms = (b.bookingRoomTypes || []).reduce(
                (sum, rt) =>
                  sum + (rt.totalRoom || rt.bookingRooms?.length || 0),
                0
              );
              const statusColor =
                b.status === 2
                  ? "success"
                  : b.status === 4
                  ? "error"
                  : b.status === 1
                  ? "primary"
                  : "default";
              const statusLabel =
                b.status === 0
                  ? "Chờ duyệt"
                  : b.status === 1
                  ? "Đã xác nhận"
                  : b.status === 2
                  ? "Đã nhận phòng"
                  : b.status === 3
                  ? "Hoàn tất"
                  : b.status === 4
                  ? "Đã hủy"
                  : String(b.status);
              return (
                <Card key={b.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ReceiptIcon color="primary" />
                          <Typography fontWeight={700}>{`Booking: #${String(
                            idx + 1
                          ).toUpperCase()}`}</Typography>
                          <Chip label={`SL: ${totalRooms}`} size="small" />
                          <Chip
                            label={`${(b.totalAmount || 0).toLocaleString()} đ`}
                            size="small"
                            color="primary"
                          />
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography color="text.secondary">
                            {new Date(b.createdAt).toLocaleString()}
                          </Typography>
                          <Chip
                            color={statusColor as any}
                            label={statusLabel}
                          />
                        </Stack>
                      </Stack>

                      <Divider />

                      <Stack
                        direction={{ xs: "column", lg: "row" }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ width: "100%" }}
                      >
                        <Stack
                          direction={{ xs: "column", lg: "row" }}
                          spacing={2}
                        >
                          <Stack
                            direction={{ xs: "row" }}
                            spacing={1}
                            alignItems="center"
                          >
                            <PersonIcon color="action" />
                            <Typography>{b.primaryGuestName || "—"}</Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <PhoneIphoneIcon color="action" />
                            <Typography>{b.phoneNumber || "—"}</Typography>
                          </Stack>
                        </Stack>
                        <Stack
                          direction={{ xs: "column", lg: "row" }}
                          spacing={1}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => openEditModal(b as any)}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<RemoveRedEye />}
                            onClick={() =>
                              navigate(`/frontdesk/bookings/${b.id}`)
                            }
                          >
                            Xem
                          </Button>
                        </Stack>
                      </Stack>

                      <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Các loại phòng
                        </Typography>
                        {b.bookingRoomTypes?.length ? (
                          b.bookingRoomTypes.map((rt) => (
                            <Stack
                              key={rt.bookingRoomTypeId}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Chip
                                label={`${rt.totalRoom} ${
                                  rt.roomTypeName || "—"
                                }`}
                              />
                              <Typography color="text.secondary">
                                {new Date(rt.startDate).toLocaleDateString()} -{" "}
                                {new Date(rt.endDate).toLocaleDateString()}
                              </Typography>
                              <Chip
                                label={`${(
                                  rt.price || 0
                                ).toLocaleString()} đ/đêm`}
                              />
                            </Stack>
                          ))
                        ) : (
                          <Typography color="text.secondary">
                            Không có loại phòng
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            });
          })()}
        </Stack>
      )}

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

      {/* Update */}
      <BookingFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        mode="update"
        bookingData={selectedBooking as any}
        onUpdate={async (payload) => {
          if (!selectedBooking) return;
          try {
            const res = await bookingsApi.update(selectedBooking.id, payload);
            if ((res as any).isSuccess) {
              setSnackbar({
                open: true,
                message: "Cập nhật booking thành công",
                severity: "success",
              });
              setOpenEdit(false);
              fetchList(page);
            } else {
              setSnackbar({
                open: true,
                message: (res as any).message || "Cập nhật thất bại",
                severity: "error",
              });
            }
          } catch {
            setSnackbar({
              open: true,
              message: "Cập nhật thất bại",
              severity: "error",
            });
          }
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
      <RoomMapDialog open={openRoomMap} onClose={() => setOpenRoomMap(false)} />

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
