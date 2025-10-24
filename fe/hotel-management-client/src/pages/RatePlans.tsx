import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../components/PageHeader'

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Gói giá', flex: 1 },
  { field: 'period', headerName: 'Thời gian áp dụng', flex: 1 },
  { field: 'status', headerName: 'Trạng thái', flex: 1 },
];

const rows = [
  { id: 1, name: 'Standard', period: '2025-01-01 → 2025-12-31', status: 'Active' },
];

export default function RatePlans() {
  return (
    <Stack spacing={2}>
      <PageHeader title="Gói giá" subtitle="Quản lý gói giá và thời gian áp dụng" />
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}