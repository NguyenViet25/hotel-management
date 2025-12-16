import React from "react";
import Warning from "@mui/icons-material/Warning";
import type { SvgIconProps } from "@mui/material";
import { Box } from "@mui/material";

const FloatingWarningIcon: React.FC<SvgIconProps> = ({ sx, ...props }) => {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "floatY 2s ease-in-out infinite",
        "@keyframes floatY": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
          "100%": { transform: "translateY(0)" },
        },
      }}
    >
      <Warning
        {...props}
        sx={{
          // slight pulse to attract attention without being distracting
          animation: "pulseScale 2.4s ease-in-out infinite",
          "@keyframes pulseScale": {
            "0%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.08)" },
            "100%": { transform: "scale(1)" },
          },
          ...sx,
        }}
      />
    </Box>
  );
};

export default FloatingWarningIcon;

