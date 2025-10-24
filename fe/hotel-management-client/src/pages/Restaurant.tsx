import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../components/PageHeader'

const columns: GridColDef[] = [
  { field: 'table', headerName: 'Bàn', flex: 1 },
  { field: 'order', headerName: 'Order', flex: 2 },
  { field: 'status', headerName: 'Trạng thái', flex: 1 },
];

const rows = [
  { id: 1, table: 'T1', order: 'Phở, Cafe', status: 'In-progress' },
];

export default function Restaurant() {
  return (
    <Stack spacing={2}>
      <PageHeader title="Nhà hàng" subtitle="Quản lý order và trạng thái bàn" />
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}