import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import React from "react";
import RoomMap from "../../../manager/rooms/designer/RoomMap";

export interface RoomMapDialogProps {
  open: boolean;
  onClose: () => void;
}

const RoomMapDialog: React.FC<RoomMapDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Danh sách phòng</DialogTitle>
      <DialogContent>
        <Box pt={1}>
          <RoomMap allowAddNew={false} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RoomMapDialog;
