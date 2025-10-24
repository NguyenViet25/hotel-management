import { Paper, Stack, Typography, Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../components/PageHeader'

const columns: GridColDef[] = [
  { field: "ticket", headerName: "Ticket", flex: 1 },
  { field: "room", headerName: "Phòng", flex: 1 },
  { field: "issue", headerName: "Mô tả lỗi", flex: 2 },
  { field: "status", headerName: "Trạng thái", flex: 1 },
];

const rows = [
  {
    id: 1,
    ticket: "MT-001",
    room: "305",
    issue: "Máy lạnh hỏng",
    status: "Open",
  },
];

export default function Maintenance() {
  return (
    <Stack spacing={2}>
      <PageHeader title="Bảo trì" subtitle="Tạo và theo dõi ticket bảo trì" />
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField label="Phòng" size="small" />
          <TextField label="Mô tả" size="small" />
          <Button variant="contained">Tạo ticket</Button>
        </Stack>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}
