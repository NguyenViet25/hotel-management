import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import React from "react";
import type { UpdateUserRequest, User } from "../../../../../api/userService";
import HotelSelect from "../components/HotelSelect";
import RoleSelect from "../components/RoleSelect";

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  selectedUser: User | null;
  formData: UpdateUserRequest;
  formErrors: Record<string, string>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onClose,
  selectedUser,
  formData,
  formErrors,
  handleInputChange,
  handleSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sửa thông tin tài khoản</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Tên đăng nhập"
            fullWidth
            value={selectedUser?.userName || ""}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="email"
            label="Email"
            placeholder="Nhập email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="fullName"
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            fullWidth
            value={formData.fullName}
            onChange={handleInputChange}
            error={!!formErrors.fullName}
            helperText={formErrors.fullName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="phoneNumber"
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={!!formErrors.phoneNumber}
            helperText={formErrors.phoneNumber}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
          <RoleSelect
            name="roles"
            value={formData?.roles?.[0] || ""}
            onChange={(e) => handleInputChange(e)}
          />
          <HotelSelect
            name="propertyRoles"
            value={formData?.propertyRoles?.[0]?.hotelId || ""}
            onChange={(e) => handleInputChange(e)}
          />

          <Stack direction={"row"} justifyContent={"right"} gap={1}>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Lưu"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
