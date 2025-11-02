import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { loginWithCredentials } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First check for admin credentials
      const { username, password } = formData;
      const isAdminLogin = await loginWithCredentials(username, password);

      if (isAdminLogin) {
        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
        return;
      }

      // If not admin, try regular API login
      try {
        const response = await axiosInstance.post("/auth/login", formData);
        const { token, user } = response.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role
        const role = user.role;
        let redirectPath = "/dashboard";

        // Determine redirect path based on role
        switch (role) {
          case "admin":
            redirectPath = "/admin/dashboard";
            break;
          case "facilityManager":
            redirectPath = "/manager/dashboard";
            break;
          case "frontDesk":
            redirectPath = "/frontdesk/dashboard";
            break;
          // Add other roles as needed
        }

        toast.success("Login successful!");
        navigate(redirectPath);
      } catch (error) {
        console.error("API login failed:", error);
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login functionality
    toast.info("Google login will be implemented");
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
        backgroundImage: "url(/hotel-background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Hotel Management System
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={3}>
            Sign in to your account
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Divider sx={{ width: "100%", my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mt: 1, mb: 2 }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
