import {
  Lock,
  Login,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axios";
import type { User } from "../../api/userService";
import { useStore, type StoreState } from "../../hooks/useStore";
import { localStorageHelper } from "../../utils/local-storage-helper";

import bg from "../../assets/bg.png";

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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const superLogin = async (username: string, password: string) => {
    setLoading(true);

    try {
      const response = await axiosInstance.post<LoginResponseDto>(
        "/auth/login",
        { username, password }
      );
      const { accessToken, user } = response.data.data;
      if (!user) throw new Error();
      setUser(user);
      localStorageHelper.setAuthData(accessToken!, user);
      navigateToCorrectPage(user);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
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
      setUser(user);
      localStorageHelper.setAuthData(accessToken!, user);
      navigateToCorrectPage(user);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCorrectPage = (user: User) => {
    const role = user?.roles[0]?.toLowerCase();
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
      case "waiter":
        path = "/waiter/dashboard";
        break;
      case "housekeeper":
        path = "/housekeeper/dashboard";
        break;
    }
    toast.success("Đăng nhập thành công!", { toastId: "welcome-back" });
    navigate(path);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ position: "absolute", width: "100%", height: "100%" }}>
        <img
          src={bg}
          alt="bg"
          style={{
            zIndex: -99,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.5,
          }}
        />
      </Box>
      <Box>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Container maxWidth="sm" sx={{ zIndex: 99 }}>
            <Typography
              component="h1"
              variant="h5"
              sx={{ fontWeight: 800, mb: 1, textAlign: "center" }}
            >
              {"Hệ thống quản lý chuỗi khách sạn Tân Trường Sơn".toUpperCase()}
            </Typography>
            <Box
              sx={{
                backgroundColor: "#fff",
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                p: isMobile ? 2 : 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: isMobile ? "center" : "left",
                zIndex: 99,
              }}
            >
              {/* Left: Icon + Description */}
              <Box sx={{ flex: 1, px: 6 }}>
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{ fontWeight: 800, mb: 1, textAlign: "center" }}
                >
                  Đăng nhập
                </Typography>
              </Box>

              {/* Right: Form */}
              <Box sx={{ flex: 1 }}>
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
                    placeholder="Nhập tên đăng nhập"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    placeholder="Nhập mật khẩu"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
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
              </Box>
            </Box>
          </Container>
        </Box>
        <Card sx={{ pb: 2, px: 2, opacity: 1 }}>
          <Stack gap={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign={"center"}
              sx={{ mt: 2, color: "red", fontWeight: "bold" }}
            >
              For development only
            </Typography>
            <Tooltip title="Admin">
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="small"
                startIcon={<Login />}
                onClick={() => superLogin("admin", "Password1@")}
                sx={{ borderRadius: 3, textTransform: "none" }}
              >
                Admin
              </Button>
            </Tooltip>

            <Tooltip title="Manager">
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="small"
                startIcon={<Login />}
                onClick={() => superLogin("manager", "Password1@")}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                }}
              >
                Manager
              </Button>
            </Tooltip>

            <Tooltip title="Frontdesk">
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="small"
                startIcon={<Login />}
                onClick={() => superLogin("frontdesk", "Password1@")}
                sx={{ borderRadius: 3, textTransform: "none" }}
              >
                Frontdesk
              </Button>
            </Tooltip>

            <Tooltip title="Kitchen">
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="small"
                startIcon={<Login />}
                onClick={() => superLogin("kitchen", "Password1@")}
                sx={{ borderRadius: 3, textTransform: "none" }}
              >
                Kitchen
              </Button>
            </Tooltip>

            <Tooltip title="Waiter">
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="small"
                startIcon={<Login />}
                onClick={() => superLogin("waiter", "Password1@")}
                sx={{ borderRadius: 3, textTransform: "none" }}
              >
                Waiter
              </Button>
            </Tooltip>
            <Tooltip title="Housekeeper">
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="small"
                startIcon={<Login />}
                onClick={() => superLogin("housekeeping", "Password1@")}
                sx={{ borderRadius: 3, textTransform: "none" }}
              >
                Housekeeper
              </Button>
            </Tooltip>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;
