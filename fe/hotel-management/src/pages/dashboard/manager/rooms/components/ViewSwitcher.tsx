import MapIcon from "@mui/icons-material/Map";
import TableChartIcon from "@mui/icons-material/TableChart";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface ViewSwitcherProps {
  view: "map" | "table" | "assign";
  onChange: (view: "map" | "table" | "assign") => void;
}

export default function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  const handleChange = (_: any, next: "map" | "table" | "assign" | null) => {
    if (next !== null) onChange(next);
  };

  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={handleChange}
      size="small"
      color="primary"
      sx={{ mb: 2, display: "flex", direction: { xs: "column", sm: "row" } }}
      dir="ltr"
    >
      <ToggleButton value="map">
        <MapIcon sx={{ mr: 1 }} />
        Xem Sơ Đồ
      </ToggleButton>
      <ToggleButton value="table">
        <TableChartIcon sx={{ mr: 1 }} />
        Xem Bảng
      </ToggleButton>
      <ToggleButton value="assign">
        <CleaningServicesIcon sx={{ mr: 1 }} />
        Phân công dọn dẹp
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
