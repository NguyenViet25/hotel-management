import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import type { User } from "../../../../../api/userService";
import FormActionButtons from "../../../../../components/common/FormActionButtons";
import { AssignmentInd, Lock, LockOpen } from "@mui/icons-material";

interface LockUserDialogProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | null;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

const LockUserDialog: React.FC<LockUserDialogProps> = ({
  open,
  onClose,
  selectedUser,
  handleSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={"bold"}>
        {selectedUser?.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
      </DialogTitle>
      <DialogContent>
        <Stack direction={"column"} gap={2}>
          <Typography>
            {selectedUser?.isLocked
              ? `Bạn có chắc chắn muốn mở khóa tài khoản ${selectedUser?.userName}?`
              : `Bạn có chắc chắn muốn khóa tài khoản ${selectedUser?.userName}?`}
          </Typography>
          <FormActionButtons
            onCancel={onClose}
            cancelLabel="Hủy"
            cancelIcon={<AssignmentInd />}
            onSubmit={handleSubmit}
            submitLabel={selectedUser?.isLocked ? "Mở khóa" : "Khóa"}
            submitColor={selectedUser?.isLocked ? "success" : "error"}
            submitIcon={selectedUser?.isLocked ? <LockOpen /> : <Lock />}
            isSubmitting={isSubmitting}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default LockUserDialog;
