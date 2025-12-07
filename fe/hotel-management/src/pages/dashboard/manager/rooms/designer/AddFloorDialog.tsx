import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useDesignerStore } from "./store";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddFloorDialog: React.FC<Props> = ({ open, onClose }) => {
  const addFloor = useDesignerStore((s) => s.addFloor);
  const [title, setTitle] = useState("Floor " + Math.floor(Math.random() * 9 + 1));

  const handleCreate = () => {
    if (!title.trim()) return;
    addFloor(title.trim());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Floor</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Floor Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFloorDialog;