import {
  CalendarMonth,
  Check,
  Close,
  Edit,
  Login,
  Logout,
  MoveUp,
  People,
  Warning,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import bookingsApi, {
  EBookingStatus,
  type BookingDetailsDto,
  type BookingGuestDto,
  type BookingRoomDto,
  type BookingRoomTypeDto,
} from "../../../../../api/bookingsApi";
import hotelService from "../../../../../api/hotelService";
import StripedLabelWrapper from "../../../../../components/LabelStripedWrapper";
import { useStore, type StoreState } from "../../../../../hooks/useStore";
import {
  formatDate,
  formatDateTime,
  formatTime,
} from "../../../../../utils/date-helper";
import AssignRoomDialog from "./AssignRoomDialog";
import ChangeRoomDialog from "./ChangeRoomDialog";
import CheckInTimeDialog from "./CheckInTimeDialog";
import CheckOutTimeDialog from "./CheckOutTimeDialog";
import ExtendStayDialog from "./ExtendStayDialog";
import GuestDialog from "./GuestDialog";
import GuestList from "./GuestList";
import MoveGuestDialog from "./MoveGuestDialog";
import PlannedDatesDialog from "./PlannedDatesDialog";

type Props = {
  booking: BookingDetailsDto | null;
  onRefresh?: () => Promise<void> | void;
};

type GuestForm = {
  name: string;
  phone: string;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
  idCard?: string;
};

const RoomTypeAssignCheckIn: React.FC<Props> = ({ booking, onRefresh }) => {
  if (!booking) return null;
  const rtList = booking.bookingRoomTypes || [];
  return (
    <Stack spacing={2}>
      {rtList.map((rt) => (
        <RoomTypeBlock
          key={rt.bookingRoomTypeId}
          booking={booking}
          rt={rt}
          onRefresh={onRefresh}
        />
      ))}
    </Stack>
  );
};

const RoomTypeBlock: React.FC<{
  booking: BookingDetailsDto;
  rt: BookingRoomTypeDto;
  onRefresh?: () => Promise<void> | void;
}> = ({ booking, rt, onRefresh }) => {
  const { hotelId } = useStore<StoreState>((s) => s);

  const [assignOpen, setAssignOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({ open: false, message: "", severity: "success" });
  const [checkIn, setCheckIn] = useState<string | null | undefined>(null);
  const [checkOut, setCheckOut] = useState<string | null | undefined>(null);

  const assignedRooms: BookingRoomDto[] = rt.bookingRooms || [];
  const remaining = Math.max(0, (rt.totalRoom || 0) - assignedRooms.length);

  // Check-in state per assigned room
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestInitial, setGuestInitial] = useState<GuestForm | null>(null);
  const [guestEditIndex, setGuestEditIndex] = useState<number | null>(null);
  const [guestRoomId, setGuestRoomId] = useState<string | null>(null);
  const [updatingGuestId, setUpdatingGuestId] = useState<string | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<BookingRoomDto | null>(null);
  const [plannedOpen, setPlannedOpen] = useState(false);
  const [editActualInOpen, setEditActualInOpen] = useState(false);
  const [editActualOutOpen, setEditActualOutOpen] = useState(false);
  const [changeRoomOpen, setChangeRoomOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [moveGuestOpen, setMoveGuestOpen] = useState(false);
  const [movingGuest, setMovingGuest] = useState<BookingGuestDto | null>(null);
  const [movingFromRoomId, setMovingFromRoomId] = useState<string | null>(null);

  const openAddGuest = (roomId: string) => {
    setGuestRoomId(roomId);
    setGuestInitial({ name: "", phone: "" });
    setGuestEditIndex(null);
    setGuestOpen(true);
  };

  const openEditGuest = (
    roomId: string,
    idx: number,
    initial?: GuestForm & { id?: string }
  ) => {
    setGuestRoomId(roomId);
    setGuestEditIndex(idx);
    setUpdatingGuestId(initial?.id || null);
    setGuestInitial(
      initial
        ? {
            name: initial.name,
            phone: initial.phone,
            idCardFrontImageUrl: initial.idCardFrontImageUrl,
            idCardBackImageUrl: initial.idCardBackImageUrl,
            idCard: initial.idCard,
          }
        : null
    );
    setGuestOpen(true);
  };

  const submitCheckIn = async (g: GuestForm) => {
    try {
      if (guestEditIndex !== null && updatingGuestId && guestRoomId) {
        const res = await bookingsApi.updateGuestInRoom(
          guestRoomId,
          updatingGuestId,
          {
            fullname: g.name,
            phone: g.phone,
            idCardFrontImageUrl: g.idCardFrontImageUrl,
            idCardBackImageUrl: g.idCardBackImageUrl,
            idCard: g.idCard,
          }
        );
        if (res.isSuccess) {
          setSnackbar({
            open: true,
            message: "Cập nhật khách thành công",
            severity: "success",
          });
          setGuestOpen(false);
          setUpdatingGuestId(null);
          setGuestEditIndex(null);
          await onRefresh?.();
        } else {
          setSnackbar({
            open: true,
            message: res.message || "Không thể cập nhật khách",
            severity: "error",
          });
        }
      } else {
        const persons = [g];
        const res = await bookingsApi.checkIn(booking.id, {
          roomBookingId: guestRoomId,
          persons,
        } as any);
        if (res.isSuccess) {
          setSnackbar({
            open: true,
            message: "Check-in thành công",
            severity: "success",
          });
          setGuestOpen(false);
          await onRefresh?.();
        } else {
          setSnackbar({
            open: true,
            message: res.message || "Không thể check-in",
            severity: "error",
          });
        }
      }
    } catch {
      setSnackbar({
        open: true,
        message:
          guestEditIndex !== null
            ? "Đã xảy ra lỗi khi cập nhật khách"
            : "Đã xảy ra lỗi khi check-in",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!hotelId) return;
      try {
        const [timesRes, vatRes] = await Promise.all([
          hotelService.getDefaultTimes(hotelId),
          hotelService.getVat(hotelId),
        ]);
        if (timesRes.isSuccess) {
          const ci = timesRes.data.defaultCheckInTime;
          const co = timesRes.data.defaultCheckOutTime;
          setCheckIn(ci);
          setCheckOut(co);
        } else {
          setSnackbar({
            open: true,
            message: timesRes.message || "Không thể tải cài đặt",
            severity: "error",
          });
        }
      } catch {
        setSnackbar({
          open: true,
          message: "Không thể tải cài đặt",
          severity: "error",
        });
      } finally {
      }
    };
    run();
  }, [hotelId]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, minWidth: 320 }}>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            {rt.roomTypeName || "Loại phòng"}
          </Typography>
        }
        subheader={
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent={"space-between"}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`Cần gán: ${rt.totalRoom - assignedRooms.length || 0}`}
                size="small"
                icon={<Warning />}
                color="warning"
              />
              <Chip
                label={`Đã gán: ${assignedRooms.length}`}
                size="small"
                icon={<Check />}
                color="success"
              />
              <Chip
                label={`Sức chứa: ${rt.capacity || 0}`}
                size="small"
                icon={<People />}
              />
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setAssignOpen(true)}
                disabled={
                  remaining === 0 || booking.status !== EBookingStatus.Confirmed
                }
              >
                Chọn phòng
              </Button>
            </Stack>
          </Stack>
        }
      />
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" fontWeight={700}>
            Check-in theo phòng
          </Typography>
          {!assignedRooms.length ? (
            <Typography variant="body2" color="text.secondary">
              Chưa có phòng được gán cho loại này. Vui lòng gán phòng để hiển
              thị form check-in.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {assignedRooms.map((br: BookingRoomDto) => (
                <Grid size={{ xs: 12, lg: 4 }} key={br.bookingRoomId}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardHeader
                      title={
                        <Stack
                          direction={"row"}
                          justifyContent={"space-between"}
                        >
                          <Typography>Phòng {br.roomName ?? ""}</Typography>
                          <Tooltip title="Đổi cả phòng">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setActiveRoom(br);
                                  setChangeRoomOpen(true);
                                }}
                                aria-label="Đổi cả phòng"
                              >
                                <MoveUp fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      }
                      subheader={
                        <Stack spacing={2} mt={1}>
                          <StripedLabelWrapper label="Trạng thái">
                            <Stack direction={"row"} spacing={1}>
                              <Chip
                                variant="filled"
                                label={
                                  br.actualCheckInAt !== undefined &&
                                  br.actualCheckInAt !== null
                                    ? "Đã check-in"
                                    : "Chưa check-in"
                                }
                                icon={
                                  br.actualCheckInAt !== undefined &&
                                  br.actualCheckInAt !== null ? (
                                    <Check />
                                  ) : (
                                    <Close />
                                  )
                                }
                                size="small"
                                color={
                                  br.actualCheckInAt !== undefined &&
                                  br.actualCheckInAt !== null
                                    ? "success"
                                    : "error"
                                }
                              />
                              <Chip
                                variant="filled"
                                label={
                                  br.actualCheckOutAt !== undefined &&
                                  br.actualCheckOutAt !== null
                                    ? "Đã check-out"
                                    : "Chưa check-out"
                                }
                                size="small"
                                icon={
                                  br.actualCheckOutAt !== undefined &&
                                  br.actualCheckOutAt !== null ? (
                                    <Check />
                                  ) : (
                                    <Close />
                                  )
                                }
                                color={
                                  br.actualCheckOutAt !== undefined &&
                                  br.actualCheckOutAt !== null
                                    ? "success"
                                    : "error"
                                }
                              />
                            </Stack>
                          </StripedLabelWrapper>
                          <StripedLabelWrapper label="Thời gian dự kiến">
                            <Stack direction={"row"} spacing={1}>
                              <Stack spacing={1} sx={{ width: "100%" }}>
                                <Chip
                                  label={`Nhận: ${
                                    br.startDate
                                      ? formatDate(br.startDate)
                                      : "—"
                                  } ${checkIn ? formatTime(checkIn) : "-"}`}
                                  size="small"
                                  sx={{
                                    width: "100%",
                                    justifyContent: "flex-start", // <-- The key
                                    "& .MuiChip-label": {
                                      pl: 2, // remove default padding
                                      textAlign: "left",
                                      width: "100%",
                                    },
                                  }}
                                />
                                <Chip
                                  label={`Trả: ${
                                    br.endDate ? formatDate(br.endDate) : "—"
                                  } ${checkOut ? formatTime(checkOut) : "-"}`}
                                  size="small"
                                  sx={{
                                    width: "100%",
                                    justifyContent: "flex-start", // <-- The key
                                    "& .MuiChip-label": {
                                      pl: 2, // remove default padding
                                      textAlign: "left",
                                      width: "100%",
                                    },
                                  }}
                                />{" "}
                              </Stack>
                            </Stack>
                            <Button
                              startIcon={<CalendarMonth />}
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={() => {
                                setActiveRoom(br);
                                setExtendOpen(true);
                              }}
                            >
                              Gia hạn thêm
                            </Button>
                            {((br as any).extendedDate ||
                              (rt.endDate &&
                                br.endDate &&
                                new Date(br.endDate) >
                                  new Date(rt.endDate))) && (
                              <Chip
                                label={`Gia hạn đến: ${
                                  br.extendedDate
                                    ? formatDate(br.extendedDate)
                                    : "—"
                                } ${checkOut ? formatTime(checkOut) : "-"}`}
                                size="small"
                                color="warning"
                                sx={{
                                  width: "100%",
                                  justifyContent: "flex-start",
                                  "& .MuiChip-label": {
                                    pl: 2,
                                    textAlign: "left",
                                    width: "100%",
                                  },
                                }}
                              />
                            )}
                          </StripedLabelWrapper>
                          <StripedLabelWrapper label="Thời gian thực tế">
                            <Stack spacing={1} justifyContent={"start"}>
                              <Stack
                                direction={"row"}
                                spacing={1}
                                justifyItems={"center"}
                              >
                                <Chip
                                  label={`Nhận: ${
                                    br.actualCheckInAt
                                      ? formatDateTime(br.actualCheckInAt)
                                      : "—"
                                  }`}
                                  size="small"
                                  sx={{
                                    width: "100%",
                                    justifyContent: "flex-start", // <-- The key
                                    "& .MuiChip-label": {
                                      pl: 2, // remove default padding
                                      textAlign: "left",
                                      width: "100%",
                                    },
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setActiveRoom(br);
                                    setEditActualInOpen(true);
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Stack>
                              <Stack
                                direction={"row"}
                                spacing={1}
                                justifyItems={"center"}
                              >
                                <Chip
                                  label={`Trả: ${
                                    br.actualCheckOutAt
                                      ? formatDateTime(br.actualCheckOutAt)
                                      : "—"
                                  }`}
                                  size="small"
                                  sx={{
                                    width: "100%",
                                    justifyContent: "flex-start",
                                    "& .MuiChip-label": {
                                      pl: 2,
                                      textAlign: "left",
                                      width: "100%",
                                    },
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setActiveRoom(br);
                                    setEditActualOutOpen(true);
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </StripedLabelWrapper>
                        </Stack>
                      }
                    />
                    <CardContent>
                      <Stack spacing={1.5}>
                        <GuestList
                          onAddGuestClick={() => openAddGuest(br.bookingRoomId)}
                          title="Danh sách khách"
                          guests={br.guests || []}
                          editable={true}
                          onEdit={(idx, gi) =>
                            openEditGuest(br.bookingRoomId, idx, {
                              ...gi,
                              id: gi.guestId || "",
                              name: gi.fullname || "",
                              idCard: gi.idCard || "",
                            } as any)
                          }
                          onDelete={async (_idx, gi) => {
                            try {
                              const res = await bookingsApi.removeGuestFromRoom(
                                br.bookingRoomId,
                                gi.guestId!
                              );
                              if (res.isSuccess) {
                                setSnackbar({
                                  open: true,
                                  message: "Xoá khách khỏi phòng thành công",
                                  severity: "success",
                                });
                                await onRefresh?.();
                              } else {
                                setSnackbar({
                                  open: true,
                                  message: res.message || "Không thể xoá khách",
                                  severity: "error",
                                });
                              }
                            } catch {
                              setSnackbar({
                                open: true,
                                message: "Đã xảy ra lỗi khi xoá khách",
                                severity: "error",
                              });
                            }
                          }}
                          onChangeRoom={(gi) => {
                            setActiveRoom(br);
                            setMovingGuest(gi);
                            setMovingFromRoomId(br.bookingRoomId);
                            setMoveGuestOpen(true);
                          }}
                          onExtendStay={() => {
                            setActiveRoom(br);
                            setExtendOpen(true);
                          }}
                        />

                        <Stack
                          direction={{ xs: "column", lg: "row" }}
                          spacing={1}
                        >
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Login />}
                            onClick={() => {
                              setActiveRoom(br);
                              setCheckInOpen(true);
                            }}
                            disabled={
                              br.actualCheckInAt !== undefined &&
                              br.actualCheckInAt !== null
                            }
                          >
                            Check in
                          </Button>
                          <Button
                            fullWidth
                            startIcon={<Logout />}
                            variant="contained"
                            color="success"
                            onClick={() => {
                              setActiveRoom(br);
                              setCheckOutOpen(true);
                            }}
                            disabled={
                              !br.actualCheckInAt ||
                              br.actualCheckInAt === null ||
                              br.actualCheckInAt === undefined ||
                              (br.actualCheckOutAt !== undefined &&
                                br.actualCheckOutAt !== null)
                            }
                          >
                            Check out
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          <GuestDialog
            open={guestOpen}
            initial={guestInitial || undefined}
            onClose={() => setGuestOpen(false)}
            onSubmit={submitCheckIn}
          />
        </Stack>
        <AssignRoomDialog
          open={assignOpen}
          booking={booking}
          roomType={rt}
          onClose={() => setAssignOpen(false)}
          onAssigned={async () => {
            setSnackbar({
              open: true,
              message: "Gán phòng thành công",
              severity: "success",
            });
            setAssignOpen(false);
            await onRefresh?.();
          }}
        />
        <CheckInTimeDialog
          open={checkInOpen}
          scheduledStart={activeRoom?.startDate || ""}
          scheduledEnd={activeRoom?.endDate || undefined}
          defaultCheckInTime={checkIn ?? undefined}
          defaultCheckOutTime={checkOut ?? undefined}
          onClose={() => setCheckInOpen(false)}
          onConfirm={async (iso, info) => {
            try {
              const res = await bookingsApi.checkIn(booking.id, {
                roomBookingId: activeRoom?.bookingRoomId,
                persons: [],
                actualCheckInAt: iso,
              } as any);
              if (res.isSuccess) {
                setSnackbar({
                  open: true,
                  message: info.isEarly
                    ? `Check-in early ${info.days}d ${info.hours}h ${info.minutes}m`
                    : "Check-in thành công",
                  severity: "success",
                });
                setCheckInOpen(false);
                await onRefresh?.();
              } else {
                setSnackbar({
                  open: true,
                  message: res.message || "Không thể check-in",
                  severity: "error",
                });
              }
            } catch {
              setSnackbar({
                open: true,
                message: "Đã xảy ra lỗi khi check-in",
                severity: "error",
              });
            }
          }}
        />
        <CheckOutTimeDialog
          open={checkOutOpen}
          scheduledEnd={activeRoom?.endDate || ""}
          scheduledStart={activeRoom?.startDate || undefined}
          defaultCheckInTime={checkIn ?? undefined}
          defaultCheckOutTime={checkOut ?? undefined}
          extendedDate={activeRoom?.extendedDate}
          onClose={() => setCheckOutOpen(false)}
          onConfirm={async (iso, info) => {
            try {
              const res = await bookingsApi.updateRoomActualTimes(
                activeRoom!.bookingRoomId,
                { actualCheckOutAt: iso }
              );
              if (res.isSuccess) {
                setSnackbar({
                  open: true,
                  message: info.isLate
                    ? `Late check-out ${info.days}d ${info.hours}h ${info.minutes}m`
                    : "Check-out thành công",
                  severity: "success",
                });
                setCheckOutOpen(false);
                await onRefresh?.();
              } else {
                setSnackbar({
                  open: true,
                  message: res.message || "Không thể check-out",
                  severity: "error",
                });
              }
            } catch {
              setSnackbar({
                open: true,
                message: "Đã xảy ra lỗi khi check-out",
                severity: "error",
              });
            }
          }}
        />
        <ChangeRoomDialog
          open={changeRoomOpen}
          booking={booking}
          roomType={rt}
          bookingRoom={activeRoom as any}
          onClose={() => setChangeRoomOpen(false)}
          onConfirm={async (roomId) => {
            try {
              const res = await bookingsApi.changeRoom(
                activeRoom!.bookingRoomId,
                { newRoomId: roomId }
              );
              if (res.isSuccess) {
                setSnackbar({
                  open: true,
                  message: "Đổi phòng thành công",
                  severity: "success",
                });
                setChangeRoomOpen(false);
                await onRefresh?.();
              } else {
                setSnackbar({
                  open: true,
                  message: res.message || "Không thể đổi phòng",
                  severity: "error",
                });
              }
            } catch {
              setSnackbar({
                open: true,
                message: "Đã xảy ra lỗi khi đổi phòng",
                severity: "error",
              });
            }
          }}
        />
        <ExtendStayDialog
          open={extendOpen}
          currentEnd={activeRoom?.endDate || rt.endDate}
          onClose={() => setExtendOpen(false)}
          onConfirm={async (newEndIso) => {
            try {
              const res = await bookingsApi.extendStay(
                activeRoom!.bookingRoomId,
                { newEndDate: newEndIso }
              );
              if (res.isSuccess) {
                const price = (res as any)?.data?.price ?? undefined;
                setSnackbar({
                  open: true,
                  message: price
                    ? `Gia hạn thành công (+${
                        price?.toLocaleString?.() || price
                      }đ)`
                    : "Gia hạn thành công",
                  severity: "success",
                });
                setExtendOpen(false);
                await onRefresh?.();
              } else {
                setSnackbar({
                  open: true,
                  message: res.message || "Không thể gia hạn",
                  severity: "error",
                });
              }
            } catch {
              setSnackbar({
                open: true,
                message: "Đã xảy ra lỗi khi gia hạn",
                severity: "error",
              });
            }
          }}
        />
        <PlannedDatesDialog
          open={plannedOpen}
          initialStart={activeRoom?.startDate || rt.startDate}
          initialEnd={activeRoom?.endDate || rt.endDate}
          minStart={rt.startDate}
          maxEnd={rt.endDate}
          onClose={() => setPlannedOpen(false)}
          onConfirm={async (startIso, endIso) => {
            try {
              const res = await bookingsApi.updateRoomDates(
                activeRoom!.bookingRoomId,
                { startDate: startIso, endDate: endIso }
              );
              if (res.isSuccess) {
                setSnackbar({
                  open: true,
                  message: "Cập nhật thời gian dự kiến thành công",
                  severity: "success",
                });
                setPlannedOpen(false);
                await onRefresh?.();
              } else {
                setSnackbar({
                  open: true,
                  message: res.message || "Không thể cập nhật thời gian",
                  severity: "error",
                });
              }
            } catch {
              setSnackbar({
                open: true,
                message: "Đã xảy ra lỗi khi cập nhật thời gian",
                severity: "error",
              });
            }
          }}
        />
        <CheckInTimeDialog
          open={editActualInOpen}
          scheduledStart={activeRoom?.startDate || ""}
          scheduledEnd={activeRoom?.endDate || undefined}
          onClose={() => setEditActualInOpen(false)}
          onConfirm={async (iso, info) => {
            try {
              const res = await bookingsApi.updateRoomActualTimes(
                activeRoom!.bookingRoomId,
                { actualCheckInAt: iso }
              );
              if (res.isSuccess) {
                setSnackbar({
                  open: true,
                  message: info.isEarly
                    ? `Check-in early ${info.days}d ${info.hours}h ${info.minutes}m`
                    : "Cập nhật Check-in thành công",
                  severity: "success",
                });
                setEditActualInOpen(false);
                await onRefresh?.();
              } else {
                setSnackbar({
                  open: true,
                  message: res.message || "Không thể cập nhật check-in",
                  severity: "error",
                });
              }
            } catch {
              setSnackbar({
                open: true,
                message: "Đã xảy ra lỗi khi cập nhật check-in",
                severity: "error",
              });
            }
          }}
        />
        <MoveGuestDialog
          open={moveGuestOpen}
          booking={booking}
          fromRoomId={movingFromRoomId || ""}
          guest={movingGuest as any}
          roomType={rt}
          onClose={() => setMoveGuestOpen(false)}
          onConfirm={async (targetBookingRoomId, targetGuestId) => {
            try {
              const res = await bookingsApi.swapGuests(
                movingFromRoomId!,
                movingGuest!.guestId,
                { targetBookingRoomId, targetGuestId } as any
              );
              if (res.isSuccess) {
                setSnackbar({
                  open: true,
                  message: "Hoán đổi khách thành công",
                  severity: "success",
                });
                setMoveGuestOpen(false);
                setMovingGuest(null);
                setMovingFromRoomId(null);
                await onRefresh?.();
              } else {
                setSnackbar({
                  open: true,
                  message: res.message || "Không thể hoán đổi khách",
                  severity: "error",
                });
              }
            } catch {
              setSnackbar({
                open: true,
                message: "Đã xảy ra lỗi khi hoán đổi khách",
                severity: "error",
              });
            }
          }}
        />

        <CheckOutTimeDialog
          open={editActualOutOpen}
          scheduledEnd={activeRoom?.endDate || ""}
          scheduledStart={activeRoom?.startDate || undefined}
          onClose={() => setEditActualOutOpen(false)}
          onConfirm={async (iso, info) => {
            try {
              const res = await bookingsApi.updateRoomActualTimes(
                activeRoom!.bookingRoomId,
                { actualCheckOutAt: iso }
              );
              if (res.isSuccess) {
                setSnackbar({
                  open: true,
                  message: info.isLate
                    ? `Late check-out ${info.days}d ${info.hours}h ${info.minutes}m`
                    : "Cập nhật Check-out thành công",
                  severity: "success",
                });
                setEditActualOutOpen(false);
                await onRefresh?.();
              } else {
                setSnackbar({
                  open: true,
                  message: res.message || "Không thể cập nhật check-out",
                  severity: "error",
                });
              }
            } catch {
              setSnackbar({
                open: true,
                message: "Đã xảy ra lỗi khi cập nhật check-out",
                severity: "error",
              });
            }
          }}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default RoomTypeAssignCheckIn;
