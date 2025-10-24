import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'username', headerName: 'Username', flex: 1 },
  { field: 'role', headerName: 'Vai trò', flex: 1 },
  { field: 'status', headerName: 'Trạng thái', flex: 1 },
];

const rows = [
  { id: 1, username: 'admin', role: 'Admin', status: 'Active' },
  { id: 2, username: 'reception', role: 'Lễ tân', status: 'Active' },
];

export default function UsersRBAC() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Quản lý người dùng & phân quyền</Typography>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Tạo người dùng" size="small" />
          <Button variant="contained">Tạo</Button>
        </Box>
        <div style={{ height: 400 }}>
          <DataGrid columns={columns} rows={rows} />
        </div>
      </Paper>
    </Stack>
  );
}