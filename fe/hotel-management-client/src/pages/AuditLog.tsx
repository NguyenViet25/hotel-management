import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'user', headerName: 'Người dùng', flex: 1 },
  { field: 'action', headerName: 'Hành động', flex: 2 },
  { field: 'time', headerName: 'Thời gian', flex: 1 },
];

const rows = [
  { id: 1, user: 'admin', action: 'Tạo gói giá', time: '2025-10-24 10:00' },
  { id: 2, user: 'reception', action: 'Tạo booking', time: '2025-10-24 10:10' },
];

export default function AuditLog() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Audit Log</Typography>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}