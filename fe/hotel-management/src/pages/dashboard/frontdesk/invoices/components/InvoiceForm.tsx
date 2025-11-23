import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import InvoiceLineItem, { type InvoiceLine } from "./InvoiceLineItem";
import PromotionDialog from "./PromotionDialog";
import InvoiceSummary from "./InvoiceSummary";

type Props = {
  mode?: "walkin" | "booking";
  initialLines?: InvoiceLine[];
  onSave?: (payload: {
    lines: InvoiceLine[];
    discountCode?: string;
  }) => Promise<void> | void;
};

const InvoiceForm: React.FC<Props> = ({
  mode = "walkin",
  initialLines = [],
  onSave,
}) => {
  const [lines, setLines] = useState<InvoiceLine[]>(initialLines);
  const [promoOpen, setPromoOpen] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | undefined>(undefined);

  const subtotal = useMemo(
    () => lines.reduce((acc, cur) => acc + cur.quantity * cur.unitPrice, 0),
    [lines]
  );
  const vat = useMemo(() => Math.round(subtotal * 0.1), [subtotal]);
  const discount = useMemo(() => 0, []);
  const serviceCharge = useMemo(() => 0, []);
  const total = useMemo(
    () => subtotal + vat + serviceCharge - discount,
    [subtotal, vat, serviceCharge, discount]
  );

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  const updateLine = (index: number, next: InvoiceLine) =>
    setLines((prev) => prev.map((l, i) => (i === index ? next : l)));
  const removeLine = (index: number) =>
    setLines((prev) => prev.filter((_, i) => i !== index));

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              {mode === "walkin"
                ? "Hóa đơn khách vãng lai"
                : "Hóa đơn đặt phòng"}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={addLine}>
                Thêm dòng
              </Button>
              <Button variant="outlined" onClick={() => setPromoOpen(true)}>
                Khuyến mãi
              </Button>
            </Stack>
          </Stack>
          <Divider />

          <Stack spacing={2}>
            {lines.map((l, idx) => (
              <InvoiceLineItem
                key={idx}
                value={l}
                onChange={(next) => updateLine(idx, next)}
                onRemove={() => removeLine(idx)}
              />
            ))}
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                await onSave?.({ lines, discountCode: appliedCode });
              }}
            >
              Lưu hóa đơn
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => window.print()}
            >
              In
            </Button>
          </Stack>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <InvoiceSummary
          subtotal={subtotal}
          vat={vat}
          serviceCharge={serviceCharge}
          discount={discount}
          total={total}
          appliedPromoCode={appliedCode}
        />
        <Box mt={2}>
          <TextField
            label="Mã khuyến mãi"
            fullWidth
            value={appliedCode || ""}
            onChange={(e) => setAppliedCode(e.target.value || undefined)}
          />
        </Box>
      </Grid>

      <PromotionDialog
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        onApply={(code) => setAppliedCode(code.code)}
      />
    </Grid>
  );
};

export default InvoiceForm;
