import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

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
      <Typography variant="h5">Nhà hàng</Typography>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}