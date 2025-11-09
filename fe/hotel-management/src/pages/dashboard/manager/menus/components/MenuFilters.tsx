import { Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import React from "react";
import type { MenuGroupDto } from "../../../../../api/menusApi";

interface MenuFiltersProps {
  menuGroups: MenuGroupDto[];
  groupId: string;
  shift: string;
  status: string;
  isActive: string; // "" | "true" | "false"
  onChange: (key: "groupId" | "shift" | "status" | "isActive", value: string) => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({ menuGroups, groupId, shift, status, isActive, onChange }) => {
  const uniqueShifts = Array.from(new Set(menuGroups.map((g) => g.shift).filter(Boolean)));

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel id="group-label">Nhóm món</InputLabel>
          <Select
            labelId="group-label"
            label="Nhóm món"
            value={groupId}
            onChange={(e) => onChange("groupId", e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {menuGroups.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel id="shift-label">Ca</InputLabel>
          <Select
            labelId="shift-label"
            label="Ca"
            value={shift}
            onChange={(e) => onChange("shift", e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {uniqueShifts.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel id="status-label">Trạng thái</InputLabel>
          <Select
            labelId="status-label"
            label="Trạng thái"
            value={status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Available">Đang bán</MenuItem>
            <MenuItem value="Unavailable">Tạm ngừng</MenuItem>
            <MenuItem value="SeasonallyUnavailable">Theo mùa</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel id="active-label">Kích hoạt</InputLabel>
          <Select
            labelId="active-label"
            label="Kích hoạt"
            value={isActive}
            onChange={(e) => onChange("isActive", e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="true">Đang kích hoạt</MenuItem>
            <MenuItem value="false">Đã tắt</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default MenuFilters;