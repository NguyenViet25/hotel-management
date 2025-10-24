import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1E88E5" },
    secondary: { main: "#7E57C2" },
    success: { main: "#43A047" },
    warning: { main: "#FB8C00" },
    error: { main: "#E53935" },
    background: {
      default: "#f6f9fc",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
    h5: { fontWeight: 600 },
    subtitle2: { color: "#6b7280" },
  },
});

export default theme;
