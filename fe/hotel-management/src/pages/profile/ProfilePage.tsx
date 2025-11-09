import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import profileApi, {
  type ProfileDto,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
} from "../../api/profileApi";
import { toast } from "react-toastify";
import PageTitle from "../../components/common/PageTitle";
import {
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [form, setForm] = useState<UpdateProfileRequest>({});
  const [pwd, setPwd] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await profileApi.getMe();
        if (res.success) {
          setProfile(res.data);
          setForm({
            email: res.data.email ?? "",
            fullname: res.data.fullname ?? "",
            phoneNumber: res.data.phoneNumber ?? "",
          });
        }
      } catch (e) {
        toast.error("Không thể tải thông tin hồ sơ", {
          toastId: "error-not-found-profile",
        });
      }
    };
    load();
  }, []);

  const onSave = async () => {
    try {
      const res = await profileApi.update(form);
      if (res.success) {
        setProfile(res.data);
        toast.success(res.message ?? "Cập nhật hồ sơ thành công");
      }
    } catch (e) {
      toast.error("Cập nhật thất bại");
    }
  };

  const onChangePassword = async () => {
    if (!pwd.currentPassword || !pwd.newPassword) {
      toast.warn("Vui lòng nhập đủ mật khẩu hiện tại và mới");
      return;
    }
    try {
      const res = await profileApi.changePassword(pwd);
      if (res.success) toast.success("Đổi mật khẩu thành công");
    } catch (e) {
      toast.error("Đổi mật khẩu thất bại");
    }
  };

  return (
    <Box>
      <PageTitle
        title="Thông tin cá nhân"
        subtitle="Xem và cập nhật thông tin cá nhân, email, số điện thoại và chi tiết liên hệ"
      />

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Họ và tên"
            value={form.fullname ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, fullname: e.target.value }))
            }
            fullWidth
            placeholder="Nhập họ và tên"
            InputProps={{
              startAdornment: <PersonIcon sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            label="Email"
            value={form.email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            fullWidth
            placeholder="Nhập email"
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            label="Số điện thoại"
            value={form.phoneNumber ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, phoneNumber: e.target.value }))
            }
            fullWidth
            placeholder="Nhập số điện thoại"
            InputProps={{
              startAdornment: <PhoneIcon sx={{ mr: 1 }} />,
            }}
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={onSave}>
            Lưu thay đổi
          </Button>
        </Stack>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <PageTitle
        title="Đổi mật khẩu"
        subtitle="Cập nhật mật khẩu hiện tại để bảo vệ tài khoản của bạn"
      />
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            type="password"
            label="Mật khẩu hiện tại"
            value={pwd.currentPassword}
            onChange={(e) =>
              setPwd((p) => ({ ...p, currentPassword: e.target.value }))
            }
            fullWidth
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1 }} />,
            }}
            placeholder="Nhập mật khẩu hiện tại"
          />
          <TextField
            type="password"
            label="Mật khẩu mới"
            value={pwd.newPassword}
            onChange={(e) =>
              setPwd((p) => ({ ...p, newPassword: e.target.value }))
            }
            fullWidth
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1 }} />,
            }}
            placeholder="Nhập mật khẩu mới"
          />
        </Stack>
        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LockIcon />}
            onClick={onChangePassword}
          >
            Đổi mật khẩu
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
