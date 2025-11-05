import { AssignmentInd, Lock, LockOpen } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import type { User } from "../../../../../api/userService";
import FormActionButtons from "../../../../../components/common/FormActionButtons";
import { isLocked } from "../../../../../utils/is-locked";

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
  const isLocking = isLocked(selectedUser?.lockedUntil) ?? false;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={"bold"}>
        {isLocking ? "Mở khóa tài khoản" : "Khóa tài khoản"}
      </DialogTitle>
      <DialogContent>
        <Stack direction={"column"} gap={2}>
          <Typography>
            {isLocking
              ? `Bạn có chắc chắn muốn mở khóa tài khoản ${selectedUser?.userName}?`
              : `Bạn có chắc chắn muốn khóa tài khoản ${selectedUser?.userName}?`}
          </Typography>
          <FormActionButtons
            onCancel={onClose}
            cancelLabel="Hủy"
            cancelIcon={<AssignmentInd />}
            onSubmit={handleSubmit}
            submitLabel={isLocking ? "Mở khóa" : "Khóa"}
            submitColor={isLocking ? "success" : "error"}
            submitIcon={isLocking ? <LockOpen /> : <Lock />}
            isSubmitting={isSubmitting}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default LockUserDialog;
