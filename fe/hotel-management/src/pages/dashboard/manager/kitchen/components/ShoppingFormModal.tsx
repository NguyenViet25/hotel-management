import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Close, Save, AddCircle, RemoveCircle, EventNote, ShoppingCart } from "@mui/icons-material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { ShoppingListRequestDto, ShoppingItemDto } from "../../../../../api/kitchenApi";

// Form value types derived from API models
type FormValues = {
  orderDate: Dayjs;
  notes?: string;
  shoppingItems: ShoppingItemDto[];
};

// Validation schema for create/edit
const schema = z.object({
  orderDate: z.custom<Dayjs>((v) => dayjs.isDayjs(v), {
    message: "Ngày mua không hợp lệ",
  }),
  notes: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
  shoppingItems: z
    .array(
      z.object({
        name: z.string().min(1, "Tên nguyên liệu bắt buộc").max(200),
        quantity: z.string().min(1, "Số lượng bắt buộc").max(50),
        unit: z.string().min(1, "Đơn vị bắt buộc").max(50),
      })
    )
    .min(1, "Vui lòng thêm ít nhất 1 nguyên liệu"),
});

export interface ShoppingFormModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: Partial<ShoppingListRequestDto>;
  defaultOrderDate?: Dayjs; // prefill when creating from a specific day
  onSubmit: (payload: ShoppingListRequestDto) => Promise<void> | void;
  hotelId: string;
}

// Dialog-based form for creating or editing a shopping list
const ShoppingFormModal: React.FC<ShoppingFormModalProps> = ({
  open,
  onClose,
  mode = "create",
  initialValues,
  defaultOrderDate,
  onSubmit,
  hotelId,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderDate: defaultOrderDate ?? dayjs(),
      notes: initialValues?.notes ?? "",
      shoppingItems:
        initialValues?.shoppingItems && initialValues.shoppingItems.length > 0
          ? initialValues.shoppingItems
          : [{ name: "", quantity: "", unit: "kg" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "shoppingItems",
  });

  // When switching to edit mode or initialValues change, rehydrate form
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("orderDate", initialValues.orderDate ? dayjs(initialValues.orderDate) : dayjs());
      setValue("notes", initialValues.notes ?? "");
      setValue(
        "shoppingItems",
        initialValues.shoppingItems && initialValues.shoppingItems.length > 0
          ? initialValues.shoppingItems
          : [{ name: "", quantity: "", unit: "kg" }]
      );
    }
  }, [mode, initialValues]);

  const submitHandler = async (values: FormValues) => {
    const payload: ShoppingListRequestDto = {
      orderDate: values.orderDate.toDate().toISOString(),
      hotelId,
      notes: values.notes || "",
      shoppingItems: values.shoppingItems,
    };
    await onSubmit(payload);
    reset();
    onClose();
  };

  const unitOptions = [
    { value: "kg", label: "Kg" },
    { value: "g", label: "Gram" },
    { value: "lít", label: "Lít" },
    { value: "ml", label: "Ml" },
    { value: "chai", label: "Chai" },
    { value: "bó", label: "Bó" },
    { value: "cái", label: "Cái" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle fontWeight={600}>
        {mode === "create" ? "Tạo yêu cầu mua nguyên liệu" : "Chỉnh sửa yêu cầu mua nguyên liệu"}
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Order date */}
            <Controller
              control={control}
              name="orderDate"
              render={({ field }) => (
                <DatePicker
                  label="Ngày mua"
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? dayjs())}
                />
              )}
            />
            {/* Notes */}
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <TextField
                  label="Ghi chú"
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventNote />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Shopping items list */}
            <Stack spacing={1}>
              {fields.map((item, index) => (
                <Stack key={item.id} direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
                  <Controller
                    control={control}
                    name={`shoppingItems.${index}.name` as const}
                    render={({ field }) => (
                      <TextField
                        label="Tên nguyên liệu"
                        fullWidth
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.shoppingItems?.[index]?.name}
                        helperText={errors.shoppingItems?.[index]?.name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ShoppingCart />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`shoppingItems.${index}.quantity` as const}
                    render={({ field }) => (
                      <TextField
                        label="Số lượng"
                        fullWidth
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.shoppingItems?.[index]?.quantity}
                        helperText={errors.shoppingItems?.[index]?.quantity?.message}
                      />
                    )}
                  />
                  <FormControl fullWidth>
                    <InputLabel id={`unit-label-${index}`}>Đơn vị</InputLabel>
                    <Controller
                      control={control}
                      name={`shoppingItems.${index}.unit` as const}
                      render={({ field }) => (
                        <Select
                          labelId={`unit-label-${index}`}
                          label="Đơn vị"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          error={!!errors.shoppingItems?.[index]?.unit}
                        >
                          {unitOptions.map((u) => (
                            <MenuItem key={u.value} value={u.value}>
                              {u.label}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                  <IconButton color="error" onClick={() => remove(index)} aria-label="Xóa dòng">
                    <RemoveCircle />
                  </IconButton>
                </Stack>
              ))}
              <Button startIcon={<AddCircle />} onClick={() => append({ name: "", quantity: "", unit: "kg" })}>
                Thêm nguyên liệu
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ width: "100%", px: 2, pb: 2 }}>
          <Button startIcon={<Close />} variant="outlined" color="inherit" onClick={onClose}>
            Hủy
          </Button>
          <Button startIcon={<Save />} variant="contained" onClick={handleSubmit(submitHandler)} disabled={isSubmitting}>
            {mode === "create" ? "Tạo" : "Lưu"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ShoppingFormModal;