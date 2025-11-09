import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        color: "#333",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography
        variant="h1"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 900,
          fontSize: "8rem",
          color: "#5563DE",
          textShadow: "0 2px 10px rgba(85,99,222,0.15)",
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.05)" },
            "100%": { transform: "scale(1)" },
          },
        }}
      >
        404
      </Typography>

      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 600, color: "#222", mb: 1 }}
      >
        Oops! Không tìm thấy trang này 😥
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#666",
          maxWidth: 400,
          mb: 4,
        }}
      >
        Trang bạn đang cố truy cập không tồn tại hoặc đã được di chuyển sang vị
        trí khác.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          backgroundColor: "#5563DE",
          color: "#fff",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "24px",
          px: 4,
          py: 1.2,
          "&:hover": {
            backgroundColor: "#3b4ac0",
          },
        }}
      >
        Về trang chủ
      </Button>
    </Box>
  );
};

export default NotFoundPage;
