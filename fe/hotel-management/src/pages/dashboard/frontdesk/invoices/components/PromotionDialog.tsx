import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Card,
  Chip,
  Box,
  Avatar,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import discountCodesApi, {
  type DiscountCode,
} from "../../../../../api/discountCodesApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (code: DiscountCode) => void;
};

const PromotionDialog: React.FC<Props> = ({ open, onClose, onApply }) => {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    try {
      const res = await discountCodesApi.list();
      if (res.isSuccess && res.data) setCodes(res.data);
    } catch {}
  };

  useEffect(() => {
    if (open) fetch();
  }, [open]);

  const filtered = codes.filter((c) => {
    const s = search.toLowerCase();
    return (
      c.code.toLowerCase().includes(s) ||
      (c.description || "").toLowerCase().includes(s)
    );
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Áp dụng khuyến mãi</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Tìm kiếm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <Stack spacing={2} sx={{ cursor: "pointer" }}>
            {filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Không tìm thấy mã khuyến mãi
              </Typography>
            )}
            {filtered.map((c) => (
              <Card
                key={c.id}
                variant="outlined"
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  p: 2,
                  boxShadow: 2,
                  borderRadius: 3,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 6,
                  },
                  gap: 2,
                  background: "#f9f9ff",
                }}
              >
                <Avatar sx={{ bgcolor: "#3f51b5", mr: 2 }}>
                  <LocalOfferIcon />
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã
                  </Typography>
                  <Typography variant="h6">{c.code}</Typography>
                </Box>

                <Box sx={{ flex: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1">
                    {c.description || "-"}
                  </Typography>
                </Box>

                <Box sx={{ width: 120, textAlign: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Giá trị
                  </Typography>
                  <Chip
                    label={`${c.value}%`}
                    color="success"
                    sx={{ fontWeight: "bold", mt: 0.5 }}
                  />
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: { xs: 1, sm: 0 } }}
                  onClick={() => {
                    onApply(c);
                    onClose();
                  }}
                >
                  Áp dụng
                </Button>
              </Card>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromotionDialog;
