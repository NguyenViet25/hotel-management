import { Stack, Paper } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageHeader from "../components/PageHeader";

export default function RoomCalendar() {
  return (
    <Stack spacing={2}>
      <PageHeader
        title="Lịch phòng"
        subtitle="Xem và quản lý lịch đặt phòng theo ngày/tháng"
      />
      <Paper sx={{ p: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height={600}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={[
            {
              title: "Phòng 201 - Nguyễn Văn A",
              start: new Date().toISOString().slice(0, 10),
            },
            {
              title: "Phòng 305 - Lê Thị B",
              start: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            },
          ]}
        />
      </Paper>
    </Stack>
  );
}
