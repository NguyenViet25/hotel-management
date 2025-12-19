import { Box, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import InboxIcon from "@mui/icons-material/Inbox";

export type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  height?: number | string;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Không có dữ liệu",
  description,
  icon,
  actions,
  height = 240,
}) => {
  const IconEl = icon || <InboxIcon fontSize="large" color="disabled" />;
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        borderStyle: "dashed",
        background:
          "linear-gradient(135deg, rgba(245,247,250,0.8) 0%, rgba(250,250,252,0.9) 100%)",
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1.5}
        sx={{ minHeight: height, textAlign: "center" }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.04), rgba(0,0,0,0.02))",
          }}
        >
          {IconEl}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        {actions}
      </Stack>
    </Paper>
  );
};

export default EmptyState;
