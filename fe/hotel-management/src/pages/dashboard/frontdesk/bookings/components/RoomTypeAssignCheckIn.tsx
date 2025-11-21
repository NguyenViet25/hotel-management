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
import React, { useEffect, useState } from "react";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingRoomDto,
  type BookingRoomTypeDto,
} from "../../../../../api/bookingsApi";
import AssignRoomDialog from "./AssignRoomDialog";
import GuestList from "./GuestList";
import GuestDialog from "./GuestDialog";

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
  const [forms, setForms] = useState<Record<string, GuestForm[]>>({});
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestInitial, setGuestInitial] = useState<GuestForm | null>(null);
  const [guestEditIndex, setGuestEditIndex] = useState<number | null>(null);
  const [guestRoomId, setGuestRoomId] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, GuestForm[]> = {};
    assignedRooms.forEach((br) => {
      const existing = forms[br.bookingRoomId] || [];
      next[br.bookingRoomId] = existing;
    });
    setForms(() => ({ ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rt.bookingRooms?.length]);

  const updateGuest = (
    roomId: string,
    idx: number,
    patch: Partial<GuestForm>
  ) => {
    setForms((prev) => {
      const arr = prev[roomId] || [];
      return {
        ...prev,
        [roomId]: arr.map((g, i) => (i === idx ? { ...g, ...patch } : g)),
      };
    });
  };

  const getAssignedRoom = (roomId: string) =>
    assignedRooms.find((r) => r.bookingRoomId === roomId);

  const addGuest = (roomId: string) => {
    const assigned = getAssignedRoom(roomId);
    const existingCount = (assigned?.guests || []).length;
    setForms((prev) => {
      const arr = prev[roomId] || [];
      if (existingCount + arr.length >= (rt.capacity || 0)) return prev;
      return { ...prev, [roomId]: [...arr, { name: "", phone: "" }] };
    });
  };

  const removeGuest = (roomId: string, idx: number) => {
    setForms((prev) => {
      const arr = prev[roomId] || [];
      const next = arr.filter((_, i) => i !== idx);
      return { ...prev, [roomId]: next };
    });
  };

  const openAddGuest = (roomId: string) => {
    setGuestRoomId(roomId);
    setGuestInitial({ name: "", phone: "" });
    setGuestEditIndex(null);
    setGuestOpen(true);
  };

  const openEditGuest = (roomId: string, idx: number) => {
    const arr = forms[roomId] || [];
    const current = arr[idx];
    setGuestRoomId(roomId);
    setGuestInitial(current || { name: "", phone: "" });
    setGuestEditIndex(idx);
    setGuestOpen(true);
  };

  const handleGuestSubmit = (g: GuestForm) => {
    if (!guestRoomId) return;
    const assigned = getAssignedRoom(guestRoomId);
    const existingCount = (assigned?.guests || []).length;
    if (guestEditIndex === null) {
      setForms((prev) => {
        const arr = prev[guestRoomId] || [];
        if (existingCount + arr.length >= (rt.capacity || 0)) return prev;
        return { ...prev, [guestRoomId]: [...arr, g] };
      });
    } else {
      updateGuest(guestRoomId, guestEditIndex, g);
    }
    setGuestOpen(false);
  };

  const submitCheckIn = async (roomId: string) => {
    try {
      const persons = (forms[roomId] || []).map((g) => ({
        name: g.name,
        phone: g.phone,
        idCardFrontImageUrl: g.idCardFrontImageUrl || "",
        idCardBackImageUrl: g.idCardBackImageUrl || "",
      }));
      const res = await bookingsApi.checkIn(booking.id, {
        roomBookingId: roomId,
        persons,
      } as any);
      if (res.isSuccess) {
        setSnackbar({
          open: true,
          message: "Check-in thành công",
          severity: "success",
        });
        setForms((prev) => ({ ...prev, [roomId]: [] }));
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

  const canCheckIn = (roomId: string) => {
    const arr = forms[roomId] || [];
    if (!arr.length) return false;
    return arr.every(
      (g) =>
        (g.name || "").trim().length > 0 && (g.phone || "").trim().length > 0
    );
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
              <Chip label={`Còn lại: ${remaining}`} size="small" />
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
                <Grid item xs={12} md={6} key={br.bookingRoomId}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardHeader
                      title={`Phòng ${br.roomName ?? ""}`}
                      subheader={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`Sức chứa: ${rt.capacity || 0}`}
                            size="small"
                          />
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
                        {(br.guests || []).length > 0 && (
                          <GuestList
                            title="Khách hiện tại"
                            guests={(br.guests || []).map((g) => ({
                              id: g.guestId,
                              fullname: g.fullname,
                              phone: g.phone,
                              email: g.email,
                            }))}
                            editable={false}
                          />
                        )}

                        <Stack spacing={1}>
                          <GuestList
                            title="Danh sách khách"
                            guests={(forms[br.bookingRoomId] || []).map(
                              (g) => ({ name: g.name, phone: g.phone })
                            )}
                            editable
                            onEdit={(idx) =>
                              openEditGuest(br.bookingRoomId, idx)
                            }
                            onDelete={(idx) =>
                              removeGuest(br.bookingRoomId, idx)
                            }
                          />
                          <Button
                            variant="outlined"
                            onClick={() => openAddGuest(br.bookingRoomId)}
                            // disabled={
                            //   ((forms[br.bookingRoomId] || []).length + (br.guests || []).length) >=
                            //   (rt.capacity || 0)
                            // }
                          >
                            Thêm Khách
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
            onSubmit={handleGuestSubmit}
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
