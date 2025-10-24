import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../components/PageHeader'

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Tên người dùng', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'role', headerName: 'Vai trò', flex: 0.8 },
]

const rows = [
  { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'Manager' },
  { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'Receptionist' },
]

export default function UsersRBAC() {
  return (
    <Stack spacing={2}>
      <PageHeader title="Người dùng & Quyền" subtitle="Quản lý thành viên và phân quyền truy cập" />
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}