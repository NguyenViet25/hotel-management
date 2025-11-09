import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import menusApi, { type MenuItemDto } from "../../../../../api/menusApi";
import ordersApi, { type CreateWalkInOrderDto, type OrderItemInputDto } from "../../../../../api/ordersApi";

interface WalkInOrderFormModalProps {
  open: boolean;
  onClose: () => void;
  hotelId?: string;
  onSubmitted?: () => void;
}

interface FormValues {
  customerName: string;
  customerPhone?: string;
  items: OrderItemInputDto[];
}

// Modal for UC-28: Create walk-in order
// - Fetches active menu items to select and add quantities
// - Submits to ordersApi.createWalkIn
const WalkInOrderFormModal: React.FC<WalkInOrderFormModalProps> = ({ open, onClose, hotelId, onSubmitted }) => {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { customerName: "", customerPhone: "", items: [] },
  });
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoadingItems(true);
      try {
        const res = await menusApi.getMenuItems({ page: 1, pageSize: 100, isActive: true });
        if (res.isSuccess) setMenuItems(res.data);
      } catch {}
      setLoadingItems(false);
    };
    if (open) fetchMenuItems();
  }, [open]);

  const addItemRow = (values: FormValues) => {
    const next: FormValues = { ...values, items: [...values.items, { menuItemId: "", quantity: 1 }] };
    reset(next);
  };

  const removeItemRow = (values: FormValues, index: number) => {
    const nextItems = values.items.filter((_, i) => i !== index);
    reset({ ...values, items: nextItems });
  };

  const submit = async (values: FormValues) => {
    const payload: CreateWalkInOrderDto = {
      hotelId: hotelId ?? "",
      customerName: values.customerName,
      customerPhone: values.customerPhone || undefined,
      items: values.items.filter((i) => i.menuItemId && i.quantity > 0),
    };
    try {
      const res = await ordersApi.createWalkIn(payload);
      if (res.isSuccess) {
        onSubmitted?.();
        onClose();
        reset({ customerName: "", customerPhone: "", items: [] });
      }
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo order khách vãng lai</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Customer info minimal per UC-28 */}
          <Controller
            name="customerName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField label="Tên khách" required {...field} />
            )}
          />

          <Controller
            name="customerPhone"
            control={control}
            render={({ field }) => (
              <TextField label="SĐT (tuỳ chọn)" {...field} />
            )}
          />

          {/* Items selection: dynamic rows */}
          <Controller
            name="items"
            control={control}
            render={({ field }) => (
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1">Món ăn</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addItemRow(field.value as FormValues["items"] as any)}
                  >
                    Thêm món
                  </Button>
                </Stack>
                {(field.value || []).map((item, idx) => (
                  <Stack key={idx} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                    <TextField
                      select
                      label="Chọn món"
                      value={item.menuItemId}
                      onChange={(e) => {
                        const next = [...field.value];
                        next[idx] = { ...item, menuItemId: e.target.value };
                        field.onChange(next);
                      }}
                      sx={{ minWidth: 240 }}
                      disabled={loadingItems}
                    >
                      {menuItems.map((mi) => (
                        <MenuItem key={mi.id} value={mi.id}>
                          {mi.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      type="number"
                      label="Số lượng"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...field.value];
                        next[idx] = { ...item, quantity: Math.max(1, Number(e.target.value || 1)) };
                        field.onChange(next);
                      }}
                      sx={{ width: 140 }}
                      inputProps={{ min: 1 }}
                    />

                    <IconButton color="error" onClick={() => removeItemRow({ customerName: "", customerPhone: "", items: field.value }, idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit(submit)}>Tạo order</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalkInOrderFormModal;