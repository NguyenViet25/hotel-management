import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
} from "@mui/material";
import { nanoid } from "uuid";
import { useDesignerStore } from "./store";
import { ROOM_TYPE_META, type RoomType } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  floorId: string;
}

const AddRoomDialog: React.FC<Props> = ({ open, onClose, floorId }) => {
  const addRoom = useDesignerStore((s) => s.addRoom);
  const [number, setNumber] = useState("");
  const [type, setType] = useState<RoomType>("Single");

  const preview = useMemo(() => ROOM_TYPE_META[type], [type]);

  const handleCreate = () => {
    if (!number.trim()) return;
    addRoom(floorId, {
      id: nanoid(),
      number: number.trim(),
      type,
      status: "Available",
    });
    onClose();
    setNumber("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Room</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Room Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="room-type-label">Room Type</InputLabel>
            <Select
              labelId="room-type-label"
              label="Room Type"
              value={type}
              onChange={(e) => setType(e.target.value as RoomType)}
            >
              {Object.entries(ROOM_TYPE_META).map(([key, meta]) => (
                <MenuItem key={key} value={key}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {meta.icon}
                    <span>{meta.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={`Preview: ${preview.label}`}
              icon={preview.icon as any}
              sx={{
                bgcolor: preview.color,
                color: "white",
                borderRadius: 1,
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRoomDialog;