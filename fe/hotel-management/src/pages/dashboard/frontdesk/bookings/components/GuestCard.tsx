import React, { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import BadgeIcon from "@mui/icons-material/Badge";
import type { BookingGuestDto } from "../../../../../api/bookingsApi";
import { MoveUp, EventAvailable } from "@mui/icons-material";

type Props = {
  guest: BookingGuestDto;
  typeLabel?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  disabledEdit?: boolean;
  disabledDelete?: boolean;
  disabledChangeRoom?: boolean;
  onChangeRoom?: (guest: BookingGuestDto) => void;
  onExtendStay?: () => void;
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
  onChangeRoom,
  disabledChangeRoom,
  onExtendStay,
}) => {
  const [cccdOpen, setCccdOpen] = useState(false);
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        transition: "all .15s",
        "&:hover": { borderColor: "primary.main", boxShadow: 2 },
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
              CMND/CCCD: {guest.idCard || "—"}
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

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<BadgeIcon />}
            onClick={() => setCccdOpen(true)}
            disabled={!guest.idCardFrontImageUrl && !guest.idCardBackImageUrl}
          >
            Xem CMND/CCCD
          </Button>
        </Stack>
      </CardContent>
      <Dialog
        open={cccdOpen}
        onClose={() => setCccdOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>CMND/CCCD - {guest.fullname || ""}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} alignItems="center">
            <img
              src={guest.idCardFrontImageUrl || ""}
              alt={`${guest.fullname || ""} - Mặt trước`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 10,
                objectFit: "cover",
                border: "1px solid #ddd",
              }}
            />
            <img
              src={guest.idCardBackImageUrl || ""}
              alt={`${guest.fullname || ""} - Mặt sau`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 10,
                objectFit: "cover",
                border: "1px solid #ddd",
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCccdOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <Box
        className="actions"
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {/* Move Guest within booking */}
        <Tooltip title="Chuyển khách">
          <span>
            <IconButton
              color="primary"
              size="small"
              disabled={disabledChangeRoom}
              onClick={() => onChangeRoom?.(guest)}
              aria-label="Chuyển khách"
            >
              <MoveUp fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {/* Edit */}
        <Tooltip title="Chỉnh sửa">
          <span>
            <IconButton
              size="small"
              onClick={onEdit}
              disabled={disabledEdit}
              aria-label="Chỉnh sửa"
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {/* Delete */}
        <Tooltip title="Xoá">
          <span>
            <IconButton
              size="small"
              color="error"
              onClick={onDelete}
              disabled={disabledDelete}
              aria-label="Xoá"
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default GuestCard;
