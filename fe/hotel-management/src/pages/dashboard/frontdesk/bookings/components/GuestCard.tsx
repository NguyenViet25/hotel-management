import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import type { BookingGuestDto } from "../../../../../api/bookingsApi";

type Props = {
  guest: BookingGuestDto;
  typeLabel?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  disabledEdit?: boolean;
  disabledDelete?: boolean;
};

const initials = (s?: string) => {
  const t = (s || "").trim();
  if (!t) return "?";
  const parts = t.split(" ").filter(Boolean);
  if (!parts.length) return t.charAt(0).toUpperCase();
  const a = parts[0].charAt(0);
  const b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return `${a}${b}`.toUpperCase();
};

const GuestCard: React.FC<Props> = ({
  guest,
  typeLabel,
  onEdit,
  onDelete,
  disabledEdit,
  disabledDelete,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        transition: "all .15s",
        "&:hover": { borderColor: "primary.main", boxShadow: 2 },
        "&:hover .actions": { opacity: 1 },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={""} sx={{ bgcolor: "primary.main" }}>
            {initials(guest.fullname)}
          </Avatar>
          <Stack flex={1} spacing={0.25} minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              Họ và tên: {guest.fullname || "—"}
            </Typography>

            <Typography variant="body2" color="text.secondary" noWrap>
              SĐT: {guest.phone || "—"}
            </Typography>
            {guest.email ? (
              <Typography variant="caption" color="text.secondary" noWrap>
                Email: {guest.email}
              </Typography>
            ) : null}
            {typeLabel ? (
              <Box sx={{ mt: 0.5 }}>
                <Chip size="small" label={typeLabel} />
              </Box>
            ) : null}
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" noWrap>
          CMND/CCCD: {guest.idCard || "—"}
        </Typography>
        <Stack spacing={2} direction="row" alignItems="center">
          {/* Front Image */}
          <img
            src={guest.idCardFrontImageUrl || ""}
            alt={`${guest.fullname || ""} - Mặt trước`}
            style={{
              width: "100%",
              height: 160,
              borderRadius: 10,
              objectFit: "contain",
              border: "1px solid #ddd",
            }}
          />

          {/* Back Image */}
          <img
            src={guest.idCardBackImageUrl || ""}
            alt={`${guest.fullname || ""} - Mặt sau`}
            style={{
              width: "100%",

              borderRadius: 10,
              objectFit: "contain",
              border: "1px solid #ddd",
            }}
          />
        </Stack>
      </CardContent>
      <Box
        className="actions"
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          display: "flex",
          gap: 0.5,
          opacity: 0,
          transition: "opacity 0.2s",
        }}
      >
        <IconButton
          size="small"
          onClick={onEdit}
          disabled={disabledEdit}
          aria-label="Chỉnh sửa"
        >
          <EditOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
          disabled={disabledDelete}
          aria-label="Xoá"
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default GuestCard;
