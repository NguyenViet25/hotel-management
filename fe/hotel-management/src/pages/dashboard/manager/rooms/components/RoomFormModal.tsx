import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type {
  RoomDto,
  CreateRoomRequest,
  UpdateRoomRequest,
} from "../../../../../api/roomsApi";
import type { RoomType } from "../../../../../api/roomTypesApi";
import { ROOM_STATUS_OPTIONS } from "./roomsConstants";

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
  const [number, setNumber] = useState<string>(initialData?.number ?? "");
  const [floor, setFloor] = useState<string>(
    initialData?.floor ? String(initialData.floor) : ""
  );
  const [typeId, setTypeId] = useState<string>(
    initialData?.typeId ? String(initialData.typeId) : ""
  );
  const [features, setFeatures] = useState<string>(initialData?.features ?? "");
  const [status, setStatus] = useState<string>(
    initialData?.status ?? "Available"
  );

  useEffect(() => {
    setNumber(initialData?.number ?? "");
    setFloor(initialData?.floor ? String(initialData.floor) : "");
    setTypeId(initialData?.typeId ? String(initialData.typeId) : "");
    setFeatures(initialData?.features ?? "");
    setStatus(initialData?.status ?? "Available");
  }, [initialData]);

  const handleSubmit = async () => {
    const payload: CreateRoomRequest | UpdateRoomRequest = initialData
      ? {
          id: initialData.id!,
          number,
          floor: Number(floor),
          typeId: Number(typeId),
          features,
          status,
        }
      : {
          number,
          floor: Number(floor),
          typeId: Number(typeId),
          features,
          status,
        };
    await onSubmit(payload);
  };

  const handleTypeChange = (e: SelectChangeEvent<string>) =>
    setTypeId(e.target.value);
  const handleStatusChange = (e: SelectChangeEvent<string>) =>
    setStatus(e.target.value);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? "Chỉnh sửa phòng" : "Thêm phòng"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Số phòng"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            fullWidth
          />
          <TextField
            label="Tầng"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            type="number"
            fullWidth
          />
          <FormControl fullWidth disabled={!!roomTypesLoading}>
            <InputLabel id="type-label">Loại phòng</InputLabel>
            <Select
              labelId="type-label"
              value={typeId}
              label="Loại phòng"
              onChange={handleTypeChange}
            >
              {roomTypes.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Đặc điểm"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="status-label">Trạng thái</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Trạng thái"
              onChange={handleStatusChange}
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
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!number || !floor || !typeId}
        >
          {initialData ? "Lưu" : "Tạo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomFormModal;
