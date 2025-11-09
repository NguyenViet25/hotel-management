import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";

export interface SetPriceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (price: number) => void;
  defaultPrice?: number;
}

const SetPriceDialog: React.FC<SetPriceDialogProps> = ({
  open,
  onClose,
  onConfirm,
  defaultPrice,
}) => {
  const [price, setPrice] = useState<string>(
    defaultPrice != null ? String(defaultPrice) : ""
  );

  useEffect(() => {
    setPrice(defaultPrice != null ? String(defaultPrice) : "");
  }, [defaultPrice, open]);

  const handleConfirm = () => {
    const parsed = Number(price);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onConfirm(parsed);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cài đặt giá chung</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            label="Giá (VND)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            autoFocus
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={price === "" || Number(price) < 0}
        >
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SetPriceDialog;