import { Add, AddCircle, Map } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import React from "react";

export interface TopBarControlsProps {
  onAddBooking: () => void;
  onOpenRoomMap: () => void;
}

const TopBarControls: React.FC<TopBarControlsProps> = ({
  onAddBooking,
  onOpenRoomMap,
}) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Button
        startIcon={<AddCircle />}
        variant="contained"
        onClick={onAddBooking}
      >
        Thêm yêu cầu
      </Button>
      <Button
        variant="outlined"
        startIcon={<Map />}
        color="info"
        onClick={onOpenRoomMap}
      >
        Xem sơ đồ phòng
      </Button>
    </Stack>
  );
};

export default TopBarControls;
