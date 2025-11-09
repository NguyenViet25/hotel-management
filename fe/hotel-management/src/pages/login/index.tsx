import { Google as GoogleIcon, Hotel as HotelIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Divider,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useLayoutEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axios";
import { localStorageHelper } from "../../utils/local-storage-helper";
import { useStore, type StoreState } from "../../hooks/useStore";
import type { User } from "../../api/userService";

export interface LoginResponseDto {
  data: {
    requiresTwoFactor: boolean;
    accessToken?: string | null;
    expiresAt?: string | Date | null;
    user?: User | null;
  };
}

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // breakpoint for mobile
  const { setUser, user } = useStore<StoreState>((state) => state);

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const expiredParam = params.get("expired"); // get ?expired=value
    if (expiredParam === "true" && user) {
      navigateToCorrectPage(user);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post<LoginResponseDto>(
        "/auth/login",
        formData
      );
      const { accessToken, user } = response.data.data;
      if (!user) throw new Error();
      console.log("user", user);
      setUser(user);
      localStorageHelper.setAuthData(accessToken!, user);
      navigateToCorrectPage(user);
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCorrectPage = (user: User) => {
    const role = user?.roles[0]?.toLowerCase();
    console.log("role", role);
    let path = "/dashboard";
    switch (role) {
      case "admin":
        path = "/admin/dashboard";
        break;
      case "manager":
        path = "/manager/dashboard";
        break;
      case "frontdesk":
        path = "/frontdesk/dashboard";
        break;

      case "kitchen":
        path = "/kitchen/dashboard";
        break;
    }
    toast.success("Đăng nhập thành công!", { toastId: "welcome-back" });
    navigate(path);
  };

  const handleGoogleLogin = () => {
    toast.info("Chức năng đăng nhập Google sẽ được triển khai sớm.");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            p: isMobile ? 2 : 6,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {/* Left: Icon + Description */}
          <Box sx={{ flex: 1, pr: isMobile ? 0 : 4, mb: isMobile ? 4 : 0 }}>
            <HotelIcon sx={{ fontSize: 80, color: "#5563DE", mb: 2 }} />
            <Typography
              component="h1"
              variant="h4"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Quản lý Khách sạn
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Chào mừng trở lại! Vui lòng đăng nhập để quản lý đặt phòng, phòng
              và khách hàng hiệu quả.
            </Typography>
          </Box>

          {/* Right: Form */}
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                autoFocus
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  backgroundColor: "#5563DE",
                  "&:hover": { backgroundColor: "#3b4ac0" },
                }}
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>HOẶC</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ py: 1.5, borderRadius: 3, textTransform: "none" }}
            >
              Đăng nhập với Google
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
