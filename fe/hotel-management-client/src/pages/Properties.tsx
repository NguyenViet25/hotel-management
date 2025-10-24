import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Tên cơ sở', flex: 1 },
  { field: 'address', headerName: 'Địa chỉ', flex: 1 },
  { field: 'timezone', headerName: 'Múi giờ', flex: 1 },
  { field: 'currency', headerName: 'Tiền tệ', flex: 1 },
];

const rows = [
  { id: 1, name: 'Hotel A', address: '123 Đường 1', timezone: 'GMT+7', currency: 'VND' },
];

export default function Properties() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Quản lý cơ sở</Typography>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}