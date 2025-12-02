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
import type { CreateUserRequest } from "../../../../../api/userService";
import RoleSelect from "../components/RoleSelect";
import HotelSelect from "../components/HotelSelect";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  formData: CreateUserRequest;
  formErrors: Record<string, string>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  enableHotelSelect?: boolean;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
  formData,
  formErrors,
  handleInputChange,
  handleSubmit,
  isSubmitting,
  enableHotelSelect,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo tài khoản mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            name="username"
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            fullWidth
            value={formData.username}
            onChange={handleInputChange}
            error={!!formErrors.username}
            helperText={formErrors.username}
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
          {enableHotelSelect === true && (
            <HotelSelect
              name="propertyRoles"
              value={formData?.propertyRoles?.[0]?.hotelId || ""}
              onChange={(e) => handleInputChange(e)}
            />
          )}

          <Stack direction={"row"} justifyContent={"right"} gap={1}>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Tạo"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
