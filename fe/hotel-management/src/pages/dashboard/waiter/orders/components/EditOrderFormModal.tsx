import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ordersApi, { type OrderDetailsDto, type OrderStatus, type UpdateOrderDto } from "../../../../../api/ordersApi";

interface EditOrderFormModalProps {
  open: boolean;
  onClose: () => void;
  order?: OrderDetailsDto | null;
  onSubmitted?: () => void;
}

interface FormValues {
  status: OrderStatus;
  notes?: string;
  discountCode?: string;
}

// Modal to edit order status/notes and optionally apply a discount code
const EditOrderFormModal: React.FC<EditOrderFormModalProps> = ({ open, onClose, order, onSubmitted }) => {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      status: order?.status ?? "Draft",
      notes: order?.notes ?? "",
      discountCode: "",
    },
    values: {
      status: order?.status ?? "Draft",
      notes: order?.notes ?? "",
      discountCode: "",
    },
  });

  const submit = async (values: FormValues) => {
    if (!order) return;
    try {
      // Update order notes/status
      const payload: UpdateOrderDto = { status: values.status, notes: values.notes || undefined };
      await ordersApi.update(order.id, payload);

      // Apply discount code if provided
      if (values.discountCode && values.discountCode.trim().length > 0) {
        await ordersApi.applyDiscount(order.id, { code: values.discountCode.trim() });
      }

      onSubmitted?.();
      onClose();
      reset({ status: order.status, notes: order.notes ?? "", discountCode: "" });
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chỉnh sửa order</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField select label="Trạng thái" {...field}>
                <MenuItem value="Draft">Nháp</MenuItem>
                <MenuItem value="Serving">Đang phục vụ</MenuItem>
                <MenuItem value="Paid">Đã thanh toán</MenuItem>
                <MenuItem value="Cancelled">Đã hủy</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField label="Ghi chú" multiline minRows={2} {...field} />
            )}
          />

          <Controller
            name="discountCode"
            control={control}
            render={({ field }) => (
              <TextField label="Mã giảm giá (tuỳ chọn)" {...field} />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit(submit)}>Lưu thay đổi</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderFormModal;