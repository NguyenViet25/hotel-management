import DoneAllIcon from "@mui/icons-material/DoneAll";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KingBedIcon from "@mui/icons-material/KingBed";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import housekeepingApi from "../../../../../api/housekeepingApi";
import roomsApi, {
  type RoomDto,
  RoomStatus,
  getRoomStatusString,
} from "../../../../../api/roomsApi";
import { useStore } from "../../../../../hooks/useStore";
import AssignHousekeepingDialog from "../components/AssignHousekeepingDialog";
import { PersonAdd } from "@mui/icons-material";

const HK = {
  colors: {
    panelBorder: "#E6E8EF",
    panelBg: "#FFFFFF",
    chipGreyBg: "#F2F4F7",
    chipGreyText: "#344054",
    dirtyBg: "#FDECEC",
    dirtyText: "#C62828",
    cleanBg: "#DDF7E5",
    cleanText: "#1B5E20",
    cleaningBg: "#FEF3C7",
    cleaningText: "#92400E",
  },
};

export default function HousekeepingAssignPage() {
  const { hotelId } = useStore();
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRoom, setAssignRoom] = useState<RoomDto | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomsApi.getRooms({
        hotelId: hotelId || undefined,
        status: String(RoomStatus.Dirty),
        page: 1,
        pageSize: 500,
      });
      if (res.isSuccess) setRooms(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const dirtyRooms = useMemo(() => {
    return rooms
      .filter((r) => r.status === RoomStatus.Dirty)
      .sort(
        (a, b) =>
          (a.floor ?? 0) - (b.floor ?? 0) ||
          (a.number || "").localeCompare(b.number || "")
      );
  }, [rooms]);

  return (
    <Box>
      {loading && <Alert severity="info">Đang tải dữ liệu...</Alert>}
      <Grid container spacing={2}>
        {dirtyRooms.map((r) => {
          const s = getRoomStatusString(r.status);
          const statusChipCfg = {
            bg: HK.colors.dirtyBg,
            text: HK.colors.dirtyText,
          };
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={r.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: HK.colors.panelBorder,
                  background: HK.colors.panelBg,
                }}
              >
                <CardContent>
                  <Stack spacing={1.2}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`Phòng ${r.number}`}
                          icon={<KingBedIcon />}
                          sx={{
                            bgcolor: HK.colors.chipGreyBg,
                            color: HK.colors.chipGreyText,
                            borderRadius: 2,
                          }}
                        />
                        <Chip
                          label={r.roomTypeName}
                          sx={{
                            bgcolor: HK.colors.chipGreyBg,
                            color: HK.colors.chipGreyText,
                            borderRadius: 2,
                          }}
                        />
                      </Stack>
                      <Chip
                        label={s === "Dirty" ? "Bẩn" : s}
                        sx={{
                          bgcolor: statusChipCfg.bg,
                          color: statusChipCfg.text,
                          fontWeight: 700,
                        }}
                        icon={<WarningAmberIcon />}
                      />
                    </Stack>

                    <Box
                      sx={{
                        bgcolor: "#F4F6FA",
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Ghi chú: Phân công dọn buồng
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ borderRadius: 999 }}
                        startIcon={<PersonAdd />}
                        onClick={() => {
                          setAssignRoom(r);
                          setAssignOpen(true);
                        }}
                      >
                        Phân công
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {dirtyRooms.length === 0 && !loading && (
          <Grid>
            <Typography variant="body2" color="text.secondary">
              Không có phòng cần dọn
            </Typography>
          </Grid>
        )}
      </Grid>

      <AssignHousekeepingDialog
        open={assignOpen}
        hotelId={hotelId || ""}
        roomId={assignRoom?.id || ""}
        roomNumber={assignRoom?.number || ""}
        onClose={() => {
          setAssignOpen(false);
          setAssignRoom(null);
        }}
        onAssigned={fetchRooms}
      />
    </Box>
  );
}
