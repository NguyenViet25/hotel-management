import { Paper, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import PageHeader from '../components/PageHeader'

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
      <PageHeader title="Loại phòng" subtitle="Định nghĩa các loại phòng và giá cơ bản" />
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}
