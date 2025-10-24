import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'number', headerName: 'Số phòng', flex: 1 },
  { field: 'floor', headerName: 'Tầng', flex: 1 },
  { field: 'view', headerName: 'Hướng', flex: 1 },
  { field: 'status', headerName: 'Trạng thái', flex: 1 },
];

const rows = [
  { id: 101, number: '101', floor: 1, view: 'City', status: 'Cleaned' },
  { id: 102, number: '102', floor: 1, view: 'City', status: 'Dirty' },
];

export default function Rooms() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Quản lý phòng</Typography>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}