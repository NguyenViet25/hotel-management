import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'room', headerName: 'Phòng', flex: 1 },
  { field: 'status', headerName: 'HK Trạng thái', flex: 1 },
  { field: 'updated', headerName: 'Cập nhật', flex: 1 },
];

const rows = [
  { id: 1, room: '101', status: 'Dirty', updated: '10:00' },
  { id: 2, room: '102', status: 'In-progress', updated: '10:30' },
];

export default function Housekeeping() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Housekeeping</Typography>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}