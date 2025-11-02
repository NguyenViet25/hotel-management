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
import { AssignmentInd, Lock, LockOpen, Refresh } from "@mui/icons-material";

interface LockUserDialogProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | null;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

const ResetPasswordDialog: React.FC<LockUserDialogProps> = ({
  open,
  onClose,
  selectedUser,
  handleSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={"bold"}>{"Đặt lại mật khẩu"}</DialogTitle>
      <DialogContent>
        <Stack direction={"column"} gap={2}>
          <Typography>
            {`Bạn có chắc chắn muốn reset mật khẩu tài khoản ${selectedUser?.userName}?`}
          </Typography>
          <FormActionButtons
            onCancel={onClose}
            cancelLabel="Hủy"
            cancelIcon={<AssignmentInd />}
            onSubmit={handleSubmit}
            submitLabel="Xác nhận"
            submitColor="primary"
            submitIcon={<Refresh />}
            isSubmitting={isSubmitting}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
