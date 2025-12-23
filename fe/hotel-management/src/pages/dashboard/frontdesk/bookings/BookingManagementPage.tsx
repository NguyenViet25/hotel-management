import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Pagination,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bookingsApi, {
  EBookingStatus,
  type BookingDetailsDto,
  type BookingRoomTypeDto,
  type BookingsQueryDto,
  type BookingStatus,
} from "../../../../api/bookingsApi";
import roomTypesApi, { type RoomType } from "../../../../api/roomTypesApi";
import EmptyState from "../../../../components/common/EmptyState";
import PageTitle from "../../../../components/common/PageTitle";
import { useStore, type StoreState } from "../../../../hooks/useStore";
import BookingFormModal from "./components/BookingFormModal";
import CallLogModal from "./components/CallLogModal";
import CancelBookingModal from "./components/CancelBookingModal";

import {
  AddCircle,
  Edit,
  ExpandMore,
  Hotel,
  Info,
  Phone,
  Print,
  ReceiptLong,
  RemoveRedEye,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import DataTable, {
  type Column,
} from "../../../../components/common/DataTable";
import Loading from "../../../../components/common/Loading";
import BookingInvoiceDialog from "./components/BookingInvoiceDialog";
import FiltersBar, {
  type StatusOption as FiltersStatusOption,
} from "./components/FiltersBar";
import PriceCalendarDialog from "./components/PriceCalendarDialog";
import RoomMapDialog from "./components/RoomMapDialog";
import TopBarControls from "./components/TopBarControls";
import { toast } from "react-toastify";

type StatusOption = { value: BookingStatus | ""; label: string };

const STATUS_OPTIONS: StatusOption[] = [
  { value: " " as any, label: "Tất cả" },
  { value: 0 as BookingStatus, label: "Chờ duyệt" },
  { value: 1 as BookingStatus, label: "Đã xác nhận" },
  { value: 3 as BookingStatus, label: "Đã hoàn thành" },
  { value: 4 as BookingStatus, label: "Đã hủy" },
  { value: 5 as BookingStatus, label: "Vắng mặt" },
];

const BookingManagementPage: React.FC = () => {
  const navigate = useNavigate();
  // Data state
  const [rows, setRows] = useState<BookingDetailsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);

  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  // Filters
  const { user } = useStore<StoreState>((state) => state);
  const hotelId = user?.hotelId || "";
  const [status, setStatus] = useState<BookingStatus | " ">(" ");
  const [fromDate, setFromDate] = useState<Dayjs | null>(
    dayjs().startOf("day")
  );
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs().endOf("day"));
  const [guestName, setGuestName] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("");

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const roomTypeImgMap = React.useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const rt of roomTypes) map[rt.id] = rt.imageUrl;
    return map;
  }, [roomTypes]);

  // Modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openCallLog, setOpenCallLog] = useState(false);
  const [openRoomMap, setOpenRoomMap] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingDetailsDto | null>(null);
  const [openBookingInvoice, setOpenBookingInvoice] = useState(false);
  const [invoiceBooking, setInvoiceBooking] =
    useState<BookingDetailsDto | null>(null);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [priceDialogRt, setPriceDialogRt] = useState<BookingRoomTypeDto | null>(
    null
  );

  // Notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const fetchList = useCallback(
    async (pageToLoad?: number) => {
      setLoading(true);
      try {
        const baseQuery: BookingsQueryDto = {
          hotelId: hotelId || undefined,
          status: status === " " ? undefined : (status as BookingStatus),
          startDate: fromDate
            ? fromDate.format("YYYY-MM-DDTHH:mm:ss")
            : undefined,
          endDate: toDate ? toDate.format("YYYY-MM-DDTHH:mm:ss") : undefined,
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
        console.log("err", err);
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
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fromDate, toDate, guestName, roomNumber, hotelId]);

  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const res = await roomTypesApi.getRoomTypes({
          hotelId: hotelId || undefined,
          page: 1,
          pageSize: 100,
        });
        setRoomTypes((res as any).data || (res as any).items || []);
      } catch {}
    };
    loadRoomTypes();
  }, [hotelId]);

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
          subtitle="Tạo, chỉnh sửa, hủy, xác nhận yêu cầu và xem danh sách phòng"
        />

        {/* Top bar: hotel scope & refresh */}
        <TopBarControls
          onAddBooking={() => setOpenCreate(true)}
          onOpenRoomMap={() => setOpenRoomMap(true)}
        />
      </Stack>

      {/* Filters */}
      <FiltersBar
        status={status as any}
        onStatusChange={setStatus as any}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        guestName={guestName}
        roomNumber={roomNumber}
        onGuestNameChange={setGuestName}
        onRoomNumberChange={setRoomNumber}
        statusOptions={STATUS_OPTIONS as FiltersStatusOption[]}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <Stack spacing={2} sx={{ mt: 2 }}>
        {loading ? (
          <Loading label="Đang tải danh sách yêu cầu đặt phòng" />
        ) : (
          <>
            {(() => {
              const listData = rows;
              if (!loading && listData.length === 0) {
                return (
                  <EmptyState
                    title="Không có yêu cầu đặt phòng"
                    description="Chưa có yêu cầu đặt phòng. Hãy thêm yêu cầu mới."
                    actions={
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                      >
                        <Button
                          variant="contained"
                          onClick={() => {
                            setOpenCreate(true);
                          }}
                          startIcon={<AddCircle />}
                        >
                          Thêm yêu cầu
                        </Button>
                      </Stack>
                    }
                  />
                );
              }
              if (viewMode === "table") {
                const columns: Column<BookingDetailsDto>[] = [
                  { id: "primaryGuestName", label: "Khách", minWidth: 180 },
                  { id: "phoneNumber", label: "SĐT", minWidth: 140 },
                  {
                    id: "bookingRoomTypes",
                    label: "Tổng phòng",
                    minWidth: 120,
                    render: (row) => {
                      const totalRooms = (row.bookingRoomTypes || []).reduce(
                        (sum, rt) =>
                          sum + (rt.totalRoom || rt.bookingRooms?.length || 0),
                        0
                      );
                      return <Typography>{totalRooms}</Typography>;
                    },
                  },
                  {
                    id: "roomTypeCounts",
                    label: "Tổng phòng x loại",
                    minWidth: 240,
                    render: (row) => {
                      const items =
                        (row.bookingRoomTypes || []).map((rt) => {
                          const count =
                            rt.totalRoom || rt.bookingRooms?.length || 0;
                          const name = rt.roomTypeName || "—";
                          return `${count} x ${name}`;
                        }) || [];
                      const text = items.filter(Boolean).join(", ");
                      return (
                        <Typography color="text.secondary">
                          {text || "—"}
                        </Typography>
                      );
                    },
                  },
                  {
                    id: "status",
                    label: "Trạng thái",
                    minWidth: 140,
                    render: (row) => {
                      const statusColor =
                        row.status === 3
                          ? "success"
                          : row.status === 4
                          ? "error"
                          : row.status === 1
                          ? "primary"
                          : "default";
                      const statusLabel =
                        row.status === 0
                          ? "Chờ duyệt"
                          : row.status === 1
                          ? "Đã xác nhận"
                          : row.status === 2
                          ? "Đã hoàn thành"
                          : row.status === 3
                          ? "Đã hoàn thành"
                          : row.status === 4
                          ? "Đã hủy"
                          : String(row.status);
                      return (
                        <Chip color={statusColor as any} label={statusLabel} />
                      );
                    },
                  },
                  {
                    id: "totalAmount",
                    label: "Tổng",
                    minWidth: 140,
                    align: "right",
                    render: (row) => {
                      const isZero =
                        row.status === EBookingStatus.Cancelled ||
                        row.status === 5;
                      const v = isZero ? 0 : Number(row.totalAmount || 0);
                      return `${v.toLocaleString()} đ`;
                    },
                  },
                  {
                    id: "leftAmount",
                    label: "Còn lại",
                    minWidth: 140,
                    align: "right",
                    render: (row) => {
                      const isZero =
                        row.status === EBookingStatus.Cancelled ||
                        row.status === 5;
                      const total =
                        (row.totalAmount || 0) + (row.additionalAmount ?? 0);
                      const discountAmount =
                        ((row.promotionValue || 0) / 100) * total;
                      const leftAmount =
                        (row.leftAmount || 0) -
                        discountAmount +
                        (row.additionalAmount ?? 0);
                      return (
                        <Typography fontWeight={"bold"}>
                          {(isZero ? 0 : leftAmount).toLocaleString()} đ
                        </Typography>
                      );
                    },
                  },
                ];
                return (
                  <DataTable<BookingDetailsDto>
                    title="Danh sách yêu cầu đặt phòng"
                    columns={columns}
                    data={listData}
                    loading={loading}
                    getRowId={(row) => row.id}
                    onView={(row) => navigate(`${row.id}`)}
                    onEdit={(row) => openEditModal(row as any)}
                    renderActions={(row) => (
                      <IconButton
                        size="small"
                        color="success"
                        disabled={
                          row.status === EBookingStatus.Pending ||
                          row.status === EBookingStatus.Cancelled
                        }
                        onClick={() => {
                          const hasRooms = (row.bookingRoomTypes || []).some(
                            (rt) => (rt.bookingRooms?.length || 0) > 0
                          );
                          if (!hasRooms) {
                            toast.warning("Vui lòng thêm phòng vào đơn");

                            return;
                          }
                          setInvoiceBooking(row as any);
                          setOpenBookingInvoice(true);
                        }}
                        aria-label="print invoice"
                      >
                        <Print fontSize="small" />
                      </IconButton>
                    )}
                    pagination={{
                      page,
                      pageSize,
                      total,
                      onPageChange: (p) => {
                        setPage(p);
                        fetchList(p);
                      },
                    }}
                    borderRadius={2}
                  />
                );
              }
              return listData.map((b, idx) => {
                const totalRooms = (b.bookingRoomTypes || []).reduce(
                  (sum, rt) =>
                    sum + (rt.totalRoom || rt.bookingRooms?.length || 0),
                  0
                );

                const total = b.totalAmount + (b.additionalAmount ?? 0);
                const discountAmount = ((b.promotionValue || 0) / 100) * total;

                const leftAmount =
                  b.leftAmount - discountAmount + (b.additionalAmount ?? 0);

                const statusColor =
                  b.status === 3
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
                    ? "Đã hoàn thành"
                    : b.status === 3
                    ? "Đã hoàn thành"
                    : b.status === 4
                    ? "Đã hủy"
                    : String(b.status);
                const zeroMoney =
                  b.status === EBookingStatus.Cancelled || b.status === 5;
                return (
                  <Accordion
                    key={b.id}
                    sx={{
                      borderRadius: 2,
                      boxShadow: 2,
                      "&:not(.Mui-expanded)::before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Stack
                        direction={{ xs: "column", lg: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", lg: "center" }}
                        sx={{ width: "100%" }}
                        spacing={1}
                      >
                        <Stack
                          spacing={1}
                          direction={{ xs: "column", lg: "row" }}
                          alignItems="center"
                        >
                          <Hotel color="primary" />
                          <Typography
                            fontWeight={700}
                          >{`Yêu cầu đặt phòng: #${String(
                            idx + 1
                          ).toUpperCase()}`}</Typography>
                          <Chip
                            label={`Tổng số phòng: ${totalRooms}`}
                            size="small"
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
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={1.5}>
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
                              <Typography>
                                Họ và tên: {b.primaryGuestName || "—"}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Phone color="action" />
                              <Typography>
                                SĐT: {b.phoneNumber || "—"}
                              </Typography>
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
                              startIcon={<Info />}
                              onClick={() => navigate(`${b.id}`)}
                            >
                              Chi tiết
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<ReceiptLong />}
                              disabled={
                                b.status === EBookingStatus.Pending ||
                                b.status === EBookingStatus.Cancelled
                              }
                              onClick={() => {
                                const hasRooms = (
                                  b.bookingRoomTypes || []
                                ).some(
                                  (rt) => (rt.bookingRooms?.length || 0) > 0
                                );
                                if (!hasRooms) {
                                  setSnackbar({
                                    open: true,
                                    message: "Vui lòng thêm phòng vào đơn",
                                    severity: "error",
                                  });
                                  return;
                                }
                                setInvoiceBooking(b as any);
                                setOpenBookingInvoice(true);
                              }}
                            >
                              Xuất hóa đơn
                            </Button>
                          </Stack>
                        </Stack>
                        <Stack spacing={1.5}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Danh sách phòng
                          </Typography>
                          {b.bookingRoomTypes?.length ? (
                            b.bookingRoomTypes.map((rt) => (
                              <Stack
                                key={rt.bookingRoomTypeId}
                                spacing={1}
                                sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  border: "1px solid #eee",
                                }}
                              >
                                {(() => {
                                  const nights = Math.max(
                                    1,
                                    dayjs(rt.endDate).diff(
                                      dayjs(rt.startDate),
                                      "day"
                                    )
                                  );
                                  const rooms =
                                    rt.totalRoom ||
                                    rt.bookingRooms?.length ||
                                    0;
                                  const perNight = rt.price || 0;
                                  const subtotal = perNight * nights * rooms;
                                  return (
                                    <Stack
                                      direction={{ xs: "column", sm: "row" }}
                                      justifyContent="space-between"
                                      alignItems={{
                                        xs: "flex-start",
                                        sm: "center",
                                      }}
                                      spacing={1}
                                    >
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{ minWidth: 260 }}
                                      >
                                        <img
                                          src={
                                            roomTypeImgMap[rt.roomTypeId] ||
                                            "/assets/logo.png"
                                          }
                                          alt={rt.roomTypeName || "Loại phòng"}
                                          style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 8,
                                            objectFit: "cover",
                                            border: "1px solid #eee",
                                          }}
                                        />
                                        <Stack>
                                          <Typography fontWeight={700}>
                                            {rt.roomTypeName || "—"}
                                          </Typography>
                                          <Typography color="text.secondary">
                                            {new Date(
                                              rt.startDate
                                            ).toLocaleDateString()}{" "}
                                            -{" "}
                                            {new Date(
                                              rt.endDate
                                            ).toLocaleDateString()}{" "}
                                            ({nights} đêm)
                                          </Typography>
                                          <Typography>
                                            Số phòng: {rooms}
                                          </Typography>
                                        </Stack>
                                      </Stack>
                                      <Stack
                                        sx={{
                                          ml: "auto",
                                          minWidth: 220,
                                          textAlign: "right",
                                        }}
                                      >
                                        <Box>
                                          <Button
                                            startIcon={<RemoveRedEye />}
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                              setPriceDialogRt(rt as any);
                                              setPriceDialogOpen(true);
                                            }}
                                          >
                                            Xem giá theo ngày
                                          </Button>
                                        </Box>
                                      </Stack>
                                    </Stack>
                                  );
                                })()}
                              </Stack>
                            ))
                          ) : (
                            <Typography color="text.secondary">
                              Không có loại phòng
                            </Typography>
                          )}
                        </Stack>
                        <Stack alignItems="flex-end">
                          <Stack
                            direction={{ xs: "column", lg: "row" }}
                            spacing={3}
                            alignItems={{ xs: "flex-end", sm: "flex-end" }}
                          >
                            <Stack alignItems="flex-end">
                              <Typography color="text.secondary">
                                Tổng cộng
                              </Typography>
                              <Typography fontWeight={700}>
                                {(zeroMoney
                                  ? 0
                                  : b.totalAmount || 0
                                ).toLocaleString()}{" "}
                                đ
                              </Typography>
                            </Stack>
                            <Stack alignItems="flex-end">
                              <Typography color="text.secondary">
                                Phụ thu
                              </Typography>
                              <Typography fontWeight={700}>
                                {(zeroMoney
                                  ? 0
                                  : b.additionalAmount || 0
                                ).toLocaleString()}{" "}
                                đ
                              </Typography>
                            </Stack>
                            <Stack alignItems="flex-end">
                              <Typography color="red">Cọc</Typography>
                              <Typography color="red" fontWeight={700}>
                                {(b.depositAmount || 0).toLocaleString()} đ
                              </Typography>
                            </Stack>
                            <Stack alignItems="flex-end">
                              <Typography color="red">Giảm giá</Typography>
                              <Typography color="red" fontWeight={700}>
                                {(zeroMoney
                                  ? 0
                                  : discountAmount || 0
                                ).toLocaleString()}{" "}
                                đ
                              </Typography>
                            </Stack>
                            <Stack alignItems="flex-end">
                              <Typography color="text.secondary">
                                Còn lại
                              </Typography>
                              <Typography fontWeight={"bold"}>
                                {(zeroMoney
                                  ? 0
                                  : leftAmount || 0
                                ).toLocaleString()}{" "}
                                đ
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              });
            })()}
            {viewMode === "card" && total > pageSize && (
              <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
                <Pagination
                  count={Math.ceil(total / pageSize)}
                  page={page}
                  onChange={(_, p) => {
                    fetchList(p);
                  }}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
            {rows.length > 0 && (
              <>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  sx={{ mt: 1 }}
                >
                  {(() => {
                    const totalBookingsDisplayed = rows.length;
                    const totalRoomsDisplayed = rows.reduce((sum, b) => {
                      const rooms = (b.bookingRoomTypes || []).reduce(
                        (s, rt) =>
                          s + (rt.totalRoom || rt.bookingRooms?.length || 0),
                        0
                      );
                      return sum + rooms;
                    }, 0);
                    return (
                      <>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip
                            color="primary"
                            label={`Tổng số booking: ${totalBookingsDisplayed.toLocaleString()}`}
                          />
                          <Chip
                            color="secondary"
                            label={`Tổng số phòng: ${totalRoomsDisplayed.toLocaleString()}`}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Hiển thị theo bộ lọc hiện tại
                        </Typography>
                      </>
                    );
                  })()}
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>

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

      <PriceCalendarDialog
        open={priceDialogOpen}
        onClose={() => {
          setPriceDialogOpen(false);
          setPriceDialogRt(null);
        }}
        roomType={priceDialogRt}
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

      <BookingInvoiceDialog
        open={openBookingInvoice}
        onClose={() => setOpenBookingInvoice(false)}
        booking={invoiceBooking as any}
        onRefreshBooking={() => fetchList(page)}
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
