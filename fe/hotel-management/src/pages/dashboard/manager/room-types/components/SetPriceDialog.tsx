import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  InputAdornment,
  Typography,
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
  const [price, setPrice] = useState<number | null>(
    defaultPrice != null ? Number(defaultPrice) : null
  );

  useEffect(() => {
    setPrice(defaultPrice != null ? Number(defaultPrice) : null);
  }, [defaultPrice, open]);

  const handleConfirm = () => {
    if (price == null || !Number.isFinite(price) || price < 0) return;
    onConfirm(price);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cài đặt giá chung</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            label="Giá (VND)"
            type="text"
            value={
              price !== null && price !== undefined
                ? new Intl.NumberFormat("vi-VN").format(Number(price))
                : ""
            }
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              const num = raw ? Number(raw) : null;
              setPrice(num);
            }}
            fullWidth
            autoFocus
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="body2" color="text.secondary">
                    VND
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={price == null || price < 0}
        >
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SetPriceDialog;
