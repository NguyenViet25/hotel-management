import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

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
      <Typography variant="h5">Gói giá</Typography>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}