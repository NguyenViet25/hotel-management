import React from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";

type Props = {
  subtotal: number;
  vat: number;
  serviceCharge?: number;
  discount?: number;
  total: number;
  appliedPromoCode?: string;
};

const InvoiceSummary: React.FC<Props> = ({ subtotal, vat, serviceCharge = 0, discount = 0, total, appliedPromoCode }) => {
  return (
    <Box sx={{ position: { md: "sticky" }, top: 16 }}>
      <Stack spacing={1} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Tạm tính</Typography>
          <Typography fontWeight={700}>{subtotal.toLocaleString()} đ</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography>VAT (10%)</Typography>
          <Typography fontWeight={700}>{vat.toLocaleString()} đ</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Phí dịch vụ</Typography>
          <Typography fontWeight={700}>{serviceCharge.toLocaleString()} đ</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Giảm giá</Typography>
          <Typography fontWeight={700}>-{discount.toLocaleString()} đ</Typography>
        </Stack>
        {appliedPromoCode && (
          <Typography variant="caption" color="text.secondary">Đã áp dụng mã {appliedPromoCode}</Typography>
        )}
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Typography>Tổng cộng</Typography>
          <Typography fontWeight={800} color="primary">{total.toLocaleString()} đ</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default InvoiceSummary;