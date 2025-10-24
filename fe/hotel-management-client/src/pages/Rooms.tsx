import { Paper, Stack } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import PageHeader from '../components/PageHeader'
import RoomStatusChip from '../components/RoomStatusChip'
import { useEffect, useState } from 'react'
import { listRooms, type RoomDto } from '../api/rooms'

const columns: GridColDef[] = [
  { field: 'number', headerName: 'Số phòng', flex: 1 },
  { field: 'floor', headerName: 'Tầng', flex: 1 },
  { field: 'view', headerName: 'Hướng', flex: 1 },
  { field: 'status', headerName: 'Trạng thái', flex: 1, renderCell: (params) => <RoomStatusChip status={String(params.value)} /> },
]

export default function Rooms() {
  const [rows, setRows] = useState<RoomDto[]>([])
  useEffect(() => { listRooms().then(setRows) }, [])

  return (
    <Stack spacing={2}>
      <PageHeader title="Quản lý phòng" subtitle="Khai báo số phòng, tầng, hướng, trạng thái" />
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 500 }}>
          <DataGrid columns={columns} rows={rows} density="comfortable" disableRowSelectionOnClick />
        </div>
      </Paper>
    </Stack>
  )
}