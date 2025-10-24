import {
  Box,
  Divider,
  FormHelperText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HotelIcon from "@mui/icons-material/Hotel";

declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const { loginWithGoogle, isAuthenticated, setPropertyId } = useAuth();
  const navigate = useNavigate();
  const googleDivRef = useRef<HTMLDivElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) navigate("/profile", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google && clientId && googleDivRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            setPropertyId(selectedProperty);
            loginWithGoogle(response.credential);
            navigate("/profile", { replace: true });
          }
        },
      });
      window.google.accounts.id.renderButton(googleDivRef.current, {
        theme: "filled_blue",
        size: "large",
        shape: "pill",
        text: "signin_with",
        logo_alignment: "left",
        width: 320,
      });
    }
  }, [loginWithGoogle, navigate, selectedProperty, setPropertyId]);

  const showGoogleWarning = !import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e6edf5 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 460,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 1.5,
              bgcolor: "primary.main",
              color: "common.white",
              display: "grid",
              placeItems: "center",
            }}
          >
            <HotelIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Hệ thống quản lý khách sạn
          </Typography>
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            Vui lòng chọn cơ sở trước khi đăng nhập bằng Google
          </Typography>

          <Stack spacing={1} sx={{ width: "100%" }}>
            <Select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              displayEmpty
              fullWidth
              size="small"
            >
              <MenuItem value="">
                <em>Chọn cơ sở...</em>
              </MenuItem>
              <MenuItem value="A">Hotel A</MenuItem>
              <MenuItem value="B">Hotel B</MenuItem>
            </Select>
            {!selectedProperty && (
              <FormHelperText error>Hãy chọn cơ sở để tiếp tục.</FormHelperText>
            )}
          </Stack>

          <Divider sx={{ width: "100%", my: 1 }} />

          {showGoogleWarning ? (
            <Typography color="error" sx={{ textAlign: "center" }}>
              Thiếu VITE_GOOGLE_CLIENT_ID. Cập nhật .env và khởi động lại.
            </Typography>
          ) : (
            <>
              <Box sx={{ my: 1 }}>
                <div ref={googleDivRef} />
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
