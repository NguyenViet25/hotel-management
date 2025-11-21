import MapIcon from "@mui/icons-material/Map";
import TableChartIcon from "@mui/icons-material/TableChart";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface ViewSwitcherProps {
  view: "map" | "table";
  onChange: (view: "map" | "table") => void;
}

export default function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  const handleChange = (_: any, next: "map" | "table" | null) => {
    if (next !== null) onChange(next);
  };

  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={handleChange}
      size="small"
      color="primary"
      sx={{ mb: 2 }}
    >
      <ToggleButton value="map">
        <MapIcon sx={{ mr: 1 }} />
        Xem Sơ Đồ
      </ToggleButton>
      <ToggleButton value="table">
        <TableChartIcon sx={{ mr: 1 }} />
        Xem Bảng
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
