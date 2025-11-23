import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import discountCodesApi, { type DiscountCode } from "../../../../../api/discountCodesApi";

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Áp dụng khuyến mãi</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <TextField label="Tìm kiếm" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
          <Stack spacing={1}>
            {filtered.map((c) => (
              <Stack key={c.id} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                <TextField label="Mã" value={c.code} InputProps={{ readOnly: true }} sx={{ flex: 1 }} />
                <TextField label="Mô tả" value={c.description || ""} InputProps={{ readOnly: true }} sx={{ flex: 2 }} />
                <TextField label="Giá trị (%)" value={c.value} InputProps={{ readOnly: true }} sx={{ width: 160 }} />
                <Button variant="contained" onClick={() => { onApply(c); onClose(); }}>Áp dụng</Button>
              </Stack>
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