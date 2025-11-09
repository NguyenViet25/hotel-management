import React from "react";
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { RoomType } from "../../../../../api/roomTypesApi";
import { ROOM_STATUS_OPTIONS } from "./roomsConstants";

type RoomFiltersProps = {
  status: string;
  floor: string;
  typeId: string;
  searchNumber: string;
  onChangeStatus: (value: string) => void;
  onChangeFloor: (value: string) => void;
  onChangeTypeId: (value: string) => void;
  onChangeSearchNumber: (value: string) => void;
  roomTypes: RoomType[];
  roomTypesLoading?: boolean;
};

const RoomFilters: React.FC<RoomFiltersProps> = ({
  status,
  floor,
  typeId,
  searchNumber,
  onChangeStatus,
  onChangeFloor,
  onChangeTypeId,
  onChangeSearchNumber,
  roomTypes,
  roomTypesLoading,
}) => {
  const handleStatusChange = (e: SelectChangeEvent<string>) => onChangeStatus(e.target.value);
  const handleFloorChange = (e: React.ChangeEvent<HTMLInputElement>) => onChangeFloor(e.target.value);
  const handleTypeChange = (e: SelectChangeEvent<string>) => onChangeTypeId(e.target.value);
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => onChangeSearchNumber(e.target.value);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <TextField label="Số phòng" value={searchNumber} onChange={handleNumberChange} placeholder="Nhập số phòng" />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <TextField label="Tầng" value={floor} onChange={handleFloorChange} type="number" />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth disabled={!!roomTypesLoading}>
          <InputLabel id="room-type-label">Loại phòng</InputLabel>
          <Select labelId="room-type-label" value={typeId} label="Loại phòng" onChange={handleTypeChange}>
            <MenuItem value="">Tất cả</MenuItem>
            {roomTypes.map((t) => (
              <MenuItem key={t.id} value={String(t.id)}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel id="room-status-label">Trạng thái</InputLabel>
          <Select labelId="room-status-label" value={status} label="Trạng thái" onChange={handleStatusChange}>
            <MenuItem value="">Tất cả</MenuItem>
            {ROOM_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default RoomFilters;