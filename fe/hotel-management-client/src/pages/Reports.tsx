import { Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'metric', headerName: 'Chỉ số', flex: 1 },
  { field: 'value', headerName: 'Giá trị', flex: 1 },
  { field: 'date', headerName: 'Ngày', flex: 1 },
];

const rows = [
  { id: 1, metric: 'OCC', value: '72%', date: '2025-10-24' },
  { id: 2, metric: 'F&B Sales', value: '25.3M₫', date: '2025-10-24' },
];

export default function Reports() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Báo cáo</Typography>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}