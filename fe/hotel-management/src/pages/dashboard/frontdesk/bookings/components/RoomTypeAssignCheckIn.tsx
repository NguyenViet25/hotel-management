import { Login, Logout } from "@mui/icons-material";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import bookingsApi, {
  BookingRoomStatus,
  type BookingDetailsDto,
  type BookingRoomDto,
  type BookingRoomTypeDto,
} from "../../../../../api/bookingsApi";
import AssignRoomDialog from "./AssignRoomDialog";
import CheckInTimeDialog from "./CheckInTimeDialog";
import CheckOutTimeDialog from "./CheckOutTimeDialog";
import GuestDialog from "./GuestDialog";
import GuestList from "./GuestList";
import StripedLabelWrapper from "../../../../../components/LabelStripedWrapper";
import { formatDateTime } from "../../../../../utils/date-helper";

type Props = {
  booking: BookingDetailsDto | null;
  onRefresh?: () => Promise<void> | void;
};

type GuestForm = {
  name: string;
  phone: string;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
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
  const [assignOpen, setAssignOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({ open: false, message: "", severity: "success" });

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

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, minWidth: 320 }}>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            {rt.roomTypeName || "Loại phòng"}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={2} justifyContent={"space-between"}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`Cần gán: ${rt.totalRoom || 0}`}
                size="small"
                color="primary"
              />
              <Chip
                label={`Đã gán: ${assignedRooms.length}`}
                size="small"
                color="secondary"
              />
              <Chip
                label={`Sức chứa/Phòng: ${rt.capacity || 0}`}
                size="small"
              />
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setAssignOpen(true)}
                disabled={remaining === 0}
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
              {assignedRooms.map((br) => (
                <Grid size={{ xs: 12, md: 4 }} key={br.bookingRoomId}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardHeader
                      title={`Phòng ${br.roomName ?? ""}`}
                      subheader={
                        <Stack spacing={2} mt={1}>
                          <StripedLabelWrapper label="Trạng thái">
                            <Stack direction={"row"} spacing={1}>
                              <Chip
                                variant="filled"
                                label={
                                  br.bookingStatus ===
                                  BookingRoomStatus.CheckedIn
                                    ? "Đã check-in"
                                    : "Chưa check-in"
                                }
                                size="small"
                                color={
                                  br.bookingStatus ===
                                  BookingRoomStatus.CheckedIn
                                    ? "success"
                                    : "error"
                                }
                              />
                              <Chip
                                variant="filled"
                                label={
                                  br.bookingStatus ===
                                  BookingRoomStatus.CheckedOut
                                    ? "Đã check-out"
                                    : "Chưa check-out"
                                }
                                size="small"
                                color={
                                  br.bookingStatus ===
                                  BookingRoomStatus.CheckedOut
                                    ? "success"
                                    : "error"
                                }
                              />
                            </Stack>
                          </StripedLabelWrapper>
                          <StripedLabelWrapper label="Thời gian dự kiến">
                            <Stack direction={"row"} spacing={1}>
                              <Chip
                                label={`Nhận: ${
                                  br.startDate
                                    ? formatDateTime(br.startDate)
                                    : "—"
                                }`}
                                size="small"
                              />
                              <Chip
                                label={`Trả: ${
                                  br.endDate ? formatDateTime(br.endDate) : "—"
                                }`}
                                size="small"
                              />{" "}
                            </Stack>
                          </StripedLabelWrapper>
                          <StripedLabelWrapper label="Thời gian thực tế">
                            <Stack direction={"row"} spacing={1}>
                              <Chip
                                label={`Nhận: ${
                                  br.startDate
                                    ? formatDateTime(br.startDate)
                                    : "—"
                                }`}
                                size="small"
                              />
                              <Chip
                                label={`Trả: ${formatDateTime(br.endDate)}`}
                                size="small"
                              />{" "}
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
                          guests={(br.guests || []).map((g) => ({
                            id: g.guestId,
                            fullname: g.fullname,
                            phone: g.phone,
                            email: g.email,
                            idCardFrontImageUrl: g.idCardFrontImageUrl,
                            idCardBackImageUrl: g.idCardBackImageUrl,
                          }))}
                          editable={true}
                          onEdit={(idx, gi) =>
                            openEditGuest(br.bookingRoomId, idx, {
                              ...gi,
                              name: gi.fullname || "",
                            })
                          }
                          onDelete={async (_idx, gi) => {
                            try {
                              const res = await bookingsApi.removeGuestFromRoom(
                                br.bookingRoomId,
                                gi.id!
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
                        />

                        <Stack
                          direction={{ xs: "column", md: "row" }}
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
                            // disabled={
                            //   ((forms[br.bookingRoomId] || []).length + (br.guests || []).length) >=
                            //   (rt.capacity || 0)
                            // }
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
                            // disabled={
                            //   ((forms[br.bookingRoomId] || []).length + (br.guests || []).length) >=
                            //   (rt.capacity || 0)
                            // }
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
          onClose={() => setCheckOutOpen(false)}
          onConfirm={async (iso, info) => {
            try {
              const res = await bookingsApi.checkOut(booking.id, {
                lateCheckOut: info.isLate,
                checkoutTime: iso,
              } as any);
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
