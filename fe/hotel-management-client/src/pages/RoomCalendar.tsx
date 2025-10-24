import { Stack, Typography, Paper } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function RoomCalendar() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Lịch phòng</Typography>
      <Paper sx={{ p: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height={600}
          events={[
            { title: 'Phòng 201 - Nguyễn Văn A', start: new Date().toISOString().slice(0,10) },
            { title: 'Phòng 305 - Lê Thị B', start: new Date(Date.now() + 86400000).toISOString().slice(0,10) },
          ]}
        />
      </Paper>
    </Stack>
  );
}