import { Paper, Stack, Typography, Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from '@mui/x-data-grid';

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
      <Typography variant="h5">Bảo trì</Typography>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField label="Phòng" size="small" />
          <TextField label="Mô tả" size="small" />
          <Button variant="contained">Tạo ticket</Button>
        </Stack>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}
