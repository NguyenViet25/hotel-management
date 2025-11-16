import { zodResolver } from "@hookform/resolvers/zod";
import GroupsIcon from "@mui/icons-material/Groups";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type {
  CreateTableRequest,
  TableDto,
  UpdateTableRequest,
} from "../../../../../api/tablesApi";

type Mode = "create" | "edit";

const schema = z.object({
  name: z.string().min(1, "Tên bàn bắt buộc"),
  capacity: z
    .number("Sức chứa phải là số")
    .min(1, "Tối thiểu 1")
    .max(50, "Tối đa 50"),
  status: z.number(),
  isActive: z.boolean().optional(),
});

interface TableFormModalProps {
  open: boolean;
  mode?: Mode;
  hotelId: string;
  initialValues?: TableDto;
  onClose: () => void;
  onSubmit: (
    payload: CreateTableRequest | UpdateTableRequest
  ) => Promise<void> | void;
}

const TableFormModal: React.FC<TableFormModalProps> = ({
  open,
  mode = "create",
  hotelId,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      capacity: initialValues?.capacity ?? 4,
      status: initialValues?.status ?? 0,
      isActive: initialValues?.isActive ?? true,
    },
  });

  const statusOptions = [
    { value: 0, label: "Sẵn sàng" },
    { value: 1, label: "Đang sử dụng" },
    { value: 2, label: "Đã đặt" },
    { value: 3, label: "Ngừng phục vụ" },
  ];

  const submitHandler = async (values: any) => {
    if (mode === "create") {
      const payload: CreateTableRequest = {
        hotelId,
        name: values.name,
        capacity: values.capacity,
        status: values.status,
        isActive: values.isActive,
      };
      await onSubmit(payload);
    } else if (initialValues) {
      const payload: UpdateTableRequest = {
        name: values.name,
        capacity: values.capacity,
        status: values.status,
        isActive: values.isActive,
      };
      await onSubmit(payload);
    }
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{mode === "create" ? "Thêm bàn" : "Sửa bàn"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                label="Tên bàn"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.name}
                placeholder="Nhập tên bàn"
                helperText={errors.name?.message as string}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TableRestaurantIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="capacity"
            render={({ field }) => (
              <TextField
                label="Sức chứa"
                type="number"
                fullWidth
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.capacity}
                helperText={errors.capacity?.message as string}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupsIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <FormControl fullWidth>
            <InputLabel id="status-label">Trạng thái</InputLabel>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  labelId="status-label"
                  label="Trạng thái"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!errors.status}
                >
                  {statusOptions.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={field.value ? "Hoạt động" : "Vô hiệu"}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ width: "100%", px: 2, pb: 2 }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(submitHandler)}
            disabled={isSubmitting}
          >
            {mode === "create" ? "Tạo" : "Lưu"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default TableFormModal;
