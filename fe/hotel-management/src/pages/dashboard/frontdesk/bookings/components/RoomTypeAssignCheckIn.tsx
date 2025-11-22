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
  type BookingDetailsDto,
  type BookingRoomDto,
  type BookingRoomTypeDto,
} from "../../../../../api/bookingsApi";
import AssignRoomDialog from "./AssignRoomDialog";
import GuestDialog from "./GuestDialog";
import GuestList from "./GuestList";
import {
  Check,
  DockRounded,
  DoorBack,
  DoorSliding,
  Login,
  Logout,
  OfflinePin,
} from "@mui/icons-material";

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

  const openAddGuest = (roomId: string) => {
    setGuestRoomId(roomId);
    setGuestInitial({ name: "", phone: "" });
    setGuestEditIndex(null);
    setGuestOpen(true);
  };

  const openEditGuest = (roomId: string, idx: number) => {
    setGuestRoomId(roomId);
    setGuestEditIndex(idx);
    setGuestOpen(true);
  };

  const submitCheckIn = async (g: GuestForm) => {
    try {
      const persons = [g];
      console.log("persons", persons);
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
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`Nhận: ${
                              br.startDate
                                ? new Date(br.startDate).toLocaleDateString()
                                : "—"
                            }`}
                            size="small"
                          />
                          <Chip
                            label={`Trả: ${
                              br.endDate
                                ? new Date(br.endDate).toLocaleDateString()
                                : "—"
                            }`}
                            size="small"
                          />
                        </Stack>
                      }
                    />
                    <CardContent>
                      <Stack spacing={1.5}>
                        {(br.guests || []).length > 0 ? (
                          <GuestList
                            title="Khách hiện tại"
                            guests={(br.guests || []).map((g) => ({
                              id: g.guestId,
                              fullname: g.fullname,
                              phone: g.phone,
                              email: g.email,
                            }))}
                            // editable={false}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa có khách nào trong phòng này.
                          </Typography>
                        )}

                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={1}
                        >
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Login />}
                            onClick={() => openAddGuest(br.bookingRoomId)}
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
                            onClick={() => openAddGuest(br.bookingRoomId)}
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
