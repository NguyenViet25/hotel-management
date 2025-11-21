import React from "react";
import { Avatar, Box, Card, CardContent, Chip, IconButton, Stack, Typography } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

type Props = {
  name?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
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

const GuestCard: React.FC<Props> = ({ name, phone, email, avatarUrl, typeLabel, onEdit, onDelete, disabledEdit, disabledDelete }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        transition: "all .15s",
        '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
        '&:hover .actions': { opacity: 1 },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={avatarUrl} sx={{ bgcolor: "primary.main" }}>{!avatarUrl ? initials(name) : null}</Avatar>
          <Stack flex={1} spacing={0.25} minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>{name || "—"}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>{phone || "—"}</Typography>
            {email ? <Typography variant="caption" color="text.secondary" noWrap>{email}</Typography> : null}
            {typeLabel ? <Box sx={{ mt: 0.5 }}><Chip size="small" label={typeLabel} /></Box> : null}
          </Stack>
        </Stack>
      </CardContent>
      <Box className="actions" sx={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 0.5, opacity: 0, transition: "opacity 0.2s" }}>
        <IconButton size="small" onClick={onEdit} disabled={disabledEdit} aria-label="Chỉnh sửa">
          <EditOutlined fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={onDelete} disabled={disabledDelete} aria-label="Xoá">
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default GuestCard;