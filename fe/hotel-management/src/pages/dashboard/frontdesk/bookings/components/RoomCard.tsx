import React from "react";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { RoomMapItemDto } from "../../../../../api/bookingsApi";

type Props = {
  room: RoomMapItemDto;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  statusLabel: string;
  statusColor: string;
};

const RoomCard: React.FC<Props> = ({
  room,
  selected,
  disabled,
  onClick,
  statusLabel,
  statusColor,
}) => {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      sx={{
        width: 220,
        borderRadius: 3,
        boxShadow: selected ? 6 : 2,
        border: selected ? "2px solid" : "1px solid rgba(0,0,0,0.06)",
        borderColor: selected ? "primary.main" : "divider",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        transform: selected ? "translateY(-2px) scale(1.02)" : "none",
        bgcolor: disabled ? "action.disabledBackground" : "background.paper",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        "&:hover": {
          boxShadow: 6,
          transform: disabled ? "none" : "translateY(-2px) scale(1.02)",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" fontWeight={800}>
              Phòng #{room.roomNumber}
            </Typography>
            <Chip
              label={room.roomTypeName}
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                height: "auto",
                "& .MuiChip-label": {
                  padding: "4px 8px",
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                },
              }}
            />
          </Stack>
          <Chip
            label={statusLabel}
            size="small"
            sx={{ bgcolor: statusColor, color: "white", borderRadius: 1 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
