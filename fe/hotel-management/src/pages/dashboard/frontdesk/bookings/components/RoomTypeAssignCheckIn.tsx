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
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingRoomDto,
  type BookingRoomTypeDto,
} from "../../../../../api/bookingsApi";
import AssignRoomDialog from "./AssignRoomDialog";
import UploadCCCD from "./UploadCCCD";

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
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} flexWrap="wrap">
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

  useEffect(() => {
    // initialize forms for each assigned room up to capacity
    const next: Record<string, GuestForm[]> = {};
    assignedRooms.forEach((br) => {
      const existing = forms[br.bookingRoomId] || [];
      if (existing.length) {
        next[br.bookingRoomId] = existing;
      } else {
        const cap = rt.capacity || 0;
        const base: GuestForm[] = (br.guests || []).map((g) => ({
          name: g.fullname || "",
          phone: g.phone || "",
        }));
        if (cap > 0) {
          while (base.length < cap) base.push({ name: "", phone: "" });
        }
        next[br.bookingRoomId] = base.length ? base : [{ name: "", phone: "" }];
      }
    });
    setForms((prev) => ({ ...prev, ...next }));
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

  const addGuest = (roomId: string) => {
    setForms((prev) => {
      const arr = prev[roomId] || [];
      if (arr.length >= (rt.capacity || 0)) return prev;
      return { ...prev, [roomId]: [...arr, { name: "", phone: "" }] };
    });
  };

  const removeGuest = (roomId: string, idx: number) => {
    setForms((prev) => {
      const arr = prev[roomId] || [];
      const next = arr.filter((_, i) => i !== idx);
      return {
        ...prev,
        [roomId]: next.length ? next : [{ name: "", phone: "" }],
      };
    });
  };

  const setFront = (roomId: string, idx: number, url?: string) =>
    updateGuest(roomId, idx, { idCardFrontImageUrl: url });
  const setBack = (roomId: string, idx: number, url?: string) =>
    updateGuest(roomId, idx, { idCardBackImageUrl: url });

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
    <Card
      variant="outlined"
      sx={{ borderRadius: 2, flex: "1 1 600px", minWidth: 320 }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            {rt.roomTypeName || "Loại phòng"}
          </Typography>
        }
        subheader={
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
            <Chip label={`Sức chứa/Phòng: ${rt.capacity || 0}`} size="small" />
          </Stack>
        }
      />
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setAssignOpen(true)}
              disabled={remaining === 0}
            >
              Chọn phòng
            </Button>
          </Stack>

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
                    <CardHeader title={`Phòng ${br.roomName || br.roomId}`} />
                    <CardContent>
                      <Stack spacing={1.5}>
                        {(br.guests || []).length > 0 && (
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2" fontWeight={700}>
                              Khách hiện tại
                            </Typography>
                            {(br.guests || []).map((g) => (
                              <Typography
                                key={g.guestId || `${g.fullname}-${g.phone}`}
                                variant="body2"
                              >
                                {g.fullname || "—"} — {g.phone || "—"}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                        {(forms[br.bookingRoomId] || []).map((g, idx) => (
                          <Card
                            key={idx}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          >
                            <CardContent>
                              <Stack spacing={1}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <TextField
                                    label="Họ và tên"
                                    value={g.name}
                                    onChange={(e) =>
                                      updateGuest(br.bookingRoomId, idx, {
                                        name: e.target.value,
                                      })
                                    }
                                    size="small"
                                    fullWidth
                                  />
                                  <TextField
                                    label="Số điện thoại"
                                    value={g.phone}
                                    onChange={(e) =>
                                      updateGuest(br.bookingRoomId, idx, {
                                        phone: e.target.value,
                                      })
                                    }
                                    size="small"
                                    fullWidth
                                  />
                                </Stack>
                                <UploadCCCD
                                  label="Mặt trước"
                                  value={g.idCardFrontImageUrl}
                                  onChange={(url) =>
                                    setFront(br.bookingRoomId, idx, url)
                                  }
                                />
                                <UploadCCCD
                                  label="Mặt sau"
                                  value={g.idCardBackImageUrl}
                                  onChange={(url) =>
                                    setBack(br.bookingRoomId, idx, url)
                                  }
                                />
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  justifyContent="flex-end"
                                >
                                  {(forms[br.bookingRoomId] || []).length >
                                    1 && (
                                    <Button
                                      color="error"
                                      onClick={() =>
                                        removeGuest(br.bookingRoomId, idx)
                                      }
                                    >
                                      Xóa khách
                                    </Button>
                                  )}
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            onClick={() => addGuest(br.bookingRoomId)}
                            disabled={
                              (forms[br.bookingRoomId] || []).length >=
                              (rt.capacity || 0)
                            }
                          >
                            Thêm khách
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => submitCheckIn(br.bookingRoomId)}
                            disabled={!canCheckIn(br.bookingRoomId)}
                          >
                            Check-in Khách
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
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
