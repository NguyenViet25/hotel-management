import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import bookingsApi, {
  type BookingDetailsDto,
  type BookingRoomDto,
  type BookingRoomTypeDto,
  type RoomMapItemDto,
} from "../../../../../api/bookingsApi";
import RoomCard from "./RoomCard";
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
  const [mapRooms, setMapRooms] = useState<RoomMapItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const assignedRooms: BookingRoomDto[] = rt.bookingRooms || [];
  const remaining = Math.max(0, (rt.totalRoom || 0) - assignedRooms.length);

  const fetchMap = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.getRoomMap({
        date: rt.startDate,
        hotelId: booking.hotelId,
      });
      if (res.isSuccess && res.data)
        setMapRooms(res.data.filter((r) => r.roomTypeId === rt.roomTypeId));
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id, rt.roomTypeId, rt.startDate]);

  const toggleSelect = (roomId: string) => {
    setSelectedIds((prev) => {
      const exists = prev.includes(roomId);
      if (exists) return prev.filter((id) => id !== roomId);
      const next = [...prev, roomId];
      const allowed = next.slice(0, remaining); // cap to remaining slots
      return allowed;
    });
  };

  const isAvailable = (room: RoomMapItemDto) => {
    const seg = room.timeline?.[0];
    const s = (seg?.status || "").toLowerCase();
    return s === "available";
  };

  const statusUi = (room: RoomMapItemDto) => {
    const seg = room.timeline?.[0];
    const s = (seg?.status || "").toLowerCase();
    if (s === "available") return { label: "Trống", color: "#2e7d32" };
    if (s === "occupied" || s === "booked")
      return { label: "Đã Có Khách", color: "#c62828" };
    if (s === "cleaning") return { label: "Đang Dọn Dẹp", color: "#f9a825" };
    if (s === "maintenance") return { label: "Bảo Trì", color: "#424242" };
    return { label: seg?.status || "—", color: "#9e9e9e" };
  };

  const assignSelected = async () => {
    if (!selectedIds.length || remaining === 0) return;
    try {
      for (const roomId of selectedIds) {
        await bookingsApi.addRoom({
          bookingRoomTypeId: rt.bookingRoomTypeId,
          roomId,
        });
      }
      setSelectedIds([]);
      setSnackbar({
        open: true,
        message: "Gán phòng thành công",
        severity: "success",
      });
      await onRefresh?.();
      await fetchMap();
    } catch {
      setSnackbar({
        open: true,
        message: "Không thể gán phòng",
        severity: "error",
      });
    }
  };

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

  // Group rooms by floor using first digit heuristic if floor not provided
  const floorGroups = useMemo(() => {
    const byFloor: Record<string, RoomMapItemDto[]> = {};
    (mapRooms || []).forEach((r) => {
      const num = r.roomNumber || "";
      const f = /^[0-9]/.test(num) ? num.charAt(0) : "?";
      if (!byFloor[f]) byFloor[f] = [];
      byFloor[f].push(r);
    });
    return Object.entries(byFloor).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [mapRooms]);

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
          <Typography variant="subtitle2" fontWeight={700}>
            Chọn Phòng (chỉ phòng Trống)
          </Typography>
          <Stack spacing={2}>
            {floorGroups.map(([floor, rooms]) => (
              <Stack key={floor} spacing={1}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                >{`Tầng ${floor}`}</Typography>
                <Grid container spacing={2}>
                  {rooms.map((r) => {
                    const ui = statusUi(r);
                    const alreadyAssigned = assignedRooms.some(
                      (br) => br.roomId === r.roomId
                    );
                    const disabled =
                      !isAvailable(r) || alreadyAssigned || remaining === 0;
                    return (
                      <Grid item key={r.roomId}>
                        <RoomCard
                          room={r}
                          selected={selectedIds.includes(r.roomId)}
                          disabled={disabled}
                          statusLabel={ui.label}
                          statusColor={ui.color}
                          onClick={() => toggleSelect(r.roomId)}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
                <Divider sx={{ my: 1 }} />
              </Stack>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedIds.length || remaining === 0}
              onClick={assignSelected}
            >
              Gán Phòng
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
