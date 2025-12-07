import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import profileApi, {
  type ChangePasswordRequest,
  type UpdateProfileRequest,
} from "../../api/profileApi";
import PageTitle from "../../components/common/PageTitle";
import { useStore, type StoreState } from "../../hooks/useStore";

const ProfilePage = () => {
  const { user, setUser } = useStore<StoreState>((state) => state);
  const [form, setForm] = useState<UpdateProfileRequest>({});
  const [pwd, setPwd] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await profileApi.getMe();
        console.log("res", res);
        if (res.isSuccess) {
          setForm({
            email: res.data.email ?? "",
            fullname: res.data.fullname ?? "",
            phoneNumber: res.data.phoneNumber ?? "",
          });
        } else {
          toast.error(res.message ?? "Không thể tải thông tin hồ sơ");
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
      if (res.isSuccess) {
        const newUser: any = {
          ...user,
          email: res.data.email ?? "",
          fullname: res.data.fullname ?? "",
          phoneNumber: res.data.phoneNumber ?? "",
        };
        setUser(newUser);
        toast.success(res.message ?? "Cập nhật hồ sơ thành công");
      } else {
        toast.error(res.message ?? "Cập nhật thất bại");
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
      if (res.isSuccess) {
        toast.success("Đổi mật khẩu thành công");
        setPwd({ currentPassword: "", newPassword: "" });
      } else {
        toast.error(res.message ?? "Đổi mật khẩu thất bại");
      }
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
            type={showCurrentPwd ? "text" : "password"}
            label="Mật khẩu hiện tại"
            value={pwd.currentPassword}
            onChange={(e) =>
              setPwd((p) => ({ ...p, currentPassword: e.target.value }))
            }
            fullWidth
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1 }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle current password visibility"
                    onClick={() => setShowCurrentPwd((prev) => !prev)}
                  >
                    {showCurrentPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Nhập mật khẩu hiện tại"
          />
          <TextField
            type={showNewPwd ? "text" : "password"}
            label="Mật khẩu mới"
            value={pwd.newPassword}
            onChange={(e) =>
              setPwd((p) => ({ ...p, newPassword: e.target.value }))
            }
            fullWidth
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1 }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={() => setShowNewPwd((prev) => !prev)}
                  >
                    {showNewPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
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
