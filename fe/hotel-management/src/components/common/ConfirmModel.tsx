import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Divider,
} from "@mui/material";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  confirmColor?: "primary" | "error" | "success" | "warning";
  cancelText?: string;
  icon?: React.ReactNode;
  confirmIcon?: React.ReactNode;
  cancelIcon?: React.ReactNode;
  onConfirm: () => Promise<void> | void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Đóng",
  confirmColor = "error",
  confirmIcon,
  icon,
  cancelIcon,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ width: "100%" }}
        >
          <Button
            startIcon={cancelIcon}
            variant="outlined"
            color="inherit"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            startIcon={confirmIcon}
            variant="contained"
            color={confirmColor}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
