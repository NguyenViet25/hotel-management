import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../components/PageHeader'

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
      <PageHeader title="Audit Log" subtitle="Theo dõi hoạt động của người dùng trong hệ thống" />
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}