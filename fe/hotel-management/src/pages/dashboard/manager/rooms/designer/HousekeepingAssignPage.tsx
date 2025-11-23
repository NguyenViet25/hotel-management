import React, { useEffect, useState } from "react";
import { Box, Alert } from "@mui/material";
import roomsApi, { type RoomDto } from "../../../../../api/roomsApi";
import RoomHygieneList from "../components/RoomHygieneList";

export default function HousekeepingAssignPage() {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomsApi.getRooms({ page: 1, pageSize: 500 });
      if (res.isSuccess) setRooms(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  return (
    <Box>
      {loading && <Alert severity="info">Đang tải dữ liệu...</Alert>}
      <RoomHygieneList rooms={rooms} onStatusUpdated={fetchRooms} />
    </Box>
  );
}