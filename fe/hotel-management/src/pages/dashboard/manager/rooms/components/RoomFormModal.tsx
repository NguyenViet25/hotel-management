import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import React, { useEffect, useState } from "react";
import {
  Hotel as HotelIcon,
  Numbers as NumbersIcon,
  Layers as LayersIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  AddCircle as AddCircleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import type {
  CreateRoomRequest,
  RoomDto,
  UpdateRoomRequest,
} from "../../../../../api/roomsApi";
import type { RoomType } from "../../../../../api/roomTypesApi";
import { ROOM_STATUS_OPTIONS } from "./roomsConstants";
import { useStore, type StoreState } from "../../../../../hooks/useStore";

type RoomFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRoomRequest | UpdateRoomRequest) => Promise<void>;
  initialData?: RoomDto | null;
  roomTypes: RoomType[];
  roomTypesLoading?: boolean;
};

const RoomFormModal: React.FC<RoomFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  roomTypes,
  roomTypesLoading = false,
}) => {
  const { user } = useStore<StoreState>((state) => state);

  const [number, setNumber] = useState<string>(initialData?.number ?? "");
  const [floor, setFloor] = useState<string>(
    initialData?.floor ? String(initialData.floor) : ""
  );
  const [typeId, setTypeId] = useState<string>(
    initialData?.roomTypeId ? String(initialData.roomTypeId) : ""
  );
  const [status, setStatus] = useState<number>(initialData?.status ?? 0);

  useEffect(() => {
    setNumber(initialData?.number ?? "");
    setFloor(initialData?.floor ? String(initialData.floor) : "");
    setTypeId(initialData?.roomTypeId ? String(initialData.roomTypeId) : "");
    setStatus(initialData?.status ?? 0);
  }, [initialData]);

  const handleSubmit = async () => {
    const payload: CreateRoomRequest | UpdateRoomRequest = initialData
      ? {
          hotelId: user?.hotelId,
          number,
          floor: Number(floor),
          roomTypeId: typeId,
          status,
        }
      : {
          number,
          hotelId: user?.hotelId,
          floor: Number(floor),
          roomTypeId: typeId,
          status,
        };
    await onSubmit(payload).then(() => {
      reset();
    });
  };

  const reset = () => {
    setNumber("");
    setFloor("");
    setTypeId("");
    setStatus(0);
  };

  const handleTypeChange = (e: SelectChangeEvent<string>) =>
    setTypeId(e.target.value);
  const handleStatusChange = (e: SelectChangeEvent<number>) =>
    setStatus(e.target.value);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        {initialData ? <EditIcon /> : <AddCircleIcon />}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {initialData ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Số phòng"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NumbersIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Tầng"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            type="number"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LayersIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth disabled={!!roomTypesLoading}>
            <InputLabel id="type-label">Loại phòng</InputLabel>
            <Select
              labelId="type-label"
              value={typeId}
              label="Loại phòng"
              onChange={handleTypeChange}
              startAdornment={
                <InputAdornment position="start">
                  <CategoryIcon color="primary" />
                </InputAdornment>
              }
            >
              {roomTypes.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="status-label">Trạng thái</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Trạng thái"
              onChange={handleStatusChange}
              startAdornment={
                <InputAdornment position="start">
                  <CheckCircleIcon color="primary" />
                </InputAdornment>
              }
            >
              {ROOM_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: "background.paper",
        }}
      >
        <Button
          onClick={onClose}
          color="error"
          startIcon={<CloseIcon />}
          variant="contained"
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          startIcon={<HotelIcon />}
          onClick={handleSubmit}
          disabled={!number || !floor || !typeId}
        >
          {initialData ? "Lưu thay đổi" : "Tạo phòng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomFormModal;
