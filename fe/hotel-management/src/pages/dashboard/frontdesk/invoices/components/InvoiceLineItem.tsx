import React from "react";
import { IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export type InvoiceLine = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type Props = {
  value: InvoiceLine;
  onChange: (next: InvoiceLine) => void;
  onRemove?: () => void;
};

const InvoiceLineItem: React.FC<Props> = ({ value, onChange, onRemove }) => {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
      <TextField
        label="Mô tả"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        fullWidth
      />
      <TextField
        type="number"
        label="Số lượng"
        value={value.quantity}
        onChange={(e) => onChange({ ...value, quantity: Math.max(1, Number(e.target.value) || 1) })}
        fullWidth
        InputProps={{ inputProps: { min: 1 } }}
      />
      <TextField
        type="number"
        label="Đơn giá"
        value={value.unitPrice}
        onChange={(e) => onChange({ ...value, unitPrice: Math.max(0, Number(e.target.value) || 0) })}
        fullWidth
        InputProps={{
          startAdornment: <InputAdornment position="start">VND</InputAdornment>,
          inputProps: { min: 0 },
        }}
      />
      <Stack direction="row" alignItems="center" spacing={1}>
        <TextField
          label="Thành tiền"
          value={(value.quantity * value.unitPrice).toLocaleString() + " đ"}
          fullWidth
          InputProps={{ readOnly: true }}
        />
        {onRemove && (
          <IconButton color="error" onClick={onRemove}>
            <DeleteIcon />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};

export default InvoiceLineItem;