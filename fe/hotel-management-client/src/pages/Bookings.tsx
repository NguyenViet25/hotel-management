import { Paper, Stack, Typography, Button, TextField } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../components/PageHeader'

const columns: GridColDef[] = [
  { field: "guest", headerName: "Khách", flex: 1 },
  { field: "room", headerName: "Phòng", flex: 1 },
  { field: "checkIn", headerName: "Check-in", flex: 1 },
  { field: "checkOut", headerName: "Check-out", flex: 1 },
  { field: "status", headerName: "Trạng thái", flex: 1 },
];

const rows = [
  {
    id: 1,
    guest: "Nguyễn Văn A",
    room: "201",
    checkIn: "2025-10-25",
    checkOut: "2025-10-28",
    status: "Confirmed",
  },
];

export default function Bookings() {
  return (
    <Stack spacing={2}>
      <PageHeader title="Đặt phòng" subtitle="Tạo đặt phòng và theo dõi trạng thái" />
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField label="Tên khách" size="small" />
          <TextField label="Phòng" size="small" />
          <Button variant="contained">Tạo đặt phòng</Button>
        </Stack>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}
