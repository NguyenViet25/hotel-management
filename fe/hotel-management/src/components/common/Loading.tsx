import { Box, Typography, useTheme, type SxProps, type Theme } from "@mui/material";
import ClipLoader from "react-spinners/ClipLoader";
import React from "react";

export type LoadingProps = {
  size?: number;
  color?: string;
  label?: string;
  overlay?: boolean;
  fullscreen?: boolean;
  sx?: SxProps<Theme>;
};

const Loading: React.FC<LoadingProps> = ({
  size = 28,
  color,
  label,
  overlay,
  fullscreen,
  sx,
}) => {
  const theme = useTheme();
  const spinnerColor = color || theme.palette.primary.main;
  const containerSx: SxProps<Theme> = fullscreen
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.06)",
      }
    : overlay
    ? {
        position: "absolute",
        inset: 0,
        zIndex: 9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.6)",
      }
    : {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };

  return (
    <Box sx={{ ...containerSx, ...sx }}>
      <Box display="flex" alignItems="center" gap={1}>
        <ClipLoader size={size} color={spinnerColor} />
        {label && <Typography variant="body2">{label}</Typography>}
      </Box>
    </Box>
  );
};

export default Loading;

