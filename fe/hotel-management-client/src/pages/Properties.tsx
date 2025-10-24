import { Paper, Stack } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import PageHeader from '../components/PageHeader'
import { useEffect, useState } from 'react'
import { listProperties, type PropertyDto } from '../api/properties'

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Tên cơ sở', flex: 1 },
  { field: 'location', headerName: 'Địa điểm', flex: 1 },
  { field: 'rooms', headerName: 'Số phòng', flex: 0.6 },
  { field: 'status', headerName: 'Trạng thái', flex: 0.8 },
]

export default function Properties() {
  const [rows, setRows] = useState<PropertyDto[]>([])
  useEffect(() => { listProperties().then(setRows) }, [])

  return (
    <Stack spacing={2}>
      <PageHeader title="Cơ sở kinh doanh" subtitle="Danh sách khách sạn, resort thuộc hệ thống" />
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}