import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CreditCard as CreditCardIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import React from "react";
import { type GuestDto } from "../../../../../api/guestsApi";

interface Props {
  open: boolean;
  guest?: GuestDto | null;
  onClose: () => void;
}

const GuestDetailsModal: React.FC<Props> = ({ open, guest, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="h6">
            {guest?.fullName || "Chi tiết khách"}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip icon={<PhoneIcon />} label={guest?.phone || "—"} />
            <Chip icon={<EmailIcon />} label={guest?.email || "—"} />
            <Chip icon={<CreditCardIcon />} label={guest?.idCard || "—"} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Mặt trước
              </Typography>
              {guest?.idCardFrontImageUrl ? (
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={guest.idCardFrontImageUrl}
                    alt="ID front"
                    style={{ width: "100%", height: 180, objectFit: "cover" }}
                  />
                </Box>
              ) : (
                <Chip
                  icon={<VisibilityIcon />}
                  label="Chưa có ảnh"
                  variant="outlined"
                />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Mặt sau
              </Typography>
              {guest?.idCardBackImageUrl ? (
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={guest.idCardBackImageUrl}
                    alt="ID back"
                    style={{ width: "100%", height: 180, objectFit: "cover" }}
                  />
                </Box>
              ) : (
                <Chip
                  icon={<VisibilityIcon />}
                  label="Chưa có ảnh"
                  variant="outlined"
                />
              )}
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestDetailsModal;
