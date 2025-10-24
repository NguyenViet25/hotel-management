import { Paper, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "name", headerName: "Loại phòng", flex: 1 },
  { field: "amenities", headerName: "Tiện nghi", flex: 1 },
  { field: "baseRate", headerName: "Giá cơ bản", flex: 1 },
];

const rows = [
  { id: 1, name: "Deluxe", amenities: "Wifi, Minibar", baseRate: "1.200.000₫" },
];

export default function RoomTypes() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Loại phòng</Typography>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}
